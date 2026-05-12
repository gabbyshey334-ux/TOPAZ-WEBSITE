import { createClient } from 'jsr:@supabase/supabase-js@2';

const SCORING_APP_URL = Deno.env.get('SCORING_APP_URL')!;
const SCORING_APP_SERVICE_ROLE_KEY = Deno.env.get('SCORING_APP_SERVICE_ROLE_KEY')!;
const WEBSITE_URL = Deno.env.get('SUPABASE_URL')!;
const WEBSITE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

/** Verified competition (TOPAZ 2026 — scoring app). */
const COMPETITION_ID = '60874ab6-341e-4e21-9e62-7fe686530607';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const JSON_HEADERS = { 'Content-Type': 'application/json', ...CORS_HEADERS };

// Age division mapping — exact IDs from scoring app database
const AGE_DIVISION_MAP: Record<string, string> = {
  junior_primary: '4f39aaf7-9cb0-44a7-a767-efb4f66b1245', // 3-7
  junior_advanced: '8eb9859e-2fb0-4589-bac5-0757df006d8e', // 8-12
  senior_youth: 'cc623271-c9de-4509-b832-92f5483a37be', // 13-18
  senior_adult: 'dfc6b488-8c58-4d2f-b324-32d28a6c20b0', // 19+
};

const getAgeDivisionId = (age: number): string => {
  if (age >= 3 && age <= 7) return AGE_DIVISION_MAP.junior_primary;
  if (age >= 8 && age <= 12) return AGE_DIVISION_MAP.junior_advanced;
  if (age >= 13 && age <= 18) return AGE_DIVISION_MAP.senior_youth;
  return AGE_DIVISION_MAP.senior_adult;
};

// Category mapping — exact IDs from scoring app database
const CATEGORY_MAP: Record<string, string> = {
  ballet: 'fb9c9d73-f18d-4fdd-adde-5ae63e2b77af',
  'hip hop': '30509f90-d0e8-48b7-96dd-746b25bcb0f1',
  jazz: 'f33b2718-1502-422d-b724-79f6054eb2f9',
  'lyrical/contemporary': '3302f445-1e1f-4ca6-aec1-7d5c06e11a68',
  acting: '8e4e3051-8e3b-4aac-b342-fc27dbe51a01',
  production: 'b01e1706-f917-4e4c-aada-dda2ae20d7e4',
  'student choreography': '01f04932-2667-4692-b2a7-a77ee0e5ae2a',
  tap: '211d5c0e-3356-43e2-8be0-4da157a8e72d',
  'teacher/student': 'a00513f1-bb3a-4d73-a265-4b3f85feabda',
  vocal: '1ca1a436-b0ce-4c4f-ae6d-6ad9f936ed05',
  'variety a - song & dance, character, or combination': '9d622455-deba-4e24-8e7f-686b62a53cc8',
  'variety b - dance with prop': '01f54673-1df7-4d88-b47d-ff7e18873697',
  'variety c - dance with acrobatics': '94b14fe5-f434-449b-a564-2b61610b8a5e',
  'variety d - dance with acrobatics & prop': 'f4dd7c60-14f7-4dec-ab1e-a9e35a2adafc',
  'variety e - hip hop with floor work & acrobatics': 'f0d36c14-a80a-4847-9f4f-04485b08c0e5',
  'variety f - ballroom': 'cac1bbaf-9a58-40ea-b93b-bfabf0f698b5',
  'variety g - line dancing': '99f91644-cafd-4628-bbc3-d5788e674012',
};

/**
 * Scoring app `entries.ability_level` has a CHECK constraint that allows
 * only the bare labels: 'Beginning' | 'Intermediate' | 'Advanced'. The
 * website stores the long form ("ADVANCED (Starting the 5th year or more
 * of training)"), so we collapse to the first word here.
 */
const normalizeAbilityLevel = (raw: unknown): 'Beginning' | 'Intermediate' | 'Advanced' => {
  if (typeof raw !== 'string' || !raw.trim()) return 'Intermediate';
  const lower = raw.toLowerCase().trim();
  if (lower.startsWith('beginning')) return 'Beginning';
  if (lower.startsWith('intermediate')) return 'Intermediate';
  if (lower.startsWith('advanced')) return 'Advanced';
  return 'Intermediate';
};

/**
 * Lowercased website `reg.category` value → key in CATEGORY_MAP.
 * (Website stores labels like `TAP`, `VARIETY B (Dance with Prop)`.)
 */
const WEBSITE_CATEGORY_TO_MAP_KEY: Record<string, string> = {
  tap: 'tap',
  ballet: 'ballet',
  jazz: 'jazz',
  'lyrical/contemporary': 'lyrical/contemporary',
  vocal: 'vocal',
  acting: 'acting',
  'hip hop': 'hip hop',
  'variety a (song & dance/character/combination of performing arts)':
    'variety a - song & dance, character, or combination',
  'variety b (dance with prop)': 'variety b - dance with prop',
  'variety c (dance with acrobatics)': 'variety c - dance with acrobatics',
  'variety d (dance with acrobatics & prop)': 'variety d - dance with acrobatics & prop',
  'variety e (hip hop)': 'variety e - hip hop with floor work & acrobatics',
  'variety f (ballroom)': 'variety f - ballroom',
  'variety g (line dancing)': 'variety g - line dancing',
  production: 'production',
  'student choreography': 'student choreography',
  'teacher/student': 'teacher/student',
};

const getCategoryId = (category: string): string | null => {
  const key = category?.toLowerCase().trim() ?? '';
  const mapKey = WEBSITE_CATEGORY_TO_MAP_KEY[key] ?? key;
  return CATEGORY_MAP[mapKey] ?? null;
};

const getDivisionType = (groupSize: string): string => {
  const s = groupSize?.toLowerCase() || '';
  if (s.includes('duo')) return 'Duo';
  if (s.includes('trio')) return 'Trio';
  if (s.includes('small')) return 'Small Group';
  if (s.includes('large')) return 'Large Group';
  if (s.includes('production')) return 'Production';
  return 'Solo';
};

const buildGroupMembers = (reg: Record<string, unknown>): string[] => {
  const raw = reg.participants_json;
  if (raw == null) return [];
  try {
    const participants =
      typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(participants)) return [];
    return participants
      .map((p: unknown) => {
        if (p && typeof p === 'object' && 'name' in p) {
          const n = (p as { name?: unknown }).name;
          if (typeof n === 'string' && n.trim() !== '') return n.trim();
        }
        if (p && typeof p === 'object' && 'competitor_name' in p) {
          const n = (p as { competitor_name?: unknown }).competitor_name;
          if (typeof n === 'string' && n.trim() !== '') return n.trim();
        }
        return typeof p === 'string' ? p : '';
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

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

  if (!WEBSITE_URL || !WEBSITE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in the Edge Function environment (should be automatic on Supabase-hosted functions).',
      }),
      { status: 500, headers: JSON_HEADERS },
    );
  }

  const websiteClient = createClient(WEBSITE_URL, WEBSITE_SERVICE_ROLE_KEY);

  if (!SCORING_APP_URL || !SCORING_APP_SERVICE_ROLE_KEY) {
    const msg =
      'SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY secrets are not configured. Add them in the Supabase dashboard under Edge Function secrets, then retry sync.';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  }

  const { data: reg, error: regErr } = await websiteClient
    .from('registrations')
    .select('*')
    .eq('id', registrationId)
    .single();

  if (regErr || !reg) {
    const msg = `Registration not found: ${regErr?.message ?? 'no row'}`;
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const scoringClient = createClient(SCORING_APP_URL, SCORING_APP_SERVICE_ROLE_KEY);
  const competitionId = COMPETITION_ID;

  const categoryRaw = typeof reg.category === 'string' ? reg.category : '';
  const websiteCategory = categoryRaw.trim();
  let categoryId = getCategoryId(categoryRaw);

  // Dynamic fallback: if static map misses, look up by name in scoring app
  // so newly added categories sync without redeploying this function.
  if (!categoryId && websiteCategory) {
    const { data: cat } = await scoringClient
      .from('categories')
      .select('id, name')
      .eq('competition_id', competitionId)
      .ilike('name', websiteCategory)
      .maybeSingle();
    if (cat?.id) {
      categoryId = cat.id;
    }
  }

  if (!categoryId) {
    const msg =
      'No scoring category for "' + websiteCategory + '". ' +
      'Add it to the scoring app competition first.';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg, category: categoryRaw }), {
      status: 422,
      headers: JSON_HEADERS,
    });
  }

  const age = parseInt(String(reg.age), 10) || 0;
  const groupSize = typeof reg.group_size === 'string' ? reg.group_size : 'Solo';
  const groupMembers = buildGroupMembers(reg as Record<string, unknown>);
  const divisionType = getDivisionType(groupSize);

  const competitorName =
    divisionType === 'Solo'
      ? String(reg.contestant_name ?? '').trim()
      : String(
        (typeof reg.routine_name === 'string' && reg.routine_name.trim()) ||
          reg.contestant_name ||
          '',
      ).trim();

  if (!competitorName) {
    const msg = 'Missing competitor_name: need contestant_name (solo) or routine_name / contestant_name (group).';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 422, headers: JSON_HEADERS });
  }

  const { data: existing } = await scoringClient
    .from('entries')
    .select('id')
    .eq('competition_id', competitionId)
    .eq('website_registration_id', reg.id)
    .eq('competitor_name', competitorName)
    .maybeSingle();

  if (existing) {
    await updateSyncStatus(websiteClient, registrationId, 'synced', existing.id, null);
    return new Response(JSON.stringify({ success: true, alreadySynced: true }), {
      status: 200,
      headers: JSON_HEADERS,
    });
  }

  const { data: maxEntry } = await scoringClient
    .from('entries')
    .select('entry_number')
    .eq('competition_id', competitionId)
    .order('entry_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextEntryNumber = (maxEntry?.entry_number ?? 0) + 1;

  const entryPayload = {
    competition_id: competitionId,
    entry_number: nextEntryNumber,
    competitor_name: competitorName,
    category_id: categoryId,
    age_division_id: getAgeDivisionId(age),
    age,
    dance_type: categoryRaw,
    ability_level: normalizeAbilityLevel(reg.ability_level),
    studio_name: reg.studio_name || '',
    teacher_name: reg.teacher_name || '',
    group_members: groupMembers.length > 0 ? groupMembers : null,
    division_type: divisionType,
    is_medal_program: true,
    medal_points: 0,
    current_medal_level: 'None',
    website_registration_id: reg.id,
  };

  console.log('[sync-to-scoring-app] entryPayload:', JSON.stringify(entryPayload));

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
    return new Response(JSON.stringify({ error: msg, entryPayload }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  await updateSyncStatus(websiteClient, registrationId, 'synced', insertData.id, null);

  return new Response(
    JSON.stringify({
      success: true,
      contestantId: insertData.id,
      entryNumber: nextEntryNumber,
      competitionId,
      entryPayload,
    }),
    { status: 200, headers: JSON_HEADERS },
  );
});
