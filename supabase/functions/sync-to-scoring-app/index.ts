import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  resolveAgeDivisionId,
  resolveCategoryId,
  resolveCompetitionId,
} from '../_shared/scoringCompetition.ts';

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

const normalizeAbilityLevel = (raw: unknown): 'Beginning' | 'Intermediate' | 'Advanced' => {
  if (typeof raw !== 'string' || !raw.trim()) return 'Intermediate';
  const lower = raw.toLowerCase().trim();
  if (lower.startsWith('beginning')) return 'Beginning';
  if (lower.startsWith('intermediate')) return 'Intermediate';
  if (lower.startsWith('advanced')) return 'Advanced';
  return 'Intermediate';
};

const getDivisionType = (groupSize: string): 'Solo' | 'Duo' | 'Trio' | 'Production' => {
  const s = groupSize?.toLowerCase() || '';
  if (s.includes('duo')) return 'Duo';
  if (s.includes('trio')) return 'Trio';
  if (s.includes('production')) return 'Production';
  if (s.includes('small') || s.includes('large')) return 'Production';
  return 'Solo';
};

const buildGroupMembers = (reg: Record<string, unknown>): string[] => {
  const raw = reg.participants_json;
  if (raw == null) return [];
  try {
    const participants = typeof raw === 'string' ? JSON.parse(raw) : raw;
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
  let bodyCompetitionId: string | undefined;
  try {
    const body = await req.json();
    registrationId = body?.registrationId;
    bodyCompetitionId = body?.competitionId;
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

  const resolved = await resolveCompetitionId(websiteClient, bodyCompetitionId);
  if ('error' in resolved) {
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, resolved.error);
    return new Response(JSON.stringify({ error: resolved.error }), {
      status: 422,
      headers: JSON_HEADERS,
    });
  }
  const competitionId = resolved.competitionId;

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

  const categoryRaw = typeof reg.category === 'string' ? reg.category : '';
  const websiteCategory = categoryRaw.trim();
  const categoryId = await resolveCategoryId(scoringClient, competitionId, categoryRaw);

  if (!categoryId) {
    const msg =
      `No scoring category for "${websiteCategory}". ` +
      'Add it to the scoring app competition first.';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg, category: categoryRaw }), {
      status: 422,
      headers: JSON_HEADERS,
    });
  }

  const age = parseInt(String(reg.age), 10) || 0;
  const ageDivisionId = await resolveAgeDivisionId(scoringClient, competitionId, age);
  if (!ageDivisionId) {
    const msg =
      'No age division found in the scoring app for this competition. Add age divisions in the scoring app first.';
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 422,
      headers: JSON_HEADERS,
    });
  }

  const groupSize = typeof reg.group_size === 'string' ? reg.group_size : 'Solo';
  const groupMembers = buildGroupMembers(reg as Record<string, unknown>);
  const divisionType = getDivisionType(groupSize);
  const abilityLevel = normalizeAbilityLevel(reg.ability_level);

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

  const buildParticipantRows = (performanceId: string) => {
    const participantRows: {
      performance_id: string;
      display_name: string;
      age: number | null;
      sort_order: number;
    }[] = [];
    if (groupMembers.length > 0) {
      groupMembers.forEach((name, idx) => {
        const n = typeof name === 'string' ? name.trim() : '';
        if (n) participantRows.push({ performance_id: performanceId, display_name: n, age: null, sort_order: idx });
      });
    }
    if (participantRows.length === 0) {
      participantRows.push({
        performance_id: performanceId,
        display_name: competitorName,
        age: age || null,
        sort_order: 0,
      });
    }
    return participantRows;
  };

  let performanceId: string | null = null;

  if (divisionType !== 'Solo') {
    const { data: sibling } = await scoringClient
      .from('entries')
      .select('performance_id')
      .eq('competition_id', competitionId)
      .eq('division_type', divisionType)
      .eq('competitor_name', competitorName)
      .not('performance_id', 'is', null)
      .limit(1)
      .maybeSingle();
    if (sibling?.performance_id) {
      performanceId = sibling.performance_id as string;
    }
  }

  if (!performanceId) {
    const perfPayload = {
      competition_id: competitionId,
      entry_number: nextEntryNumber,
      routine_name: null,
      competitor_name: competitorName,
      category_id: categoryId,
      age_division_id: ageDivisionId,
      age,
      dance_type: categoryRaw,
      ability_level: abilityLevel,
      studio_name: reg.studio_name || '',
      teacher_name: reg.teacher_name || '',
      group_members: groupMembers.length > 0 ? groupMembers : null,
      division_type: divisionType,
      is_medal_program: true,
    };

    const { data: perfRow, error: perfErr } = await scoringClient
      .from('performances')
      .insert(perfPayload)
      .select('id')
      .single();

    if (perfErr || !perfRow?.id) {
      const msg = perfErr?.message ?? 'Failed to create performance row';
      await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
      return new Response(JSON.stringify({ error: msg, perfPayload }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    performanceId = perfRow.id as string;

    const { error: partErr } = await scoringClient
      .from('performance_participants')
      .insert(buildParticipantRows(performanceId));
    if (partErr) {
      await scoringClient.from('performances').delete().eq('id', performanceId);
      const msg = partErr.message;
      await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
      return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
    }
  } else {
    await scoringClient
      .from('performances')
      .update({
        group_members: groupMembers.length > 0 ? groupMembers : null,
        studio_name: reg.studio_name || '',
        teacher_name: reg.teacher_name || '',
      })
      .eq('id', performanceId);

    if (groupMembers.length > 0) {
      await scoringClient.from('performance_participants').delete().eq('performance_id', performanceId);
      const { error: partErr } = await scoringClient
        .from('performance_participants')
        .insert(buildParticipantRows(performanceId));
      if (partErr) {
        const msg = partErr.message;
        await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
        return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
      }
    }

    await scoringClient
      .from('entries')
      .update({ group_members: groupMembers.length > 0 ? groupMembers : null })
      .eq('performance_id', performanceId);
  }

  const entryPayload = {
    competition_id: competitionId,
    entry_number: nextEntryNumber,
    competitor_name: competitorName,
    category_id: categoryId,
    age_division_id: ageDivisionId,
    age,
    dance_type: categoryRaw,
    ability_level: abilityLevel,
    studio_name: reg.studio_name || '',
    teacher_name: reg.teacher_name || '',
    group_members: groupMembers.length > 0 ? groupMembers : null,
    division_type: divisionType,
    is_medal_program: true,
    medal_points: 0,
    current_medal_level: 'None',
    website_registration_id: reg.id,
    performance_id: performanceId,
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
    await scoringClient.from('performance_participants').delete().eq('performance_id', performanceId);
    await scoringClient.from('performances').delete().eq('id', performanceId);
    await updateSyncStatus(websiteClient, registrationId, 'failed', null, msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: JSON_HEADERS });
  } finally {
    clearTimeout(timeout);
  }

  if (insertErr || !insertData) {
    const msg = insertErr?.message ?? 'Insert returned no data';
    await scoringClient.from('performance_participants').delete().eq('performance_id', performanceId);
    await scoringClient.from('performances').delete().eq('id', performanceId);
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
