import { listGymSessions, listResults } from './db';
import { formatScore, parseSessionItems } from './format';
import type { CardioActivity, ResultRow, StrengthExercise, WodFormat } from './types';

/**
 * Personal-record aggregation. Pure, read-only reductions over the existing
 * `results` and `gym_sessions` tables — no schema, no writes. Kept apart from
 * `format.ts` (display) and `db.ts` (CRUD). Screens render what these return.
 */

// ------------------------------------------------------------------- strength

export interface MovementPR {
  name: string;
  /** Heaviest single set ever logged for this movement. */
  topKg: number;
  topReps: number | null;
  /** Best estimated 1RM across all logged sets (Epley; a 1-rep set = its own weight). */
  est1RM: number;
  /** The set the estimate came from, shown only when it isn't the headline set. */
  est1RMSet?: { kg: number; reps: number };
  /** `gym_sessions.id` of the session holding the headline set — for tap-through. */
  sourceId: number;
  achievedAt: string;
}

/** Epley estimate; a single (or unknown-rep) set contributes only its raw weight. */
export function epley1RM(kg: number, reps: number | null | undefined): number {
  if (reps == null || reps <= 1) return kg;
  return kg * (1 + reps / 30);
}

/** Heaviest set + best estimated 1RM per distinct strength movement, heaviest first. */
export function getMovementPRs(): MovementPR[] {
  interface Acc {
    name: string;
    topKg: number;
    topReps: number | null;
    topSourceId: number;
    topAt: string;
    est1RM: number;
    estKg: number;
    estReps: number;
  }
  const byName = new Map<string, Acc>();

  for (const row of listGymSessions()) {
    if (row.kind !== 'strength') continue;
    const items = parseSessionItems(row) as StrengthExercise[];
    for (const ex of items) {
      const name = (ex.name ?? '').trim();
      if (!name || !Array.isArray(ex.sets)) continue;
      const key = name.toLowerCase();

      for (const set of ex.sets) {
        if (set.kg == null) continue;
        const kg = set.kg;
        const reps = set.reps ?? null;
        const est = epley1RM(kg, reps);
        const cur = byName.get(key);

        if (!cur) {
          byName.set(key, {
            name,
            topKg: kg,
            topReps: reps,
            topSourceId: row.id,
            topAt: row.performed_at,
            est1RM: est,
            estKg: kg,
            estReps: reps ?? 1,
          });
          continue;
        }
        // Headline = heaviest set; tie-break on higher reps at that weight.
        if (kg > cur.topKg || (kg === cur.topKg && (reps ?? 0) > (cur.topReps ?? 0))) {
          cur.topKg = kg;
          cur.topReps = reps;
          cur.topSourceId = row.id;
          cur.topAt = row.performed_at;
        }
        if (est > cur.est1RM) {
          cur.est1RM = est;
          cur.estKg = kg;
          cur.estReps = reps ?? 1;
        }
      }
    }
  }

  const prs: MovementPR[] = [];
  for (const a of byName.values()) {
    const differs = a.estKg !== a.topKg || a.estReps !== (a.topReps ?? 1);
    prs.push({
      name: a.name,
      topKg: a.topKg,
      topReps: a.topReps,
      est1RM: a.est1RM,
      est1RMSet: differs ? { kg: a.estKg, reps: a.estReps } : undefined,
      sourceId: a.topSourceId,
      achievedAt: a.topAt,
    });
  }
  prs.sort((a, b) => b.topKg - a.topKg || a.name.localeCompare(b.name));
  return prs;
}

// --------------------------------------------------------------------- cardio

export interface CardioPR {
  name: string;
  bestDistanceM?: number;
  distanceSourceId?: number;
  distanceAt?: string;
  bestCalories?: number;
  caloriesSourceId?: number;
  caloriesAt?: string;
}

/**
 * Furthest distance and most calories per distinct cardio activity. Raw duration
 * isn't ranked — without a fixed distance there's no "faster" to compare.
 */
export function getCardioPRs(): CardioPR[] {
  const byName = new Map<string, CardioPR>();

  for (const row of listGymSessions()) {
    if (row.kind !== 'cardio') continue;
    const items = parseSessionItems(row) as CardioActivity[];
    for (const act of items) {
      const name = (act.name ?? '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      let cur = byName.get(key);
      if (!cur) {
        cur = { name };
        byName.set(key, cur);
      }
      if (act.distanceM != null && (cur.bestDistanceM == null || act.distanceM > cur.bestDistanceM)) {
        cur.bestDistanceM = act.distanceM;
        cur.distanceSourceId = row.id;
        cur.distanceAt = row.performed_at;
      }
      if (act.calories != null && (cur.bestCalories == null || act.calories > cur.bestCalories)) {
        cur.bestCalories = act.calories;
        cur.caloriesSourceId = row.id;
        cur.caloriesAt = row.performed_at;
      }
    }
  }

  return [...byName.values()]
    .filter((p) => p.bestDistanceM != null || p.bestCalories != null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ------------------------------------------------------------------------ WOD

export interface WodPR {
  wodRef: string;
  wodName: string;
  format: WodFormat;
  scoreDisplay: string;
  sourceId: number;
  achievedAt: string;
}

/** Formats with an unambiguous "better" direction. INTERVALS/OTHER are freeform → not ranked. */
const RANKABLE_FORMATS = new Set<WodFormat>(['FOR_TIME', 'AMRAP', 'EMOM', 'TABATA', 'FOR_LOAD']);

/** True when `a` is a strictly better score than `b` (same WOD, same format). */
function isBetter(a: ResultRow, b: ResultRow): boolean {
  switch (a.wod_format) {
    case 'FOR_TIME': {
      const aCap = a.is_capped === 1;
      const bCap = b.is_capped === 1;
      if (aCap !== bCap) return !aCap; // a finished, b hit the cap → a wins
      if (!aCap) {
        // Both finished — lower time wins.
        return (a.score_time_sec ?? Infinity) < (b.score_time_sec ?? Infinity);
      }
      // Both capped — further into the workout (more reps) wins.
      return (a.score_reps ?? -1) > (b.score_reps ?? -1);
    }
    case 'AMRAP': {
      const ar = a.score_rounds ?? -1;
      const br = b.score_rounds ?? -1;
      if (ar !== br) return ar > br;
      return (a.score_reps ?? -1) > (b.score_reps ?? -1);
    }
    case 'EMOM':
      return (a.score_rounds ?? -1) > (b.score_rounds ?? -1);
    case 'TABATA':
      return (a.score_reps ?? -1) > (b.score_reps ?? -1);
    case 'FOR_LOAD':
      return (a.score_load_kg ?? -1) > (b.score_load_kg ?? -1);
    default:
      return false; // INTERVALS / OTHER — not ranked
  }
}

/** Best result per benchmark WOD among rankable formats, by name. Custom/box WODs don't rank. */
export function getWodPRs(): WodPR[] {
  const best = new Map<string, ResultRow>();
  for (const row of listResults()) {
    if (!row.wod_ref.startsWith('benchmark:')) continue;
    if (!RANKABLE_FORMATS.has(row.wod_format)) continue;
    const cur = best.get(row.wod_ref);
    if (!cur || isBetter(row, cur)) best.set(row.wod_ref, row);
  }

  return [...best.values()]
    .map((row) => ({
      wodRef: row.wod_ref,
      wodName: row.wod_name,
      format: row.wod_format,
      scoreDisplay: formatScore(row),
      sourceId: row.id,
      achievedAt: row.performed_at,
    }))
    .sort((a, b) => a.wodName.localeCompare(b.wodName));
}
