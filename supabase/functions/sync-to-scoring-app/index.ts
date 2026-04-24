import { createClient } from 'jsr:@supabase/supabase-js@2';

const SCORING_APP_URL = Deno.env.get('SCORING_APP_URL')!;
const SCORING_APP_SERVICE_ROLE_KEY = Deno.env.get('SCORING_APP_SERVICE_ROLE_KEY')!;
const WEBSITE_URL = Deno.env.get('SUPABASE_URL')!;
const WEBSITE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS_HEADERS };

// Map website ability_level labels (full text) → scoring app values
function mapAbilityLevel(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.startsWith('beginning'))    return 'Beginning';
  if (lower.startsWith('intermediate')) return 'Intermediate';
  if (lower.startsWith('advanced'))     return 'Advanced';
  return null;
}

async function updateSyncStatus(
  client: ReturnType<typeof createClient>,
  registrationId: string,
  status: 'synced' | 'failed' | 'skipped',
  contestantId: string | null,
  errorMsg: string | null,
) {
  await client.from('registrations').update({
    scoring_app_sync_status: status,
    scoring_app_contestant_id: contestantId,
    scoring_app_synced_at: status === 'synced' ? new Date().toISOString() : null,
    scoring_app_sync_error: errorMsg,
  }).eq('id', registrationId);
}

Deno.serve(async (req: Request) => {
  // CORS preflight — browsers send this before the POST. Must return 204.
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  let registrationId: string;
  try {
    const body = await req.json();
    registrationId = body?.registrationId;
    if (!registrationId) throw new Error('registrationId is required');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  // Validate secrets are configured
  if (!SCORING_APP_URL || !SCORING_APP_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY secrets are not configured. Please add them in the Supabase dashboard under Edge Function secrets.' }),
      { status: 500, headers: JSON_HEADERS }
    );
  }

  const websiteClient = createClient(WEBSITE_URL, WEBSITE_SERVICE_ROLE_KEY);

  // ── 1. Fetch the registration ────────────────────────────────────────────────
  const { data: reg, error: regErr } = await websiteClient
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  if (regErr || !reg) {
    return new Response(
      JSON.stringify({ error: `Registration not found: ${regErr?.message}` }),
      { status: 404, headers: JSON_HEADERS }
    );
  }

  // ── 2. Idempotency check ─────────────────────────────────────────────────────
  if (reg.scoring_app_contestant_id) {
    return new Response(
      JSON.stringify({ success: true, alreadySynced: true, contestantId: reg.scoring_app_contestant_id }),
      { status: 200, headers: JSON_HEADERS }
    );
  }

  const scoringClient = createClient(SCORING_APP_URL, SCORING_APP_SERVICE_ROLE_KEY);

  // ── 3. Find the competition in the scoring app ───────────────────────────────
  // Lookup strategy (most-specific → least-specific):
  //   A. non-archived AND (name ILIKE '%topaz%' OR date = 2026-08-22)
  //   B. non-archived AND date = 2026-08-22     (date-only fallback; tolerates renames)
  //   C. any row with date = 2026-08-22         (last-resort, even if archived)
  // Date is treated as the stable identifier because the competition name has
  // varied in production ("The Return Of Topaz2.0", "The Return of TOPAZ 2.0", etc.).
  const TARGET_DATE = '2026-08-22';

  type CompetitionRow = { id: string; name: string; date: string; is_archived?: boolean };

  let competition: CompetitionRow | null = null;
  let lookupStage = 'A';

  // Stage A — current behavior
  {
    const { data, error } = await scoringClient
      .from('competitions')
      .select('id, name, date, is_archived')
      .eq('is_archived', false)
      .or(`name.ilike.%topaz%,date.eq.${TARGET_DATE}`);
    if (error) {
      const msg = `Failed to query scoring app competitions: ${error.message}`;
      await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
    }
    if (data && data.length > 0) {
      const rows = data as CompetitionRow[];
      competition =
        rows.find((c) => c.date === TARGET_DATE) ??
        rows[0];
    }
  }

  // Stage B — date-only among non-archived competitions
  if (!competition) {
    lookupStage = 'B';
    const { data, error } = await scoringClient
      .from('competitions')
      .select('id, name, date, is_archived')
      .eq('is_archived', false)
      .eq('date', TARGET_DATE);
    if (!error && data && data.length > 0) {
      competition = (data as CompetitionRow[])[0];
    }
  }

  // Stage C — include archived rows on the target date as a last resort
  if (!competition) {
    lookupStage = 'C';
    const { data, error } = await scoringClient
      .from('competitions')
      .select('id, name, date, is_archived')
      .eq('date', TARGET_DATE)
      .order('is_archived', { ascending: true });
    if (!error && data && data.length > 0) {
      competition = (data as CompetitionRow[])[0];
    }
  }

  if (!competition) {
    const msg = `No competition found in scoring app for date ${TARGET_DATE}. Create the "The Return of TOPAZ 2.0" competition (with date = ${TARGET_DATE}) in the scoring app, then click Sync Now.`;
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 404, headers: JSON_HEADERS });
  }

  console.log(
    `[sync-to-scoring-app] registration=${registrationId} matched competition ` +
    `id=${competition.id} name="${competition.name}" date=${competition.date} ` +
    `archived=${competition.is_archived ?? 'n/a'} stage=${lookupStage}`,
  );

  // ── 4. Determine entry name ──────────────────────────────────────────────────
  // For group entries (Duo/Trio/Small Group/Large Group/Production), each dancer
  // registers separately but they're all part of the same routine. We surface
  // the routine name as the scoring app's competitor_name so judges see the act
  // name ("Smith Family Trio") instead of an individual dancer's name. Solos
  // continue to use the dancer's name.
  const groupSize: string = reg.group_size ?? '';
  const isGroupEntry = groupSize !== '' && !groupSize.startsWith('Solo');
  const routineName = typeof reg.routine_name === 'string' ? reg.routine_name.trim() : '';
  const entryName = (isGroupEntry && routineName !== '')
    ? routineName
    : reg.contestant_name;

  // ── 5. Duplicate check ───────────────────────────────────────────────────────
  // First check by website_registration_id (strongest signal)
  const { data: byRegId } = await scoringClient
    .from('entries')
    .select('id')
    .eq('competition_id', competition.id)
    .eq('website_registration_id', registrationId)
    .maybeSingle();

  if (byRegId) {
    await updateSyncStatus(websiteClient, registrationId, 'synced', byRegId.id, null);
    return new Response(JSON.stringify({ success: true, alreadySynced: true, contestantId: byRegId.id }), { status: 200, headers: JSON_HEADERS });
  }

  // Also check by name to prevent duplicates from manual entry in scoring app.
  // IMPORTANT: only applies to Solo entries. For group entries we intentionally
  // allow multiple registrations to share the same competitor_name (the routine
  // name), because every dancer in the group pays and syncs separately. The
  // byRegId check above already prevents a single registration from being synced
  // twice.
  if (!isGroupEntry) {
    const { data: byName } = await scoringClient
      .from('entries')
      .select('id')
      .eq('competition_id', competition.id)
      .eq('competitor_name', entryName)
      .maybeSingle();

    if (byName) {
      const msg = `Contestant "${entryName}" already exists in the scoring app for this competition (possibly entered manually). Skipped to avoid duplicate.`;
      await updateSyncStatus(websiteClient, registrationId, 'skipped', byName.id, msg);
      return new Response(JSON.stringify({ success: true, skipped: true, reason: msg }), { status: 200, headers: JSON_HEADERS });
    }
  }

  // ── 6. Calculate next entry number ──────────────────────────────────────────
  const { data: maxEntry } = await scoringClient
    .from('entries')
    .select('entry_number')
    .eq('competition_id', competition.id)
    .order('entry_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const entryNumber = (maxEntry?.entry_number ?? 0) + 1;

  // ── 7. Build group_members array ─────────────────────────────────────────────
  let groupMembers: string[] | null = null;
  if (reg.participants_json && Array.isArray(reg.participants_json)) {
    const names = (reg.participants_json as Array<{ name?: string }>)
      .map((p) => p.name)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0);
    if (names.length > 0) groupMembers = names;
  }

  // ── 8. Insert entry into scoring app ─────────────────────────────────────────
  // competitor_name:
  //   • Solo → dancer's name (reg.contestant_name)
  //   • Group (Duo/Trio/Small/Large/Production) → routine_name, so the scoring
  //     app displays the act name rather than an individual dancer's name.
  const entryPayload = {
    competition_id: competition.id,
    entry_number: entryNumber,
    competitor_name: entryName,
    age: reg.age ? parseInt(reg.age, 10) || null : null,
    dance_type: reg.category ?? null,
    ability_level: mapAbilityLevel(reg.ability_level),
    studio_name: reg.studio_name ?? null,
    teacher_name: reg.teacher_name ?? null,
    group_members: groupMembers,
    website_registration_id: registrationId,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let insertData: { id: string } | null = null;
  let insertErr: { message: string } | null = null;

  try {
    const result = await scoringClient
      .from('entries')
      .insert(entryPayload)
      .select('id')
      .single();
    insertData = result.data as { id: string } | null;
    insertErr = result.error as { message: string } | null;
  } catch (e) {
    const msg = e instanceof Error && e.name === 'AbortError'
      ? 'Scoring app connection timed out after 10 seconds — please retry.'
      : `Unexpected error: ${String(e)}`;
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  } finally {
    clearTimeout(timeout);
  }

  if (insertErr || !insertData) {
    const msg = insertErr?.message ?? 'Insert returned no data';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  }

  // ── 9. Mark registration as synced ──────────────────────────────────────────
  await updateSyncStatus(websiteClient, registrationId, 'synced', insertData.id, null);

  return new Response(
    JSON.stringify({
      success: true,
      contestantId: insertData.id,
      entryNumber,
      competitionId: competition.id,
      competitionName: competition.name,
    }),
    { status: 200, headers: JSON_HEADERS }
  );
});
