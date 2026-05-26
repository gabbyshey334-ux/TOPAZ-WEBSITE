import { createClient } from 'jsr:@supabase/supabase-js@2';

const WEBSITE_URL = Deno.env.get('SUPABASE_URL')!;
const WEBSITE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SCORING_APP_URL = Deno.env.get('SCORING_APP_URL')!;
const SCORING_APP_SERVICE_ROLE_KEY = Deno.env.get('SCORING_APP_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS_HEADERS };

type CompetitionRow = {
  id: string;
  name: string | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  if (!WEBSITE_URL || !WEBSITE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: 'Website Supabase secrets are missing' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  if (!SCORING_APP_URL || !SCORING_APP_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({
        error: 'SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY are not configured.',
      }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  const callerClient = createClient(WEBSITE_URL, WEBSITE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await callerClient.auth.getUser();
  const callerEmail = userData?.user?.email?.trim().toLowerCase();
  if (userErr || !callerEmail) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const { data: isAdmin, error: adminErr } = await callerClient.rpc('is_admin');
  if (adminErr) {
    return new Response(JSON.stringify({ error: adminErr.message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden — admin only' }), {
      status: 403,
      headers: JSON_HEADERS,
    });
  }

  const scoringClient = createClient(SCORING_APP_URL, SCORING_APP_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await scoringClient
    .from('competitions')
    .select('id, name')
    .order('name', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const competitions = ((data ?? []) as CompetitionRow[]).map((row) => ({
    id: row.id,
    name: row.name ?? row.id,
  }));

  return new Response(JSON.stringify({ competitions }), {
    status: 200,
    headers: JSON_HEADERS,
  });
});
