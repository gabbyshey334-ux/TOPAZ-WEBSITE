// @ts-ignore — npm specifier resolved by Deno / Supabase runtime
import Stripe from 'npm:stripe@17';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://topaz-website.vercel.app';

type CartItem = {
  productId: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

Deno.serve(async (req: Request) => {
  // CORS pre-flight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  if (!STRIPE_SECRET_KEY) {
    console.error('[create-checkout-session] STRIPE_SECRET_KEY not set');
    return new Response(JSON.stringify({ error: 'Payment service not configured' }), { status: 500 });
  }

  let body!: {
    items: CartItem[];
    customerEmail?: string;
    customerName: string;
    notes?: string;
    shippingAddress?: string;
    phone?: string;
  };

  try {
    body = await req.json();
    if (!body.items?.length) throw new Error('Cart is empty');
    if (!body.customerName?.trim()) throw new Error('Name required');
    const addr = (body.shippingAddress ?? '').trim();
    if (addr.length < 8) throw new Error('A full shipping or pickup address is required');
    const em = (body.customerEmail ?? '').trim();
    if (em && !em.includes('@')) throw new Error('Invalid email');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);

  const lineItems = body.items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: `${item.name} — Size ${item.size}`,
      },
      unit_amount: Math.round(item.unitPrice * 100), // cents
    },
    quantity: item.quantity,
  }));

  try {
    const emailTrim = (body.customerEmail ?? '').trim();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      ...(emailTrim.includes('@') ? { customer_email: emailTrim } : {}),
      success_url: `${SITE_URL}/shop?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/shop?payment=cancelled`,
      metadata: {
        customerName: body.customerName.trim().slice(0, 500),
        notes: (body.notes ?? '').trim().slice(0, 500),
        shippingAddress: (body.shippingAddress ?? '').trim().slice(0, 500),
        phone: (body.phone ?? '').trim().slice(0, 100),
      },
      // Shipping is handled manually by Nick
      phone_number_collection: { enabled: false },
    });

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('[create-checkout-session] Stripe error:', err);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), { status: 500 });
  }
});
