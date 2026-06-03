import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export type ResolveCompetitionResult =
  | { competitionId: string }
  | { error: string };

async function resolveFromWebsiteEventId(
  websiteClient: SupabaseClient,
  websiteEventId: string,
): Promise<ResolveCompetitionResult> {
  const { data: event, error: eventErr } = await websiteClient
    .from('events')
    .select('scoring_competition_id')
    .eq('id', websiteEventId)
    .maybeSingle();

  if (eventErr) {
    return { error: `Failed to load website event: ${eventErr.message}` };
  }
  if (!event) {
    return { error: `Website event not found: ${websiteEventId}` };
  }

  const fromEvent =
    typeof event.scoring_competition_id === 'string'
      ? event.scoring_competition_id.trim()
      : '';
  if (!fromEvent) {
    return {
      error:
        'This event has no scoring_competition_id configured. Link it to a scoring app competition in admin.',
    };
  }

  return { competitionId: fromEvent };
}

/** Resolve scoring competition: body override → registration event → active event → env. */
export async function resolveCompetitionId(
  websiteClient: SupabaseClient,
  bodyCompetitionId?: string | null,
  websiteEventId?: string | null,
): Promise<ResolveCompetitionResult> {
  const override = typeof bodyCompetitionId === 'string' ? bodyCompetitionId.trim() : '';
  if (override) return { competitionId: override };

  const regEventId = typeof websiteEventId === 'string' ? websiteEventId.trim() : '';
  if (regEventId) {
    return resolveFromWebsiteEventId(websiteClient, regEventId);
  }

  const { data: event, error: eventErr } = await websiteClient
    .from('events')
    .select('scoring_competition_id')
    .eq('is_active', true)
    .order('date', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (eventErr) {
    return { error: `Failed to load active event: ${eventErr.message}` };
  }

  const fromActiveEvent =
    typeof event?.scoring_competition_id === 'string'
      ? event.scoring_competition_id.trim()
      : '';
  if (fromActiveEvent) return { competitionId: fromActiveEvent };

  const fromEnv = Deno.env.get('SCORING_COMPETITION_ID')?.trim() ?? '';
  if (fromEnv) return { competitionId: fromEnv };

  return {
    error:
      'No scoring competition is linked to this registration\'s event. ' +
      'Go to Admin → Events, select the correct scoring app competition from the dropdown, and click Save Changes.',
  };
}

/** Website registration category label → scoring app category name for lookup. */
export const WEBSITE_CATEGORY_TO_SCORING_NAME: Record<string, string> = {
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

export async function resolveCategoryId(
  scoringClient: SupabaseClient,
  competitionId: string,
  categoryRaw: string,
): Promise<string | null> {
  const websiteCategory = categoryRaw.trim();
  if (!websiteCategory) return null;

  const key = websiteCategory.toLowerCase();
  const scoringName = WEBSITE_CATEGORY_TO_SCORING_NAME[key] ?? key;

  const searchNames = [...new Set([scoringName, key, websiteCategory])];

  for (const name of searchNames) {
    const { data: cat } = await scoringClient
      .from('categories')
      .select('id')
      .eq('competition_id', competitionId)
      .ilike('name', name)
      .limit(1)
      .maybeSingle();
    if (cat?.id) return cat.id as string;
  }

  return null;
}

type AgeDivisionRow = {
  id: string;
  min_age: number | null;
  max_age: number | null;
};

export async function resolveAgeDivisionId(
  scoringClient: SupabaseClient,
  competitionId: string,
  age: number,
): Promise<string | null> {
  const { data: divisions, error } = await scoringClient
    .from('age_divisions')
    .select('id, min_age, max_age')
    .eq('competition_id', competitionId)
    .order('min_age', { ascending: true });

  if (error || !divisions?.length) return null;

  for (const d of divisions as AgeDivisionRow[]) {
    const min = d.min_age ?? 0;
    const max = d.max_age;
    if (age >= min && (max == null || age <= max)) {
      return d.id;
    }
  }

  const last = divisions[divisions.length - 1] as AgeDivisionRow;
  return last?.id ?? null;
}
