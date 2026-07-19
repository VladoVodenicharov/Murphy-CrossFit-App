import {
  WOD_FORMAT_LABEL,
  type CardioActivity,
  type GymSessionRow,
  type Movement,
  type ResultRow,
  type StrengthExercise,
  type WodDef,
} from './types';

/** 754 → "12:34"; always minutes:seconds, minutes not zero-padded. */
export function mmss(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${m}:${ss.toString().padStart(2, '0')}`;
}

/** "12" + "34" → 754 seconds; null when both fields are empty/invalid. */
export function parseTime(mm: string, ss: string): number | null {
  const m = parseIntField(mm);
  const s = parseIntField(ss);
  if (m == null && s == null) return null;
  return (m ?? 0) * 60 + (s ?? 0);
}

/** "21" → 21; ""/garbage/negative → undefined-ish null. */
export function parseIntField(text: string): number | null {
  const n = Number.parseInt(text.trim(), 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** "102.5" → 102.5; ""/garbage/negative → null. */
export function parseFloatField(text: string): number | null {
  const n = Number.parseFloat(text.trim().replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Human score string for a saved result. */
export function formatScore(row: ResultRow): string {
  switch (row.wod_format) {
    case 'FOR_TIME':
      if (row.is_capped) return row.score_reps != null ? `CAP · ${row.score_reps} reps` : 'CAP';
      return row.score_time_sec != null ? mmss(row.score_time_sec) : '—';
    case 'AMRAP':
      return `${row.score_rounds ?? 0} rds + ${row.score_reps ?? 0}`;
    case 'EMOM':
      return row.score_rounds != null ? `${row.score_rounds} rounds` : 'Done';
    case 'TABATA':
      return row.score_reps != null ? `${row.score_reps} reps` : 'Done';
    case 'FOR_LOAD': {
      const load = row.score_load_kg != null ? `${trimNumber(row.score_load_kg)} kg` : '—';
      return row.score_reps != null ? `${load} × ${row.score_reps}` : load;
    }
    case 'INTERVALS':
    case 'OTHER': {
      const parts: string[] = [];
      if (row.score_time_sec != null) parts.push(mmss(row.score_time_sec));
      if (row.score_rounds != null) parts.push(`${row.score_rounds} rds`);
      if (row.score_reps != null) parts.push(`${row.score_reps} reps`);
      if (row.score_load_kg != null) parts.push(`${trimNumber(row.score_load_kg)} kg`);
      return parts.join(' · ') || 'Done';
    }
  }
}

/** 102.5 → "102.5", 100 → "100" (no trailing ".0"). */
function trimNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Parse a gym session's `items_json`, tolerating malformed/absent data. */
export function parseSessionItems(row: GymSessionRow): (StrengthExercise | CardioActivity)[] {
  try {
    const items = JSON.parse(row.items_json) as (StrengthExercise | CardioActivity)[];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** "Back Squat · Bench Press +1" — a session's display title. */
export function sessionTitle(row: GymSessionRow): string {
  const items = parseSessionItems(row);
  if (items.length === 0) return 'Gym session';
  const names = items.map((i) => i.name);
  const shown = names.slice(0, 2).join(' · ');
  const extra = names.length - 2;
  return extra > 0 ? `${shown} +${extra}` : shown;
}

/** Human score string for a logged gym session — leads with the first exercise/activity. */
export function formatGymScore(row: GymSessionRow): string {
  const items = parseSessionItems(row);
  if (items.length === 0) return 'Done';
  const parts: string[] = [];

  if (row.kind === 'strength') {
    const ex = items[0] as StrengthExercise;
    const withLoad = ex.sets.filter((s) => s.kg != null);
    const top = withLoad.length > 0 ? withLoad.reduce((a, b) => (b.kg! > a.kg! ? b : a)) : ex.sets[0];
    if (top) {
      const reps = top.reps != null ? `${top.reps}` : '—';
      parts.push(top.kg != null ? `${reps} × ${trimNumber(top.kg)}kg` : `${reps} reps`);
    }
    if (ex.calories != null) parts.push(`${ex.calories} cal`);
  } else {
    const act = items[0] as CardioActivity;
    if (act.durationSec != null) parts.push(mmss(act.durationSec));
    if (act.distanceM != null) parts.push(`${trimNumber(act.distanceM)}m`);
    if (act.calories != null) parts.push(`${act.calories} cal`);
  }

  const lead = parts.join(' · ') || 'Done';
  return items.length > 1 ? `${lead} +${items.length - 1}` : lead;
}

/** ISO timestamp → "16 Jul · 22:45" in the device locale. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return date;
}

/** Summary line for a WOD definition, e.g. "For Time · cap 60′" or "EMOM · 30 × 1:00". */
export function wodBlurb(def: WodDef): string {
  if (def.blurb) return def.blurb;
  const label = WOD_FORMAT_LABEL[def.format];
  const { capSec, durationSec, intervalSec, rounds } = def.params;
  switch (def.format) {
    case 'FOR_TIME': {
      const parts = [label];
      if (rounds) parts.unshift(`${rounds} rounds`);
      if (capSec) parts.push(`cap ${Math.round(capSec / 60)}′`);
      return parts.join(' · ');
    }
    case 'AMRAP':
      return durationSec ? `${label} · ${Math.round(durationSec / 60)}′` : label;
    case 'EMOM':
      return rounds && intervalSec ? `${label} · ${rounds} × ${mmss(intervalSec)}` : label;
    case 'INTERVALS':
      return rounds ? `${label} · ${rounds} rounds` : label;
    case 'TABATA':
      return `${label} · 8 × 0:20 / 0:10`;
    default:
      return label;
  }
}

/** "Thruster · Pull-up" (+n more) — used on library rows. */
export function movementsSummary(def: WodDef, max = 3): string {
  const names = def.movements.map((m) => m.name);
  if (names.length === 0) return '';
  const shown = names.slice(0, max).join(' · ');
  const extra = names.length - max;
  return extra > 0 ? `${shown} +${extra}` : shown;
}

/** One movement as a display line, e.g. "12 Deadlift · 70 kg", "400 m Run", "Row · cal". */
export function movementLine(m: Movement): string {
  const unit = m.unit ?? 'reps';
  const load = m.weightKg != null ? ` · ${trimNumber(m.weightKg)} kg` : '';
  let lead = '';
  if (m.quantity != null) {
    if (unit === 'reps') lead = `${m.quantity} `;
    else if (unit === 'm') lead = `${m.quantity} m `;
    else if (unit === 'cal') lead = `${m.quantity} cal `;
    else if (unit === 'sec') lead = `${m.quantity}s `;
  }
  // Cardio with no fixed amount still shows its unit, e.g. "Row · cal".
  const trailingUnit = m.quantity == null && unit !== 'reps' ? ` · ${unit}` : '';
  return `${lead}${m.name}${trailingUnit}${load}`;
}
