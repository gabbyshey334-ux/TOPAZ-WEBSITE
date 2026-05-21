import { createClient } from 'jsr:@supabase/supabase-js@2';
import { resolveCompetitionId } from '../_shared/scoringCompetition.ts';

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

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

type EntryRef = {
  id: string;
  performance_id: string | null;
  website_registration_id: string | null;
  competitor_name: string | null;
  entry_number: number | null;
};

type PerfRef = {
  id: string;
  competitor_name: string | null;
  entry_number: number | null;
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let dryRun = true;
  let bodyCompetitionId: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    if (body && typeof body === 'object' && 'dryRun' in body) {
      dryRun = Boolean((body as { dryRun?: unknown }).dryRun);
    }
    if (body && typeof body === 'object' && 'competitionId' in body) {
      bodyCompetitionId = (body as { competitionId?: string }).competitionId;
    }
  } catch {
    // default dryRun true
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

  const resolved = await resolveCompetitionId(websiteClient, bodyCompetitionId);
  if ('error' in resolved) {
    return json({ error: resolved.error }, 422);
  }
  const competitionId = resolved.competitionId;

  const { data: regs, error: regErr } = await websiteClient.from('registrations').select('id');
  if (regErr) return json({ error: regErr.message }, 500);

  const liveRegIds = new Set((regs ?? []).map((r) => r.id as string));

  const { data: entries, error: entErr } = await scoringClient
    .from('entries')
    .select('id, performance_id, website_registration_id, competitor_name, entry_number')
    .eq('competition_id', competitionId);

  if (entErr) return json({ error: entErr.message }, 500);

  const entryList = (entries ?? []) as EntryRef[];
  const orphanEntries = entryList.filter((e) => {
    const regId = e.website_registration_id;
    if (!regId) return true;
    return !liveRegIds.has(regId);
  });

  const { data: performances, error: perfErr } = await scoringClient
    .from('performances')
    .select('id, competitor_name, entry_number')
    .eq('competition_id', competitionId);

  if (perfErr) return json({ error: perfErr.message }, 500);

  const perfList = (performances ?? []) as PerfRef[];
  const perfIdsReferenced = new Set(
    entryList.map((e) => e.performance_id).filter((id): id is string => Boolean(id)),
  );

  const orphanPerformances = perfList.filter((p) => !perfIdsReferenced.has(p.id));

  const errors: string[] = [];
  let deletedEntries = 0;
  let deletedPerformances = 0;

  if (!dryRun) {
    const entryIdsToDelete = new Set(orphanEntries.map((e) => e.id));
    const perfIdsToDelete = new Set(orphanPerformances.map((p) => p.id));

    for (const entryId of entryIdsToDelete) {
      const { error } = await scoringClient.from('entries').delete().eq('id', entryId);
      if (error) errors.push(`entries ${entryId}: ${error.message}`);
      else deletedEntries += 1;
    }

    const remainingPerfIds = new Set(
      entryList
        .filter((e) => !entryIdsToDelete.has(e.id))
        .map((e) => e.performance_id)
        .filter((id): id is string => Boolean(id)),
    );

    for (const perf of perfList) {
      if (remainingPerfIds.has(perf.id)) continue;
      perfIdsToDelete.add(perf.id);
    }

    for (const perfId of perfIdsToDelete) {
      const { error: partErr } = await scoringClient
        .from('performance_participants')
        .delete()
        .eq('performance_id', perfId);
      if (partErr) errors.push(`performance_participants ${perfId}: ${partErr.message}`);

      const { error: perfDelErr } = await scoringClient.from('performances').delete().eq('id', perfId);
      if (perfDelErr) errors.push(`performances ${perfId}: ${perfDelErr.message}`);
      else deletedPerformances += 1;
    }
  }

  if (errors.length > 0) {
    return json(
      {
        error: errors.join('; '),
        dryRun,
        orphanEntries,
        orphanPerformances,
        deletedEntries,
        deletedPerformances,
      },
      500,
    );
  }

  return json({
    success: true,
    dryRun,
    competitionId,
    orphanEntryCount: orphanEntries.length,
    orphanPerformanceCount: orphanPerformances.length,
    orphanEntries: orphanEntries.map((e) => ({
      id: e.id,
      entry_number: e.entry_number,
      competitor_name: e.competitor_name,
      website_registration_id: e.website_registration_id,
    })),
    orphanPerformances: orphanPerformances.map((p) => ({
      id: p.id,
      entry_number: p.entry_number,
      competitor_name: p.competitor_name,
    })),
    deletedEntries,
    deletedPerformances,
  });
});
