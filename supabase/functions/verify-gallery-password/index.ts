import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting: ip -> { count, windowStart }
const attempts = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 10;

async function getStoredPassword(): Promise<string | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const res = await fetch(
    `${supabaseUrl}/rest/v1/gallery_settings?id=eq.1&select=gallery_password`,
    {
      headers: {
        apikey: serviceRole,
        Authorization: `Bearer ${serviceRole}`,
      },
    }
  );

  if (!res.ok) return null;
  const rows = await res.json();
  return (rows?.[0]?.gallery_password as string | null) ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    // empty body is fine
  }

  const storedPassword = await getStoredPassword();

  // Status check — just returns whether a password has been configured
  if (body.checkStatus === true) {
    return new Response(
      JSON.stringify({ configured: !!storedPassword }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Password verification — apply rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown';

  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry) {
    if (now - entry.windowStart < WINDOW_MS) {
      if (entry.count >= MAX_ATTEMPTS) {
        return new Response(
          JSON.stringify({ error: 'Too many attempts. Please try again in a few minutes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      entry.count++;
    } else {
      // Window expired — reset
      attempts.set(ip, { count: 1, windowStart: now });
    }
  } else {
    attempts.set(ip, { count: 1, windowStart: now });
  }

  const { password } = body as { password?: string };

  if (!password || typeof password !== 'string') {
    return new Response(
      JSON.stringify({ valid: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!storedPassword) {
    // No password configured — let the client know so it can show all content
    return new Response(
      JSON.stringify({ valid: false, configured: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const valid = password.trim() === storedPassword.trim();

  return new Response(
    JSON.stringify({ valid }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
