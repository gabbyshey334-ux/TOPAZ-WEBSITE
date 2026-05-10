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

// Map website `age_division` labels → scoring app `age_group` values
function mapAgeGroup(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (s.startsWith('3'))  return '3-7';
  if (s.startsWith('8'))  return '8-12';
  if (s.startsWith('13')) return '13-18';
  if (s.startsWith('19') || s.toLowerCase().includes('up')) return '19+';
  // Legacy divisions (in case old registrations used previous labels)
  if (s.includes('8–10') || s.includes('8-10')) return '8-12';
  if (s.includes('11–13') || s.includes('11-13')) return '13-18';
  if (s.includes('14–18') || s.includes('14-18')) return '13-18';
  return null;
}

// Map website ability_level labels (full text) → scoring app values
function mapAbilityLevel(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower.startsWith('beginning'))    return 'Beginning';
  if (lower.startsWith('intermediate')) return 'Intermediate';
  if (lower.startsWith('advanced'))     return 'Advanced';
  return null;
}

const getAgeDivisionId = (age: number): string | null => {
  if (age >= 3 && age <= 7) return 'fd5593b0-dfe5-4329-a00e-964559867a03';
  if (age >= 8 && age <= 12) return '59295514-2972-4ed2-adf8-6e4ca4d005bb';
  if (age >= 13 && age <= 18) return 'c8c35166-e1b8-4d7b-a295-e78029cd9111';
  if (age >= 19) return '7c60b9b7-17d1-471e-a83e-a5dba9bf690c';
  return null;
};

const normalizeDanceType = (type: string): string => {
  const map: Record<string, string> = {
    TAP: 'Tap',
    JAZZ: 'Jazz',
    BALLET: 'Ballet',
    'HIP HOP': 'Hip Hop',
    LYRICAL: 'Lyrical',
    CONTEMPORARY: 'Contemporary',
    ACTING: 'Acting',
    VOCAL: 'Vocal',
    PRODUCTION: 'Production',
    'STUDENT CHOREOGRAPHY': 'Student Choreography',
    'LYRICAL/CONTEMPORARY': 'Lyrical/Contemporary',
  };
  return map[type?.toUpperCase()] || type;
};

// Map website registration `category` values → scoring app `entries.dance_type`
// (must match judge filter / category labels in the scoring app DB).
const WEBSITE_CATEGORY_TO_SCORING_DANCE_TYPE: Record<string, string> = {
  TAP: 'Tap',
  BALLET: 'Ballet',
  JAZZ: 'Jazz',
  'LYRICAL/CONTEMPORARY': 'Lyrical/Contemporary',
  VOCAL: 'Vocal',
  ACTING: 'Acting',
  'HIP HOP': 'Hip Hop',
  'VARIETY A (Song & Dance/Character/Combination of Performing Arts)': 'Variety A',
  'VARIETY B (Dance with Prop)': 'Variety B',
  'VARIETY C (Dance with Acrobatics)': 'Variety C',
  'VARIETY D (Dance with Acrobatics & Prop)': 'Variety D',
  'VARIETY E (Hip Hop)': 'Variety E',
  'VARIETY F (Ballroom)': 'Variety F',
  'VARIETY G (Line Dancing)': 'Variety G',
  PRODUCTION: 'Production',
  'STUDENT CHOREOGRAPHY': 'Student Choreography',
  'TEACHER/STUDENT': 'Teacher/Student',
};

function mapDanceType(raw: string | null): string | null {
  if (raw == null) return null;
  const key = raw.trim();
  if (!key) return null;
  return WEBSITE_CATEGORY_TO_SCORING_DANCE_TYPE[key] ?? key;
}

type RegParticipantsRow = {
  id: string;
  participants_json: unknown;
  contestant_name: string | null;
};

/** Collect unique performer names from one registration row. */
function namesFromParticipantsJson(participants_json: unknown): string[] {
  if (!Array.isArray(participants_json)) return [];
  const out: string[] = [];
  for (const p of participants_json) {
    if (p && typeof p === 'object' && 'name' in p) {
      const n = (p as { name?: unknown }).name;
      if (typeof n === 'string' && n.trim() !== '') out.push(n.trim());
    }
  }
  return out;
}

/**
 * Fetch all website registrations linked by group_link_code or routine_name
 * (same rules as admin) and merge participant + contestant names for scoring `group_members`.
 */
async function buildMergedGroupMemberNames(
  websiteClient: ReturnType<typeof createClient>,
  reg: Record<string, unknown>,
): Promise<string[]> {
  const groupSizeStr = typeof reg.group_size === 'string' ? reg.group_size : '';
  // Solos: never merge by routine/link (different solos could share a routine title).
  if (groupSizeStr.startsWith('Solo')) {
    const seen = new Set<string>();
    const names: string[] = [];
    for (const n of namesFromParticipantsJson(reg.participants_json)) {
      const k = n.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      names.push(n);
    }
    const cn = typeof reg.contestant_name === 'string' ? reg.contestant_name.trim() : '';
    if (cn) {
      const k = cn.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        names.push(cn);
      }
    }
    return names;
  }

  const code = typeof reg.group_link_code === 'string' ? reg.group_link_code.trim() : '';
  const routine = typeof reg.routine_name === 'string' ? reg.routine_name.trim() : '';

  let siblings: RegParticipantsRow[] = [];

  if (code !== '') {
    const { data, error } = await websiteClient
      .from('registrations')
      .select('id, participants_json, contestant_name')
      .eq('group_link_code', code);
    if (!error && data) siblings = data as RegParticipantsRow[];
  } else if (routine !== '') {
    const { data, error } = await websiteClient
      .from('registrations')
      .select('id, participants_json, contestant_name')
      .eq('routine_name', routine);
    if (!error && data) siblings = data as RegParticipantsRow[];
  }

  const selfId = typeof reg.id === 'string' ? reg.id : '';
  const everyone: RegParticipantsRow[] = [...siblings];
  const hasSelf = everyone.some((r) => r.id === selfId);
  if (!hasSelf) {
    everyone.push({
      id: selfId,
      participants_json: reg.participants_json,
      contestant_name: typeof reg.contestant_name === 'string' ? reg.contestant_name : null,
    });
  }

  const seen = new Set<string>();
  const names: string[] = [];
  for (const row of everyone) {
    for (const n of namesFromParticipantsJson(row.participants_json)) {
      const k = n.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      names.push(n);
    }
    const cn = (row.contestant_name ?? '').trim();
    if (cn) {
      const k = cn.toLowerCase();
      if (!seen.has(k)) {
        seen.add(k);
        names.push(cn);
      }
    }
  }

  return names;
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

  // Persist scoring-app misconfiguration on the registration row (admin UI reads this).
  if (!SCORING_APP_URL || !SCORING_APP_SERVICE_ROLE_KEY) {
    const msg =
      'SCORING_APP_URL and SCORING_APP_SERVICE_ROLE_KEY secrets are not configured. Add them in the Supabase dashboard under Edge Function secrets, then retry sync.';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  }

  // ── 1. Fetch the registration ────────────────────────────────────────────────
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
  // Skip only when the same website registration + same competitor_name already exists
  // (allows multiple entries per registration, e.g. group members, with distinct names).
  const { data: existingSameRegAndName } = await scoringClient
    .from('entries')
    .select('id')
    .eq('competition_id', competition.id)
    .eq('website_registration_id', reg.id)
    .eq('competitor_name', entryName)
    .maybeSingle();

  if (existingSameRegAndName) {
    await updateSyncStatus(websiteClient, registrationId, 'synced', existingSameRegAndName.id, null);
    return new Response(
      JSON.stringify({ success: true, alreadySynced: true, contestantId: existingSameRegAndName.id }),
      { status: 200, headers: JSON_HEADERS },
    );
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

  // ── 7. Build group_members array (merge linked Duo/Trio registrations) ─────
  let groupMembers: string[] | null = null;
  const mergedNames = await buildMergedGroupMemberNames(websiteClient, reg as Record<string, unknown>);
  if (mergedNames.length > 0) {
    groupMembers = mergedNames;
  } else if (reg.participants_json && Array.isArray(reg.participants_json)) {
    const names = namesFromParticipantsJson(reg.participants_json);
    if (names.length > 0) groupMembers = names;
  }

  // ── 8. Insert entry into scoring app ─────────────────────────────────────────
  // competitor_name:
  //   • Solo → dancer's name (reg.contestant_name)
  //   • Group (Duo/Trio/Small/Large/Production) → routine_name, so the scoring
  //     app displays the act name rather than an individual dancer's name.
  // Build the payload with only columns known to exist in the scoring app entries table.
  // age_group and group_size are included conditionally — if the scoring app DB doesn't
  // have these columns yet the insert will fail; they can be added via migration later.
  const ageNum = reg.age != null && reg.age !== '' ? parseInt(String(reg.age), 10) : NaN;
  const categoryStr = typeof reg.category === 'string' ? reg.category : null;
  const mappedDance = mapDanceType(categoryStr);
  const danceTypeRaw = normalizeDanceType(mappedDance ?? categoryStr ?? '');
  const dance_type = danceTypeRaw.trim() ? danceTypeRaw : null;

  const entryPayload: Record<string, unknown> = {
    competition_id: competition.id,
    entry_number: entryNumber,
    competitor_name: entryName,
    age: Number.isFinite(ageNum) ? ageNum : null,
    age_division_id: Number.isFinite(ageNum) ? getAgeDivisionId(ageNum) : null,
    dance_type,
    ability_level: mapAbilityLevel(reg.ability_level),
    studio_name: reg.studio_name ?? null,
    teacher_name: reg.teacher_name ?? null,
    group_members: groupMembers,
    website_registration_id: registrationId,
  };

  // Attempt to include age_group — will be ignored gracefully if column absent
  const ageGroup = mapAgeGroup(typeof reg.age_division === 'string' ? reg.age_division : null);
  if (ageGroup) entryPayload.age_group = ageGroup;

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