import type { WodDef } from './types';

/**
 * Canonical benchmarks, structured. Loads are men's RX in kg; the description
 * carries the women's RX where it matters. Murph leads — house rules.
 */
export const BENCHMARKS: readonly WodDef[] = [
  {
    ref: 'benchmark:murph',
    name: 'Murph',
    format: 'FOR_TIME',
    params: { capSec: 60 * 60 },
    movements: [
      { name: 'Run', quantity: 1600, unit: 'm' },
      { name: 'Pull-up', quantity: 100 },
      { name: 'Push-up', quantity: 200 },
      { name: 'Air Squat', quantity: 300 },
      { name: 'Run', quantity: 1600, unit: 'm' },
    ],
    description: 'Partition as needed. RX = 9/6 kg vest.',
  },
  {
    ref: 'benchmark:fran',
    name: 'Fran',
    format: 'FOR_TIME',
    params: { capSec: 10 * 60 },
    movements: [
      { name: 'Thruster', weightKg: 43 },
      { name: 'Pull-up' },
    ],
    description: '21-15-9 reps. RX 43/30 kg.',
  },
  {
    ref: 'benchmark:cindy',
    name: 'Cindy',
    format: 'AMRAP',
    params: { durationSec: 20 * 60 },
    movements: [
      { name: 'Pull-up', quantity: 5 },
      { name: 'Push-up', quantity: 10 },
      { name: 'Air Squat', quantity: 15 },
    ],
  },
  {
    ref: 'benchmark:chelsea',
    name: 'Chelsea',
    format: 'EMOM',
    params: { intervalSec: 60, rounds: 30 },
    movements: [
      { name: 'Pull-up', quantity: 5 },
      { name: 'Push-up', quantity: 10 },
      { name: 'Air Squat', quantity: 15 },
    ],
    description: 'Each minute: one full round. Score = completed rounds.',
  },
  {
    ref: 'benchmark:grace',
    name: 'Grace',
    format: 'FOR_TIME',
    params: { capSec: 6 * 60 },
    movements: [{ name: 'Clean & Jerk', quantity: 30, weightKg: 61 }],
    description: 'RX 61/43 kg.',
  },
  {
    ref: 'benchmark:annie',
    name: 'Annie',
    format: 'FOR_TIME',
    params: { capSec: 12 * 60 },
    movements: [
      { name: 'Double-Under' },
      { name: 'Sit-up' },
    ],
    description: '50-40-30-20-10 reps.',
  },
  {
    ref: 'benchmark:helen',
    name: 'Helen',
    format: 'FOR_TIME',
    params: { rounds: 3, capSec: 15 * 60 },
    movements: [
      { name: 'Run', quantity: 400, unit: 'm' },
      { name: 'Kettlebell Swing', quantity: 21, weightKg: 24 },
      { name: 'Pull-up', quantity: 12 },
    ],
    description: '3 rounds. RX 24/16 kg.',
  },
  {
    ref: 'benchmark:diane',
    name: 'Diane',
    format: 'FOR_TIME',
    params: { capSec: 10 * 60 },
    movements: [
      { name: 'Deadlift', weightKg: 102 },
      { name: 'Handstand Push-up' },
    ],
    description: '21-15-9 reps. RX 102/70 kg.',
  },
  {
    ref: 'benchmark:elizabeth',
    name: 'Elizabeth',
    format: 'FOR_TIME',
    params: { capSec: 12 * 60 },
    movements: [
      { name: 'Clean', weightKg: 61 },
      { name: 'Ring Dip' },
    ],
    description: '21-15-9 reps. RX 61/43 kg.',
  },
  {
    ref: 'benchmark:karen',
    name: 'Karen',
    format: 'FOR_TIME',
    params: { capSec: 10 * 60 },
    movements: [{ name: 'Wall Ball', quantity: 150, weightKg: 9 }],
    description: 'RX 9/6 kg to 10/9 ft target.',
  },
  {
    ref: 'benchmark:dt',
    name: 'DT',
    format: 'FOR_TIME',
    params: { rounds: 5, capSec: 15 * 60 },
    movements: [
      { name: 'Deadlift', quantity: 12, weightKg: 70 },
      { name: 'Hang Power Clean', quantity: 9, weightKg: 70 },
      { name: 'Push Jerk', quantity: 6, weightKg: 70 },
    ],
    description: '5 rounds. RX 70/47.5 kg.',
  },
  {
    ref: 'benchmark:fgb',
    name: 'Fight Gone Bad',
    format: 'INTERVALS',
    params: { rounds: 3, intervalSec: 60 },
    blurb: 'Intervals · 3 × 5 stations',
    movements: [
      { name: 'Wall Ball', weightKg: 9 },
      { name: 'Sumo Deadlift High Pull', weightKg: 34 },
      { name: 'Box Jump' },
      { name: 'Push Press', weightKg: 34 },
      { name: 'Row', unit: 'cal' },
    ],
    description: '1 min per station, 1 min rest between rounds. Score = total reps (calories on the row).',
  },
  {
    ref: 'benchmark:cf-total',
    name: 'CrossFit Total',
    format: 'FOR_LOAD',
    params: {},
    blurb: 'For Load · sum of 1RMs',
    movements: [
      { name: 'Back Squat', quantity: 1 },
      { name: 'Shoulder Press', quantity: 1 },
      { name: 'Deadlift', quantity: 1 },
    ],
    description: 'One-rep max each lift. Score = the three added together, in kg.',
  },
];

export function findBenchmark(ref: string): WodDef | undefined {
  return BENCHMARKS.find((b) => b.ref === ref);
}
