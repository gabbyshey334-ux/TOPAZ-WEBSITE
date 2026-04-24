import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ADMIN_EMAIL = 'topaz2.0@yahoo.com';
const FROM_EMAIL = 'TOPAZ 2.0 <noreply@dancetopaz.com>';

interface OrderItem {
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

interface OrderPayload {
  order_id: string;
  customer_name: string;
  customer_email: string;
  items: OrderItem[];
  total_amount: number;
  notes?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: OrderPayload = await req.json();
    const { order_id, customer_name, customer_email, items, total_amount, notes } = payload;

    const itemsHtml = items.map(item =>
      `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.size}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${(item.unit_price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join('');

    const itemsText = items.map(item =>
      `  - ${item.product_name} (Size: ${item.size}) x${item.quantity} = $${(item.unit_price * item.quantity).toFixed(2)}`
    ).join('\n');

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1F4E78;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">TOPAZ<span style="color:#60a5fa;">2.0</span></h1>
      <p style="color:#93c5fd;margin:8px 0 0;font-size:14px;letter-spacing:2px;">NEW ORDER RECEIVED</p>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="color:#1F4E78;font-size:20px;margin:0 0 24px;">Order #${order_id.slice(0, 8).toUpperCase()}</h2>
      
      <div style="background:#f0f7ff;border-radius:8px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#1F4E78;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Customer</h3>
        <p style="margin:4px 0;color:#374151;"><strong>${customer_name}</strong></p>
        <p style="margin:4px 0;color:#374151;"><a href="mailto:${customer_email}" style="color:#2E75B6;">${customer_email}</a></p>
        ${notes ? `<p style="margin:12px 0 0;color:#374151;"><strong>Note:</strong> ${notes}</p>` : ''}
      </div>

      <h3 style="color:#1F4E78;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Items Ordered</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#1F4E78;color:#fff;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;">Product</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;">Size</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;">Qty</th>
            <th style="padding:10px 12px;text-align:right;font-size:13px;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:12px;text-align:right;font-weight:bold;font-size:16px;color:#1F4E78;">Total:</td>
            <td style="padding:12px;text-align:right;font-weight:bold;font-size:18px;color:#1F4E78;">$${total_amount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;">
        <p style="margin:0;color:#92400e;font-size:14px;"><strong>Action needed:</strong> Contact ${customer_name} at <a href="mailto:${customer_email}" style="color:#92400e;">${customer_email}</a> to arrange payment and pickup/delivery.</p>
      </div>
    </div>
    <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">TOPAZ 2.0 Dance & Performing Arts Competition &mdash; topaz2.0@yahoo.com</p>
    </div>
  </div>
</body>
</html>`;

    const textBody = `NEW ORDER — TOPAZ 2.0

Order ID: ${order_id.slice(0, 8).toUpperCase()}

Customer: ${customer_name}
Email: ${customer_email}${notes ? `\nNote: ${notes}` : ''}

Items:
${itemsText}

Total: $${total_amount.toFixed(2)}

Action needed: Contact ${customer_name} at ${customer_email} to arrange payment and pickup/delivery.`;

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `New Order from ${customer_name} — $${total_amount.toFixed(2)}`,
          html: htmlBody,
          text: textBody,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('Resend error:', err);
      }
    } else {
      console.warn('RESEND_API_KEY not set — order notification email skipped');
      console.log('Order notification would have been sent:', textBody);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-order-notification error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
