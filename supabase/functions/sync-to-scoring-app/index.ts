import { createClient } from 'jsr:@supabase/supabase-js@2';

const SCORING_APP_URL = Deno.env.get('SCORING_APP_URL')!;
const SCORING_APP_SERVICE_ROLE_KEY = Deno.env.get('SCORING_APP_SERVICE_ROLE_KEY')!;
const WEBSITE_URL = Deno.env.get('SUPABASE_URL')!;
const WEBSITE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let registrationId: string;
  try {
    const body = await req.json();
    registrationId = body?.registrationId;
    if (!registrationId) throw new Error('registrationId is required');
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 400 });
  }

  // Validate secrets are configured
  if (!SCORING_APP_URL || !SCORING_APP_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY secrets are not configured. Please add them in the Supabase dashboard under Edge Function secrets.' }),
      { status: 500 }
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
      { status: 404 }
    );
  }

  // ── 2. Idempotency check ─────────────────────────────────────────────────────
  if (reg.scoring_app_contestant_id) {
    return new Response(
      JSON.stringify({ success: true, alreadySynced: true, contestantId: reg.scoring_app_contestant_id }),
      { status: 200 }
    );
  }

  const scoringClient = createClient(SCORING_APP_URL, SCORING_APP_SERVICE_ROLE_KEY);

  // ── 3. Find the competition in the scoring app ───────────────────────────────
  const { data: competitions, error: compErr } = await scoringClient
    .from('competitions')
    .select('id, name, date')
    .eq('is_archived', false)
    .or('name.ilike.%topaz%,date.eq.2026-08-22');

  if (compErr) {
    const msg = `Failed to query scoring app competitions: ${compErr.message}`;
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }

  if (!competitions || competitions.length === 0) {
    const msg = 'No matching competition found in scoring app. Please create \'The Return of TOPAZ 2.0\' competition in the scoring app first, then click Sync Now on this registration.';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 404 });
  }

  // Prefer exact date match, fall back to name match
  const competition =
    competitions.find((c: { date: string }) => c.date === '2026-08-22') ?? competitions[0];

  // ── 4. Duplicate check ───────────────────────────────────────────────────────
  // First check by website_registration_id (strongest signal)
  const { data: byRegId } = await scoringClient
    .from('entries')
    .select('id')
    .eq('competition_id', competition.id)
    .eq('website_registration_id', registrationId)
    .maybeSingle();

  if (byRegId) {
    await updateSyncStatus(websiteClient, registrationId, 'synced', byRegId.id, null);
    return new Response(JSON.stringify({ success: true, alreadySynced: true, contestantId: byRegId.id }), { status: 200 });
  }

  // Also check by name to prevent duplicates from manual entry in scoring app
  const { data: byName } = await scoringClient
    .from('entries')
    .select('id')
    .eq('competition_id', competition.id)
    .eq('competitor_name', reg.contestant_name)
    .maybeSingle();

  if (byName) {
    const msg = `Contestant "${reg.contestant_name}" already exists in the scoring app for this competition (possibly entered manually). Skipped to avoid duplicate.`;
    await updateSyncStatus(websiteClient, registrationId, 'skipped', byName.id, msg);
    return new Response(JSON.stringify({ success: true, skipped: true, reason: msg }), { status: 200 });
  }

  // ── 5. Calculate next entry number ──────────────────────────────────────────
  const { data: maxEntry } = await scoringClient
    .from('entries')
    .select('entry_number')
    .eq('competition_id', competition.id)
    .order('entry_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const entryNumber = (maxEntry?.entry_number ?? 0) + 1;

  // ── 6. Build group_members array ─────────────────────────────────────────────
  let groupMembers: string[] | null = null;
  if (reg.participants_json && Array.isArray(reg.participants_json)) {
    const names = (reg.participants_json as Array<{ name?: string }>)
      .map((p) => p.name)
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0);
    if (names.length > 0) groupMembers = names;
  }

  // ── 7. Insert entry into scoring app ─────────────────────────────────────────
  const entryPayload = {
    competition_id: competition.id,
    entry_number: entryNumber,
    competitor_name: reg.contestant_name,
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
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  } finally {
    clearTimeout(timeout);
  }

  if (insertErr || !insertData) {
    const msg = insertErr?.message ?? 'Insert returned no data';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }

  // ── 8. Mark registration as synced ──────────────────────────────────────────
  await updateSyncStatus(websiteClient, registrationId, 'synced', insertData.id, null);

  return new Response(
    JSON.stringify({
      success: true,
      contestantId: insertData.id,
      entryNumber,
      competitionId: competition.id,
      competitionName: competition.name,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
});
