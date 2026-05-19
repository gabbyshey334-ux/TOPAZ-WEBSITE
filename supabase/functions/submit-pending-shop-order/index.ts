import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ADMIN_EMAIL = "topaz2.0@yahoo.com";
const ZELLE_PAYEE = "topaz2.0@yahoo.com";
const CHECK_MAILING_LINE = "TOPAZ 2.0, PO BOX 131, BANKS OR 97106";
const CONTACT_PHONE = "971-299-4401";

/** Fallbacks — keep in sync with `app/src/lib/shopFees.ts`. */
const SHOP_SHIPPING_FLAT_DEFAULT = 9.95;
const SHOP_HANDLING_FLAT_DEFAULT = 2.5;
const SHOP_TAX_RATE_DEFAULT = 0;

type ShopFulfillment = "ship" | "pickup";

type ShopFeesConfig = {
  shippingFlat: number;
  handlingFlat: number;
  taxRate: number;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseFee(value: string | null | undefined, fallback: number): number {
  const n = Number(String(value ?? "").trim());
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

async function loadShopFeesConfig(
  supabase: ReturnType<typeof createClient>,
): Promise<ShopFeesConfig> {
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", ["shop_shipping_flat", "shop_handling_flat", "shop_tax_rate"]);
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    shippingFlat: parseFee(map.get("shop_shipping_flat"), SHOP_SHIPPING_FLAT_DEFAULT),
    handlingFlat: parseFee(map.get("shop_handling_flat"), SHOP_HANDLING_FLAT_DEFAULT),
    taxRate: parseFee(map.get("shop_tax_rate"), SHOP_TAX_RATE_DEFAULT),
  };
}

function computeShopOrderTotals(
  subtotal: number,
  fulfillment: ShopFulfillment,
  fees: ShopFeesConfig,
) {
  const sub = roundMoney(subtotal);
  const shipping = fulfillment === "ship" ? fees.shippingFlat : 0;
  const handling = fulfillment === "ship" ? fees.handlingFlat : 0;
  const taxable = sub + shipping + handling;
  const tax = roundMoney(taxable * fees.taxRate);
  const total = roundMoney(taxable + tax);
  return { subtotal: sub, shipping, handling, tax, total };
}

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
  fulfillment?: ShopFulfillment;
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

function buildPaymentInstructions(
  pm: Body["payment_method"],
  orderId: string,
  customerName: string,
  total: number,
): { html: string; text: string } {
  const oid = orderId.slice(0, 8).toUpperCase();
  const amount = `$${total.toFixed(2)}`;
  const memo = `${customerName} — order #${oid}`;

  let leadHtml = "";
  let leadText = "";

  if (pm === "zelle") {
    leadHtml =
      `<p style="margin:0 0 12px;color:#374151;line-height:1.6;">Complete your purchase by sending <strong>${amount}</strong> via <strong>Zelle</strong>. Use your order number in the memo.</p>`;
    leadText = `Complete your purchase by sending ${amount} via Zelle. Use your order number in the memo.\n\n`;
  } else if (pm === "cash") {
    leadHtml =
      `<p style="margin:0 0 12px;color:#374151;line-height:1.6;">We recorded your order as <strong>cash on pickup</strong> (or at the event). Bring <strong>${amount}</strong> when you collect your items. You may also pay via Zelle or mail a check — details below.</p>`;
    leadText =
      `We recorded your order as cash on pickup (or at the event). Bring ${amount} when you collect your items. You may also pay via Zelle or mail a check — details below.\n\n`;
  } else if (pm === "check") {
    leadHtml =
      `<p style="margin:0 0 12px;color:#374151;line-height:1.6;">Mail a check for <strong>${amount}</strong>, payable to <strong>Topaz 2.0 LLC</strong>, to the address below. Include your name and order #${oid} on the memo line.</p>`;
    leadText =
      `Mail a check for ${amount}, payable to Topaz 2.0 LLC, to the address below. Include your name and order #${oid} on the memo line.\n\n`;
  } else {
    leadHtml =
      `<p style="margin:0 0 12px;color:#374151;line-height:1.6;">Mail a money order for <strong>${amount}</strong>, payable to <strong>Topaz 2.0 LLC</strong>, to the address below. Include your name and order #${oid} on the memo line.</p>`;
    leadText =
      `Mail a money order for ${amount}, payable to Topaz 2.0 LLC, to the address below. Include your name and order #${oid} on the memo line.\n\n`;
  }

  const html = `${leadHtml}
      <p style="margin:0 0 8px;color:#374151;line-height:1.6;"><strong>Amount due:</strong> <span style="color:#2E75B6;font-size:18px;font-weight:800;">${amount}</span></p>
      <p style="margin:0 0 8px;color:#374151;line-height:1.6;"><strong>Zelle:</strong> Send to <a href="mailto:${escapeHtml(ZELLE_PAYEE)}" style="color:#2E75B6;">${escapeHtml(ZELLE_PAYEE)}</a>. Memo: ${escapeHtml(memo)}.</p>
      <p style="margin:0;color:#374151;line-height:1.6;"><strong>Check or money order:</strong> Payable to <strong>Topaz 2.0 LLC</strong>, mailed to ${escapeHtml(CHECK_MAILING_LINE)}.</p>`;

  const text = `${leadText}Amount due: ${amount}

Zelle: Send to ${ZELLE_PAYEE}. Memo: ${memo}.

Check or money order: Payable to Topaz 2.0 LLC, mailed to ${CHECK_MAILING_LINE}.`;

  return { html, text };
}

async function sendCustomerOrderConfirmationEmail(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: Body["payment_method"];
  items: { product_name: string; size: string; quantity: number; unit_price: number }[];
  total: number;
  shippingAddress: string;
}): Promise<{ ok: true } | { ok: false; detail: string }> {
  const brevoKey = Deno.env.get("BREVO_API_KEY") ?? "";
  if (!brevoKey) {
    return { ok: false, detail: "BREVO_API_KEY not set" };
  }

  const { orderId, customerName, customerEmail, paymentMethod, items, total, shippingAddress } = params;
  const to = customerEmail.trim();
  if (!to.includes("@")) {
    return { ok: false, detail: `Invalid recipient email: "${customerEmail}"` };
  }

  const oid = orderId.slice(0, 8).toUpperCase();
  const payLabel = paymentLabel(paymentMethod);

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

  const payment = buildPaymentInstructions(paymentMethod, orderId, customerName, total);

  const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f7fa;margin:0;padding:0;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
    <div style="background:#1F4E78;padding:36px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:1px;">TOPAZ 2.0</h1>
      <p style="color:#93c5fd;margin:8px 0 0;font-size:14px;">Order received — payment pending</p>
    </div>
    <div style="padding:36px 40px;">
      <p style="margin:0 0 16px;color:#374151;line-height:1.6;">Hi ${escapeHtml(customerName)},</p>
      <p style="margin:0 0 24px;color:#374151;line-height:1.6;">Thank you for your TOPAZ 2.0 shop order. We saved it as <strong>pending</strong> until we receive payment. Your order number is <strong>#${oid}</strong>.</p>
      <div style="background:#eff6ff;border-left:4px solid #2E75B6;padding:16px 20px;border-radius:6px;margin-bottom:24px;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Payment method</p>
        <p style="margin:0;color:#1F4E78;font-weight:700;">${escapeHtml(payLabel)}</p>
      </div>
      <h3 style="color:#1F4E78;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">Your items</h3>
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
      <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Shipping / pickup</p>
      <p style="margin:0 0 24px;color:#374151;line-height:1.6;">${escapeHtml(shippingAddress).replace(/\n/g, "<br/>")}</p>
      <h3 style="color:#1F4E78;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;">How to pay</h3>
      ${payment.html}
      <p style="margin:24px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">Questions? Email <a href="mailto:${escapeHtml(ZELLE_PAYEE)}" style="color:#2E75B6;">${escapeHtml(ZELLE_PAYEE)}</a> or call ${CONTACT_PHONE}.</p>
    </div>
    <div style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">TOPAZ 2.0 Dance &amp; Performing Arts Competition</p>
    </div>
  </div>
</body>
</html>`;

  const textBody = `TOPAZ 2.0 — Order received (payment pending)

Hi ${customerName},

Thank you for your shop order. Order #${oid} is saved as pending until we receive payment.

Payment method: ${payLabel}

Shipping / pickup:
${shippingAddress}

Items:
${itemsText}

Total: $${total.toFixed(2)}

How to pay:
${payment.text}

Questions? Email ${ZELLE_PAYEE} or call ${CONTACT_PHONE}.`;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": brevoKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "TOPAZ 2.0", email: "Topaz2.0@dancetopaz.com" },
      to: [{ email: to, name: customerName }],
      subject: `TOPAZ 2.0 — Order received #${oid}`,
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
  const fulfillment: ShopFulfillment = body.fulfillment === "ship" ? "ship" : "pickup";
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
  let subtotal = 0;

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
    subtotal += unit * q;
  }
  subtotal = roundMoney(subtotal);

  const feeConfig = await loadShopFeesConfig(supabase);
  const fees = computeShopOrderTotals(subtotal, fulfillment, feeConfig);
  const total = fees.total;

  const fulfillmentLine =
    fulfillment === "ship"
      ? `Delivery: Ship to address (shipping $${fees.shipping.toFixed(2)}, handling $${fees.handling.toFixed(2)}${fees.tax > 0 ? `, tax $${fees.tax.toFixed(2)}` : ""})`
      : "Delivery: Pickup at event or studio (no shipping/handling fees)";

  const methodLine = `Customer selected payment: ${paymentLabel(pm)}`;
  const notesCombined = [
    methodLine,
    fulfillmentLine,
    `Order subtotal: $${fees.subtotal.toFixed(2)} | Total due: $${fees.total.toFixed(2)}`,
    `Shipping / pickup address:\n${addr}`,
    phone ? `Phone: ${phone}` : null,
    notesUser || null,
  ]
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

  const adminMail = await sendAdminOrderEmail({
    orderId: order.id,
    customerName: name,
    customerEmail: email,
    phone,
    shippingAddress: addr,
    items: orderItems,
    total,
    notes: notesCombined || null,
  });

  if (!adminMail.ok) {
    console.error("[submit-pending-shop-order] Admin Brevo failed:", adminMail.detail);
  }

  let customerEmailDelivered = false;
  let customerEmailError: string | undefined;
  if (email) {
    const customerMail = await sendCustomerOrderConfirmationEmail({
      orderId: order.id,
      customerName: name,
      customerEmail: email,
      paymentMethod: pm,
      items: orderItems,
      total,
      shippingAddress: addr,
    });
    customerEmailDelivered = customerMail.ok;
    if (!customerMail.ok) {
      customerEmailError = customerMail.detail.slice(0, 200);
      console.error("[submit-pending-shop-order] Customer Brevo failed:", customerMail.detail);
    }
  }

  return json(
    {
      success: true,
      orderId: order.id,
      total_amount: total,
      emailDelivered: adminMail.ok,
      emailError: adminMail.ok ? undefined : adminMail.detail.slice(0, 200),
      customerEmailDelivered,
      customerEmailError,
    },
    200,
  );
});
