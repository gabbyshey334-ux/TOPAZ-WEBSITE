import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── Config ──────────────────────────────────────────────────────────────────
const FROM_EMAIL = 'TOPAZ 2.0 <onboarding@resend.dev>';
const ADMIN_EMAIL = 'topaz2.0@yahoo.com';
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 1100; // Resend free tier: ~2 req/sec. Wait >1s between batches.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  ...CORS_HEADERS,
};

interface BroadcastPayload {
  subject?: string;
  message?: string;
  preview_text?: string;
}

interface Subscriber {
  email: string;
  name: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

/** Minimal HTML escape for user-provided strings interpolated into the template. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert plain-text message to HTML: escape, preserve newlines, auto-link URLs. */
function messageToHtml(message: string): string {
  const escaped = escapeHtml(message);
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url) => `<a href="${url}" style="color:#2E75B6;text-decoration:underline;">${url}</a>`
  );
  return linked.replace(/\r?\n/g, '<br/>');
}

function buildHtml(subject: string, message: string, previewText: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 0; color: #222; }
    .preview { display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #f5f7fa; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1F4E78, #2E75B6); padding: 40px 40px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; letter-spacing: 1px; font-weight: 800; line-height: 1.25; }
    .header p { color: #cfe3f5; margin: 10px 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; }
    .body { padding: 36px 40px; line-height: 1.65; font-size: 15px; }
    .body p { margin: 0 0 16px; }
    .footer { background: #f9fafb; padding: 22px 40px; text-align: center; font-size: 12px; color: #9ca3af; }
    .footer a { color: #2E75B6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="preview">${escapeHtml(previewText)}</div>
  <div class="wrapper">
    <div class="header">
      <p>TOPAZ 2.0</p>
      <h1>${escapeHtml(subject)}</h1>
    </div>
    <div class="body">
      <p>${messageToHtml(message)}</p>
      <p style="margin-top:32px;">— The TOPAZ 2.0 Team</p>
    </div>
    <div class="footer">
      &copy; 2026 TOPAZ 2.0 LLC &bull; <a href="mailto:topaz2.0@yahoo.com">topaz2.0@yahoo.com</a>
    </div>
  </div>
</body>
</html>`;
}

function buildText(subject: string, message: string): string {
  return `${subject}

${message}

— The TOPAZ 2.0 Team
topaz2.0@yahoo.com`;
}

async function sendOne(
  resendApiKey: string,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return { ok: false, error: `HTTP ${response.status}: ${errBody.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Handler ─────────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // ── Authenticate caller and verify they are the admin ──────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return jsonResponse({ error: 'Missing Authorization header' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[send-broadcast-email] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  // Use a client with the CALLER's JWT just to resolve the caller identity.
  const callerClient = createClient(supabaseUrl, serviceRoleKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !userData?.user?.email) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  const callerEmail = userData.user.email.trim().toLowerCase();
  if (callerEmail !== ADMIN_EMAIL.toLowerCase()) {
    console.warn(`[send-broadcast-email] Non-admin attempted broadcast: ${callerEmail}`);
    return jsonResponse({ error: 'Forbidden — admin only' }, 403);
  }

  // ── Parse & validate payload ───────────────────────────────────────────────
  let payload: BroadcastPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  const subject = (payload.subject ?? '').trim();
  const message = (payload.message ?? '').trim();
  const previewText = (payload.preview_text ?? '').trim();

  if (!subject) return jsonResponse({ error: 'Missing required field: subject' }, 400);
  if (!message) return jsonResponse({ error: 'Missing required field: message' }, 400);

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  if (!resendApiKey) {
    console.error('[send-broadcast-email] Missing RESEND_API_KEY');
    return jsonResponse({ error: 'Email provider not configured (RESEND_API_KEY missing)' }, 500);
  }

  // ── Fetch subscribers using service role (bypasses RLS) ───────────────────
  // Note: `mailing_list` currently has no `unsubscribed` column, so all rows
  // are considered active subscribers. If an `unsubscribed` flag is later
  // added, filter with `.eq('unsubscribed', false)` here.
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: subs, error: subsErr } = await adminClient
    .from('mailing_list')
    .select('email, name');

  if (subsErr) {
    console.error('[send-broadcast-email] Failed to fetch mailing_list:', subsErr);
    return jsonResponse({ error: 'Failed to load mailing list', details: subsErr.message }, 500);
  }

  // Deduplicate by lowercased email, drop empties.
  const seen = new Set<string>();
  const subscribers: Subscriber[] = [];
  for (const row of (subs ?? []) as Subscriber[]) {
    const e = (row.email ?? '').trim().toLowerCase();
    if (!e || seen.has(e)) continue;
    seen.add(e);
    subscribers.push({ email: e, name: row.name ?? null });
  }

  if (subscribers.length === 0) {
    return jsonResponse({ sent: 0, failed: 0, total: 0, warning: 'No subscribers' });
  }

  // ── Build email content once ───────────────────────────────────────────────
  const html = buildHtml(subject, message, previewText);
  const text = buildText(subject, message);

  // ── Send in batches of BATCH_SIZE with delay between batches ──────────────
  let sent = 0;
  let failed = 0;
  const failures: Array<{ email: string; error: string }> = [];

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((s) => sendOne(resendApiKey, s.email, subject, html, text))
    );
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.ok) {
        sent++;
      } else {
        failed++;
        if (failures.length < 20) {
          failures.push({ email: batch[j].email, error: r.error });
        }
      }
    }
    if (i + BATCH_SIZE < subscribers.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(
    `[send-broadcast-email] Broadcast complete by ${callerEmail}: ${sent} sent, ${failed} failed of ${subscribers.length} total`
  );

  return jsonResponse({
    sent,
    failed,
    total: subscribers.length,
    ...(failures.length > 0 ? { sample_failures: failures } : {}),
  });
});
