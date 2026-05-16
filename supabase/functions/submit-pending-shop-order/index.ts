import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "topaz2.0@yahoo.com";

type LineIn = {
  product_id: string;
  product_name: string;
  size: string;
  quantity: number;
};

type Body = {
  items: LineIn[];
  customer_name: string;
  customer_email?: string | null;
  phone?: string | null;
  shipping_address: string;
  notes?: string | null;
  payment_method: "zelle" | "cash" | "check" | "money_order";
};

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paymentLabel(pm: Body["payment_method"]): string {
  if (pm === "zelle") return "Zelle";
  if (pm === "cash") return "Cash (pickup or at event)";
  if (pm === "money_order") return "Money order by mail";
  return "Check by mail";
}

async function sendAdminOrderEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string | null;
  phone: string | null;
  shippingAddress: string;
  items: { product_name: string; size: string; quantity: number; unit_price: number }[];
  total: number;
  notes: string | null;
}): Promise<{ ok: true } | { ok: false; detail: string }> {
  const brevoKey = Deno.env.get("BREVO_API_KEY") ?? "";
  if (!brevoKey) {
    return { ok: false, detail: "BREVO_API_KEY not set" };
  }

  const { orderId, customerName, customerEmail, phone, shippingAddress, items, total, notes } = params;
  const oid = orderId.slice(0, 8).toUpperCase();
  const emailLine = customerEmail && customerEmail.includes("@")
    ? `<p style="margin:4px 0;color:#374151;"><a href="mailto:${escapeHtml(customerEmail)}" style="color:#2E75B6;">${escapeHtml(customerEmail)}</a></p>`
    : `<p style="margin:4px 0;color:#6b7280;">Email: <em>Not provided</em></p>`;
  const phoneLine = phone
    ? `<p style="margin:4px 0;color:#374151;"><strong>Phone:</strong> ${escapeHtml(phone)}</p>`
    : "";
  const addrLine = `<p style="margin:8px 0 0;color:#374151;"><strong>Address:</strong><br/>${escapeHtml(shippingAddress).replace(/\n/g, "<br/>")}</p>`;

  const itemsHtml = items
    .map(
      (item) =>
        `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${escapeHtml(item.product_name)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${escapeHtml(item.size)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">$${(item.unit_price * item.quantity).toFixed(2)}</td>
      </tr>`,
    )
    .join("");

  const itemsText = items
    .map(
      (item) =>
        `  - ${item.product_name} (Size: ${item.size}) x${item.quantity} = $${(item.unit_price * item.quantity).toFixed(2)}`,
    )
    .join("\n");

  const contactHint = customerEmail && customerEmail.includes("@")
    ? `Contact ${escapeHtml(customerName)} at ${escapeHtml(customerEmail)}`
    : `Contact ${escapeHtml(customerName)} (no email on file — use phone or address if provided)`;

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#1F4E78;padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;font-size:28px;margin:0;letter-spacing:-0.5px;">TOPAZ<span style="color:#60a5fa;">2.0</span></h1>
      <p style="color:#93c5fd;margin:8px 0 0;font-size:14px;letter-spacing:2px;">NEW ORDER (PENDING PAYMENT)</p>
    </div>
    <div style="padding:32px 40px;">
      <h2 style="color:#1F4E78;font-size:20px;margin:0 0 24px;">Order #${oid}</h2>
      <div style="background:#f0f7ff;border-radius:8px;padding:20px;margin-bottom:24px;">
        <h3 style="color:#1F4E78;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Customer</h3>
        <p style="margin:4px 0;color:#374151;"><strong>${escapeHtml(customerName)}</strong></p>
        ${emailLine}
        ${phoneLine}
        ${addrLine}
        ${notes ? `<p style="margin:12px 0 0;color:#374151;"><strong>Notes:</strong> ${escapeHtml(notes)}</p>` : ""}
      </div>
      <h3 style="color:#1F4E78;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Items</h3>
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
            <td style="padding:12px;text-align:right;font-weight:bold;font-size:18px;color:#1F4E78;">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:16px;">
        <p style="margin:0;color:#92400e;font-size:14px;"><strong>Action needed:</strong> ${contactHint} to arrange payment and pickup/delivery.</p>
      </div>
    </div>
    <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">TOPAZ 2.0 — topaz2.0@yahoo.com</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `NEW PENDING ORDER — TOPAZ 2.0

Order: ${oid}
Customer: ${customerName}
Email: ${customerEmail ?? "(not provided)"}
Phone: ${phone ?? "(not provided)"}
Address:
${shippingAddress}
${notes ? `\nNotes:\n${notes}\n` : ""}
Items:
${itemsText}

Total: $${total.toFixed(2)}
`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "TOPAZ 2.0", email: "Topaz2.0@dancetopaz.com" },
      to: [{ email: ADMIN_EMAIL.trim() }],
      subject: `New shop order (pending) — ${customerName} — $${total.toFixed(2)}`,
      htmlContent: htmlBody,
      textContent: textBody,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return { ok: false, detail: errText };
  }
  return { ok: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !serviceKey) {
    console.error("[submit-pending-shop-order] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return json({ error: "Server misconfigured" }, 500);
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const name = (body.customer_name ?? "").trim();
  const addr = (body.shipping_address ?? "").trim();
  const emailRaw = (body.customer_email ?? "").trim().toLowerCase();
  const email = emailRaw && emailRaw.includes("@") ? emailRaw : null;
  const phone = (body.phone ?? "").trim() || null;
  const notesUser = (body.notes ?? "").trim();
  const pm = body.payment_method;

  if (!name) return json({ error: "Name is required" }, 400);
  if (addr.length < 8) return json({ error: "Please enter a full shipping or pickup address" }, 400);
  if (!["zelle", "cash", "check", "money_order"].includes(pm)) return json({ error: "Invalid payment method" }, 400);
  if (emailRaw && !email) return json({ error: "Invalid email address" }, 400);
  if (!body.items?.length) return json({ error: "Cart is empty" }, 400);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ids = [...new Set(body.items.map((i) => i.product_id))];
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("id, price, name")
    .in("id", ids);

  if (pErr || !products?.length || products.length !== ids.length) {
    console.error("[submit-pending-shop-order] product lookup", pErr);
    return json({ error: "One or more products are invalid or no longer available" }, 400);
  }

  const priceMap = new Map(products.map((p) => [p.id, Number(p.price)]));

  const orderItems: {
    product_id: string;
    product_name: string;
    size: string;
    quantity: number;
    unit_price: number;
  }[] = [];
  let total = 0;

  for (const line of body.items) {
    const q = Math.floor(Number(line.quantity));
    if (!line.product_id || !line.size || !Number.isFinite(q) || q < 1) {
      return json({ error: "Invalid cart line" }, 400);
    }
    const unit = priceMap.get(line.product_id);
    if (unit == null || !Number.isFinite(unit)) return json({ error: "Unknown product in cart" }, 400);
    const row = products.find((p) => p.id === line.product_id);
    const productName = (row?.name ?? line.product_name ?? "Item").toString().slice(0, 200);
    orderItems.push({
      product_id: line.product_id,
      product_name: productName,
      size: String(line.size).slice(0, 80),
      quantity: q,
      unit_price: unit,
    });
    total += unit * q;
  }
  total = Math.round(total * 100) / 100;

  const methodLine = `Customer selected payment: ${paymentLabel(pm)}`;
  const notesCombined = [methodLine, `Shipping / pickup address:\n${addr}`, phone ? `Phone: ${phone}` : null, notesUser || null]
    .filter(Boolean)
    .join("\n\n");

  const { data: order, error: insertErr } = await supabase
    .from("orders")
    .insert({
      customer_name: name,
      customer_email: email,
      phone,
      shipping_address: addr,
      items: orderItems,
      total_amount: total,
      status: "pending",
      payment_reference: `offline:${crypto.randomUUID()}`,
      notes: notesCombined || null,
    })
    .select("id")
    .single();

  if (insertErr || !order?.id) {
    console.error("[submit-pending-shop-order] insert", insertErr);
    return json({ error: insertErr?.message ?? "Failed to save order" }, 500);
  }

  const mail = await sendAdminOrderEmail({
    orderId: order.id,
    customerName: name,
    customerEmail: email,
    phone,
    shippingAddress: addr,
    items: orderItems,
    total,
    notes: notesCombined || null,
  });

  if (!mail.ok) {
    console.error("[submit-pending-shop-order] Brevo failed:", mail.detail);
    return json(
      {
        success: true,
        orderId: order.id,
        total_amount: total,
        emailDelivered: false,
        emailError: mail.detail.slice(0, 200),
      },
      200,
    );
  }

  return json({ success: true, orderId: order.id, total_amount: total, emailDelivered: true }, 200);
});
