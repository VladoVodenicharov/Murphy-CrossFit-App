/** Every CrossFit scoring format Murphy understands. */
export type WodFormat =
  | 'FOR_TIME'
  | 'AMRAP'
  | 'EMOM'
  | 'INTERVALS'
  | 'TABATA'
  | 'FOR_LOAD'
  | 'OTHER';

export const WOD_FORMAT_LABEL: Record<WodFormat, string> = {
  FOR_TIME: 'For Time',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  INTERVALS: 'Intervals',
  TABATA: 'Tabata',
  FOR_LOAD: 'For Load',
  OTHER: 'Other',
};

export const ALL_WOD_FORMATS: readonly WodFormat[] = [
  'FOR_TIME',
  'AMRAP',
  'EMOM',
  'INTERVALS',
  'TABATA',
  'FOR_LOAD',
  'OTHER',
];

/** How a movement's quantity is measured. */
export type MovementUnit = 'reps' | 'cal' | 'm' | 'sec';

export const MOVEMENT_UNITS: readonly MovementUnit[] = ['reps', 'cal', 'm', 'sec'];

export const MOVEMENT_UNIT_LABEL: Record<MovementUnit, string> = {
  reps: 'reps',
  cal: 'cal',
  m: 'm',
  sec: 'sec',
};

/** One structured movement line in a WOD definition. */
export interface Movement {
  name: string;
  /** Amount, interpreted by `unit`. Undefined when the scheme sets it (e.g. 21-15-9). */
  quantity?: number;
  /** Defaults to 'reps' when absent. */
  unit?: MovementUnit;
  /** Optional external load in kg. */
  weightKg?: number;
}

/** Format-specific parameters of a WOD definition. */
export interface WodParams {
  /** FOR_TIME — time cap in seconds. */
  capSec?: number;
  /** AMRAP — total duration in seconds. */
  durationSec?: number;
  /** EMOM / INTERVALS — length of one interval in seconds. */
  intervalSec?: number;
  /** EMOM / INTERVALS / FOR_TIME ("5 rounds for time") — number of rounds. */
  rounds?: number;
}

/**
 * A WOD definition. Benchmarks live in code (`ref: "benchmark:<id>"`);
 * saved custom/box WODs live in SQLite (`ref: "custom:<rowid>"`).
 */
export interface WodDef {
  ref: string;
  name: string;
  format: WodFormat;
  params: WodParams;
  movements: Movement[];
  /** Optional handwritten summary; fall back to `wodBlurb()` when absent. */
  blurb?: string;
  /** Standards / scheme notes, e.g. "21-15-9" or "Partition as needed." */
  description?: string;
}

/** Row shape of the `results` table (snake_case mirrors the SQL columns). */
export interface ResultRow {
  id: number;
  wod_ref: string;
  wod_name: string;
  wod_format: WodFormat;
  score_time_sec: number | null;
  score_rounds: number | null;
  score_reps: number | null;
  score_load_kg: number | null;
  is_capped: number; // 0 | 1
  is_rx: number; // 0 | 1
  notes: string | null;
  performed_at: string; // ISO — when the workout happened
  created_at: string; // ISO — when the log was saved
}

/** Row shape of the `wods` table. */
export interface WodRow {
  id: number;
  name: string;
  format: WodFormat;
  config_json: string;
  movements_json: string;
  created_at: string;
}

/** A gym session is either a strength workout or a cardio workout. */
export type GymKind = 'strength' | 'cardio';

export const GYM_KIND_LABEL: Record<GymKind, string> = {
  strength: 'Strength',
  cardio: 'Cardio',
};

/** One set of a strength exercise. */
export interface StrengthSet {
  reps?: number;
  kg?: number;
}

/** One exercise within a strength session — one or more sets. */
export interface StrengthExercise {
  name: string;
  sets: StrengthSet[];
  /** Optional, e.g. a calorie finisher tacked onto the exercise. */
  calories?: number;
}

/** One activity within a cardio session. */
export interface CardioActivity {
  name: string;
  durationSec?: number;
  distanceM?: number;
  calories?: number;
}

/** Row shape of the `gym_sessions` table — a session holds 1+ exercises/activities. */
export interface GymSessionRow {
  id: number;
  kind: GymKind;
  /** JSON `StrengthExercise[]` (kind='strength') or `CardioActivity[]` (kind='cardio'). */
  items_json: string;
  notes: string | null;
  performed_at: string;
  created_at: string;
}
