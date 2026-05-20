import { createClient } from 'jsr:@supabase/supabase-js@2';

const SCORING_APP_URL = Deno.env.get('SCORING_APP_URL')!;
const SCORING_APP_SERVICE_ROLE_KEY = Deno.env.get('SCORING_APP_SERVICE_ROLE_KEY')!;
const WEBSITE_URL = Deno.env.get('SUPABASE_URL')!;
const WEBSITE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/** Same competition as `sync-to-scoring-app`. */
const COMPETITION_ID = '60874ab6-341e-4e21-9e62-7fe686530607';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS_HEADERS };

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

type EntryRef = { id: string; performance_id: string | null };

async function deleteScoringForRegistration(
  scoringClient: ReturnType<typeof createClient>,
  registrationId: string,
  entryIdHint: string | null,
): Promise<{ deletedEntries: number; deletedPerformances: number; errors: string[] }> {
  const entryIds = new Set<string>();
  const performanceIds = new Set<string>();

  if (entryIdHint) entryIds.add(entryIdHint);

  const { data: byReg, error: lookupErr } = await scoringClient
    .from('entries')
    .select('id, performance_id')
    .eq('competition_id', COMPETITION_ID)
    .eq('website_registration_id', registrationId);

  if (lookupErr) {
    return { deletedEntries: 0, deletedPerformances: 0, errors: [lookupErr.message] };
  }

  for (const row of (byReg ?? []) as EntryRef[]) {
    if (row.id) entryIds.add(row.id);
    if (row.performance_id) performanceIds.add(row.performance_id);
  }

  if (entryIds.size === 0 && entryIdHint) {
    const { data: one } = await scoringClient
      .from('entries')
      .select('id, performance_id')
      .eq('id', entryIdHint)
      .maybeSingle();
    if (one?.id) {
      entryIds.add(one.id as string);
      if (one.performance_id) performanceIds.add(one.performance_id as string);
    }
  }

  if (entryIds.size === 0) {
    return { deletedEntries: 0, deletedPerformances: 0, errors: [] };
  }

  const errors: string[] = [];
  let deletedPerformances = 0;

  for (const entryId of entryIds) {
    const { error } = await scoringClient.from('entries').delete().eq('id', entryId);
    if (error) errors.push(`entries: ${error.message}`);
  }

  // Only remove the performance when no other entries still reference it (shared duo/trio).
  for (const perfId of performanceIds) {
    const { data: stillLinked, error: linkErr } = await scoringClient
      .from('entries')
      .select('id')
      .eq('performance_id', perfId)
      .limit(1);
    if (linkErr) {
      errors.push(`entries lookup: ${linkErr.message}`);
      continue;
    }
    if (stillLinked && stillLinked.length > 0) continue;

    const { error: partErr } = await scoringClient
      .from('performance_participants')
      .delete()
      .eq('performance_id', perfId);
    if (partErr) errors.push(`performance_participants: ${partErr.message}`);

    const { error: perfErr } = await scoringClient.from('performances').delete().eq('id', perfId);
    if (perfErr) errors.push(`performances: ${perfErr.message}`);
    else deletedPerformances += 1;
  }

  return {
    deletedEntries: entryIds.size,
    deletedPerformances,
    errors,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let registrationId: string;
  try {
    const body = await req.json();
    registrationId = body?.registrationId;
    if (!registrationId || typeof registrationId !== 'string') {
      throw new Error('registrationId is required');
    }
  } catch (e) {
    return json({ error: String(e) }, 400);
  }

  if (!WEBSITE_URL || !WEBSITE_SERVICE_ROLE_KEY) {
    return json({ error: 'Website Supabase env not configured' }, 500);
  }

  if (!SCORING_APP_URL || !SCORING_APP_SERVICE_ROLE_KEY) {
    return json({
      error:
        'SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY are not configured on this Edge Function.',
    }, 500);
  }

  const websiteClient = createClient(WEBSITE_URL, WEBSITE_SERVICE_ROLE_KEY);
  const scoringClient = createClient(SCORING_APP_URL, SCORING_APP_SERVICE_ROLE_KEY);

  const { data: reg, error: regErr } = await websiteClient
    .from('registrations')
    .select('id, scoring_app_contestant_id, scoring_app_sync_status')
    .eq('id', registrationId)
    .maybeSingle();

  if (regErr) {
    return json({ error: regErr.message }, 500);
  }

  const entryHint =
    typeof reg?.scoring_app_contestant_id === 'string' ? reg.scoring_app_contestant_id : null;

  const result = await deleteScoringForRegistration(
    scoringClient,
    registrationId,
    entryHint,
  );

  if (result.errors.length > 0) {
    return json(
      {
        error: result.errors.join('; '),
        deletedEntries: result.deletedEntries,
        deletedPerformances: result.deletedPerformances,
      },
      500,
    );
  }

  return json({
    success: true,
    deletedEntries: result.deletedEntries,
    deletedPerformances: result.deletedPerformances,
    hadNothingToDelete: result.deletedEntries === 0,
  });
});
