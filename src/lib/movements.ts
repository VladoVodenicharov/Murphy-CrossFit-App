/**
 * Seed list of common CrossFit movements — powers name suggestions in the
 * WOD builder and becomes the base of the exercise library the gym-lift
 * feature will reuse later.
 */
export const MOVEMENT_NAMES: readonly string[] = [
  // Squats & lower body
  'Air Squat',
  'Back Squat',
  'Front Squat',
  'Overhead Squat',
  'Pistol',
  'Lunge',
  'Walking Lunge',
  'Overhead Walking Lunge',
  'Box Step-up',
  // Hinge & pulls
  'Deadlift',
  'Sumo Deadlift High Pull',
  'Kettlebell Swing',
  'Good Morning',
  // Olympic lifts
  'Clean',
  'Power Clean',
  'Squat Clean',
  'Hang Power Clean',
  'Clean & Jerk',
  'Push Jerk',
  'Split Jerk',
  'Snatch',
  'Power Snatch',
  'Hang Power Snatch',
  // Presses
  'Shoulder Press',
  'Push Press',
  'Bench Press',
  'Thruster',
  'Wall Ball',
  'Devil Press',
  'Dumbbell Snatch',
  'Dumbbell Thruster',
  // Gymnastics
  'Pull-up',
  'Chest-to-Bar Pull-up',
  'Bar Muscle-up',
  'Ring Muscle-up',
  'Ring Dip',
  'Ring Row',
  'Push-up',
  'Handstand Push-up',
  'Handstand Walk',
  'Toes-to-Bar',
  'Knees-to-Elbows',
  'Sit-up',
  'GHD Sit-up',
  'V-up',
  'Rope Climb',
  'Wall Walk',
  'Burpee',
  'Burpee Box Jump Over',
  'Burpee Pull-up',
  'Box Jump',
  'Box Jump Over',
  'Double-Under',
  'Single-Under',
  // Monostructural (amount lives in quantity + unit)
  'Run',
  'Row',
  'Bike Erg',
  'Assault Bike',
  'Ski Erg',
  'Echo Bike',
  'Swim',
  'Farmers Carry',
  'Sled Push',
];

/** Cardio activities offered on the gym Cardio screen. */
export const CARDIO_NAMES: readonly string[] = [
  'Run',
  'Row',
  'Bike Erg',
  'Assault Bike',
  'Ski Erg',
  'Echo Bike',
  'Swim',
];

import type { MovementUnit } from './types';

/** Cardio / monostructural movements measured in calories by default. */
const CAL_DEFAULT = ['row', 'bike erg', 'assault bike', 'ski erg', 'echo bike', 'air bike'];
/** Movements measured in metres by default. */
const METRE_DEFAULT = ['run', 'sprint', 'farmers carry', 'sled push', 'sled pull', 'swim'];

/** Best-guess unit for a movement name — cardio → cal/m, everything else → reps. */
export function defaultUnitFor(name: string): MovementUnit {
  const n = name.trim().toLowerCase();
  if (!n) return 'reps';
  if (METRE_DEFAULT.some((m) => n.includes(m))) return 'm';
  if (CAL_DEFAULT.some((m) => n.includes(m))) return 'cal';
  return 'reps';
}

/** Prefix matches first, then substring matches, capped at `limit`. */
export function suggestMovements(query: string, limit = 6): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: string[] = [];
  const contains: string[] = [];
  for (const name of MOVEMENT_NAMES) {
    const lower = name.toLowerCase();
    if (lower === q) continue; // already typed exactly
    if (lower.startsWith(q)) starts.push(name);
    else if (lower.includes(q)) contains.push(name);
  }
  return [...starts, ...contains].slice(0, limit);
}
