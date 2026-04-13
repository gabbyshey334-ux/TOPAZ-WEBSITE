// @ts-ignore — npm specifier resolved by Deno / Supabase runtime
import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // ── Signature verification ─────────────────────────────────────────────────
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    console.error('[stripe-webhook] Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  const rawBody = await req.arrayBuffer();
  const rawBodyStr = new TextDecoder().decode(rawBody);

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBodyStr, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return new Response(`Webhook signature invalid: ${String(err)}`, { status: 400 });
  }

  // ── Acknowledge immediately — Stripe requires a fast 2xx ──────────────────
  // We process the event after returning, via a non-blocking pattern.
  // In practice DB inserts are fast enough, but we kick off processing here
  // and let it run while returning.
  const response = new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

  // Process the event (synchronous — fast enough for Stripe's 30s timeout)
  try {
    await handleEvent(event, stripe);
  } catch (err) {
    // Log but don't affect the 200 we already formed
    console.error('[stripe-webhook] handleEvent error:', err);
  }

  return response;
});

async function handleEvent(event: Stripe.Event, stripe: Stripe) {
  if (event.type === 'checkout.session.completed') {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, stripe);
    return;
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as Stripe.PaymentIntent;
    console.warn('[stripe-webhook] Payment failed for intent:', pi.id);
    return;
  }

  // All other events — acknowledge and ignore
  console.log('[stripe-webhook] Unhandled event type:', event.type);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session, stripe: Stripe) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // ── Guard against duplicate processing ────────────────────────────────────
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('payment_reference', session.id)
    .maybeSingle();

  if (existing) {
    console.log('[stripe-webhook] Order already exists for session:', session.id);
    return;
  }

  // ── Retrieve line items from Stripe ───────────────────────────────────────
  let lineItems: Stripe.LineItem[] = [];
  try {
    const result = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
    lineItems = result.data;
  } catch (err) {
    console.error('[stripe-webhook] Failed to fetch line items:', err);
  }

  // Map Stripe line items back to our order items format.
  // Name format from create-checkout-session: "Product Name — Size X"
  const orderItems = lineItems.map((li) => {
    const fullName = li.description ?? '';
    const dashIdx = fullName.lastIndexOf(' — Size ');
    const productName = dashIdx > -1 ? fullName.slice(0, dashIdx) : fullName;
    const size = dashIdx > -1 ? fullName.slice(dashIdx + 8) : 'N/A';
    return {
      product_name: productName,
      size,
      quantity: li.quantity ?? 1,
      unit_price: ((li.price?.unit_amount ?? 0) / 100),
      product_id: null,
    };
  });

  const customerName = session.metadata?.customerName ?? session.customer_details?.name ?? 'Unknown';
  const customerEmail = session.customer_email ?? session.customer_details?.email ?? '';
  const notes = session.metadata?.notes ?? null;
  const totalAmount = (session.amount_total ?? 0) / 100;

  // ── Insert order into database ─────────────────────────────────────────────
  const { data: order, error: insertErr } = await supabase
    .from('orders')
    .insert({
      customer_name: customerName,
      customer_email: customerEmail,
      items: orderItems,
      total_amount: totalAmount,
      status: 'paid',
      payment_reference: session.id,
      notes: notes || null,
    })
    .select('id')
    .single();

  if (insertErr || !order) {
    console.error('[stripe-webhook] Failed to insert order:', insertErr);
    return;
  }

  console.log('[stripe-webhook] Order created:', order.id, 'for session:', session.id);

  // ── Fire order notification to Nick (best-effort) ─────────────────────────
  try {
    await supabase.functions.invoke('send-order-notification', {
      body: {
        order_id: order.id,
        customer_name: customerName,
        customer_email: customerEmail,
        items: orderItems,
        total_amount: totalAmount,
        notes: notes ?? undefined,
      },
    });
  } catch (err) {
    console.warn('[stripe-webhook] Notification failed (non-critical):', err);
  }
}
