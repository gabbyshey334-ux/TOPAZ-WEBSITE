import type { Database, Json } from '@/types/database';

export type RegistrationRow = Database['public']['Tables']['registrations']['Row'];

/** @deprecated Use `useScoringCompetitionId()` — reads active event's `scoring_competition_id`. */
export const SCORING_COMPETITION_ID = '60874ab6-341e-4e21-9e62-7fe686530607';

/** Names from scoring `group_members` JSON (strings or `{ name }` / `{ competitor_name }`). */
export function parseGroupMemberNames(gm: Json | null | undefined): string[] {
  if (!Array.isArray(gm)) return [];
  const out: string[] = [];
  for (const x of gm) {
    if (typeof x === 'string') {
      const n = x.trim();
      if (n) out.push(n);
      continue;
    }
    if (x && typeof x === 'object') {
      const o = x as { name?: unknown; competitor_name?: unknown };
      const n =
        (typeof o.name === 'string' ? o.name : '') ||
        (typeof o.competitor_name === 'string' ? o.competitor_name : '');
      if (n.trim()) out.push(n.trim());
    }
  }
  return out;
}

/** Normalize routine / group link keys the same way as admin grouping. */
export function normalizeRegistrationKey(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase();
}

export function findLinkedRegistrations(row: RegistrationRow, all: RegistrationRow[]): RegistrationRow[] {
  const routineKey = normalizeRegistrationKey(row.routine_name);
  const codeKey = normalizeRegistrationKey(row.group_link_code);
  if (!routineKey && !codeKey) return [];
  return all.filter((r) => {
    if (r.id === row.id) return false;
    const rRoutine = normalizeRegistrationKey(r.routine_name);
    const rCode = normalizeRegistrationKey(r.group_link_code);
    return (
      (routineKey !== '' && rRoutine === routineKey) ||
      (codeKey !== '' && rCode === codeKey)
    );
  });
}

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
 * Merges participant names (and registering contestant names) across linked
 * registrations so Duo/Trio entries split across multiple rows still resolve
 * to the correct performer count.
 */
export function mergedParticipantNamesForRegistration(
  row: RegistrationRow,
  all: RegistrationRow[],
): string[] {
  const everyone = [row, ...findLinkedRegistrations(row, all)];
  const seen = new Set<string>();
  const names: string[] = [];
  for (const r of everyone) {
    for (const n of namesFromParticipantsJson(r.participants_json)) {
      const k = n.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      names.push(n);
    }
    const cn = (r.contestant_name ?? '').trim();
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

/** Short label from website `group_size` option text (fallback when no merged names). */
export function groupSizeToEntryType(groupSize: string): string {
  if (groupSize.startsWith('Solo')) return 'Solo';
  if (groupSize.startsWith('Duo')) return 'Duo';
  if (groupSize.startsWith('Trio')) return 'Trio';
  if (groupSize.startsWith('Small Group')) return 'Small Group';
  if (groupSize.startsWith('Large Group')) return 'Large Group';
  if (groupSize.startsWith('Production')) return 'Production';
  return groupSize;
}

/**
 * Division type for admin filters: Solo / Duo / Trio / Small Group / Large Group
 * from `group_members` (or merged participant list), not from `dance_type` / category.
 */
export function getEntryType(entry: { group_members?: unknown }): string {
  const members = parseGroupMemberNames(entry.group_members as Json | null);
  const count = members.length;
  if (count <= 1) return 'Solo';
  if (count === 2) return 'Duo';
  if (count === 3) return 'Trio';
  if (count >= 4 && count <= 10) return 'Small Group';
  if (count >= 11) return 'Large Group';
  return 'Solo';
}

/** Same as `getEntryType` but for a website registration row + full registration list. */
export function registrationDivisionTypeLabel(row: RegistrationRow, all: RegistrationRow[]): string {
  const declared = groupSizeToEntryType(row.group_size ?? '');
  // Declared group sizes can list more performers than we have names for in the DB.
  if (declared === 'Small Group' || declared === 'Large Group' || declared === 'Production') {
    return declared;
  }
  const merged = mergedParticipantNamesForRegistration(row, all);
  if (merged.length > 0) return getEntryType({ group_members: merged });
  return declared;
}
