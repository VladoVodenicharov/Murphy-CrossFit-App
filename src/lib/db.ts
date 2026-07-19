import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import type {
  CardioActivity,
  GymKind,
  GymSessionRow,
  Movement,
  ResultRow,
  StrengthExercise,
  WodDef,
  WodParams,
  WodRow,
} from './types';

const SCHEMA_VERSION = 4;

let db: SQLiteDatabase | null = null;

/** Lazily opened singleton — migrates the schema on first access. */
export function getDb(): SQLiteDatabase {
  if (!db) {
    db = openDatabaseSync('murphy.db');
    db.execSync('PRAGMA journal_mode = WAL;');
    let version =
      db.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;

    if (version < 2) {
      // v1 held timer-era results no one logged real data into — recreate cleanly.
      db.execSync(`
        DROP TABLE IF EXISTS results;
        CREATE TABLE IF NOT EXISTS wods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          format TEXT NOT NULL,
          config_json TEXT NOT NULL,
          movements_json TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          wod_ref TEXT NOT NULL,
          wod_name TEXT NOT NULL,
          wod_format TEXT NOT NULL,
          score_time_sec INTEGER,
          score_rounds INTEGER,
          score_reps INTEGER,
          score_load_kg REAL,
          is_capped INTEGER NOT NULL DEFAULT 0,
          is_rx INTEGER NOT NULL DEFAULT 1,
          notes TEXT,
          performed_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      version = 2;
    }

    if (version < 3) {
      // Gym strength/cardio logs — additive, existing tables untouched.
      // Superseded by gym_sessions in v4 (a session holds 1+ exercises); kept
      // here only so the v4 step below has something to migrate rows from.
      db.execSync(`
        CREATE TABLE IF NOT EXISTS gym_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kind TEXT NOT NULL,
          name TEXT NOT NULL,
          sets_json TEXT,
          duration_sec INTEGER,
          distance_m REAL,
          calories INTEGER,
          notes TEXT,
          performed_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      version = 3;
    }

    if (version < 4) {
      // A gym session now holds multiple exercises/activities, not just one.
      db.execSync(`
        CREATE TABLE IF NOT EXISTS gym_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kind TEXT NOT NULL,
          items_json TEXT NOT NULL,
          notes TEXT,
          performed_at TEXT NOT NULL,
          created_at TEXT NOT NULL
        );
      `);
      // Fold any single-exercise gym_logs rows into one-item sessions, then retire the table.
      const legacy = db.getAllSync<{
        kind: GymKind;
        name: string;
        sets_json: string | null;
        duration_sec: number | null;
        distance_m: number | null;
        calories: number | null;
        notes: string | null;
        performed_at: string;
        created_at: string;
      }>(`SELECT * FROM gym_logs`);
      for (const row of legacy) {
        const items =
          row.kind === 'strength'
            ? [
                {
                  name: row.name,
                  sets: row.sets_json ? JSON.parse(row.sets_json) : [],
                  calories: row.calories ?? undefined,
                },
              ]
            : [
                {
                  name: row.name,
                  durationSec: row.duration_sec ?? undefined,
                  distanceM: row.distance_m ?? undefined,
                  calories: row.calories ?? undefined,
                },
              ];
        db.runSync(
          `INSERT INTO gym_sessions (kind, items_json, notes, performed_at, created_at) VALUES (?, ?, ?, ?, ?)`,
          row.kind,
          JSON.stringify(items),
          row.notes,
          row.performed_at,
          row.created_at,
        );
      }
      db.execSync(`DROP TABLE IF EXISTS gym_logs;`);
      version = 4;
    }

    if (version !== SCHEMA_VERSION) {
      db.execSync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
    }
  }
  return db;
}

// ---------------------------------------------------------------- saved WODs

export interface SaveWodInput {
  name: string;
  format: WodDef['format'];
  params: WodParams;
  movements: Movement[];
}

/** Insert a custom/box WOD and return its library ref (`custom:<id>`). */
export function saveWod(input: SaveWodInput): string {
  const result = getDb().runSync(
    `INSERT INTO wods (name, format, config_json, movements_json, created_at)
     VALUES (?, ?, ?, ?, ?)`,
    input.name,
    input.format,
    JSON.stringify(input.params),
    JSON.stringify(input.movements),
    new Date().toISOString(),
  );
  return `custom:${result.lastInsertRowId}`;
}

function rowToWodDef(row: WodRow): WodDef {
  let params: WodParams = {};
  let movements: Movement[] = [];
  try {
    params = JSON.parse(row.config_json) as WodParams;
  } catch {}
  try {
    movements = JSON.parse(row.movements_json) as Movement[];
  } catch {}
  return { ref: `custom:${row.id}`, name: row.name, format: row.format, params, movements };
}

/** All saved custom/box WODs, newest first. */
export function listWods(): WodDef[] {
  return getDb()
    .getAllSync<WodRow>(`SELECT * FROM wods ORDER BY id DESC`)
    .map(rowToWodDef);
}

/** Look up one saved WOD by its numeric id. */
export function getWod(id: number): WodDef | null {
  const row = getDb().getFirstSync<WodRow>(`SELECT * FROM wods WHERE id = ?`, id);
  return row ? rowToWodDef(row) : null;
}

// ------------------------------------------------------------------- results

export interface SaveResultInput {
  wod: WodDef;
  scoreTimeSec?: number;
  scoreRounds?: number;
  scoreReps?: number;
  scoreLoadKg?: number;
  isCapped: boolean;
  isRx: boolean;
  notes?: string;
  /** ISO timestamp of when the workout was performed. */
  performedAt: string;
}

export function saveResult(input: SaveResultInput): void {
  const notes = input.notes?.trim();
  getDb().runSync(
    `INSERT INTO results (
       wod_ref, wod_name, wod_format,
       score_time_sec, score_rounds, score_reps, score_load_kg,
       is_capped, is_rx, notes, performed_at, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.wod.ref,
    input.wod.name,
    input.wod.format,
    input.scoreTimeSec ?? null,
    input.scoreRounds ?? null,
    input.scoreReps ?? null,
    input.scoreLoadKg ?? null,
    input.isCapped ? 1 : 0,
    input.isRx ? 1 : 0,
    notes ? notes : null,
    input.performedAt,
    new Date().toISOString(),
  );
}

/** Logged results, most recently performed first. */
export function listResults(limit?: number): ResultRow[] {
  const sql = `SELECT * FROM results ORDER BY datetime(performed_at) DESC, id DESC${
    limit ? ` LIMIT ${Math.floor(limit)}` : ''
  }`;
  return getDb().getAllSync<ResultRow>(sql);
}

export function getResult(id: number): ResultRow | null {
  return getDb().getFirstSync<ResultRow>(`SELECT * FROM results WHERE id = ?`, id) ?? null;
}

/** Overwrite an existing log (edit flow). */
export function updateResult(id: number, input: SaveResultInput): void {
  const notes = input.notes?.trim();
  getDb().runSync(
    `UPDATE results SET
       wod_ref = ?, wod_name = ?, wod_format = ?,
       score_time_sec = ?, score_rounds = ?, score_reps = ?, score_load_kg = ?,
       is_capped = ?, is_rx = ?, notes = ?, performed_at = ?
     WHERE id = ?`,
    input.wod.ref,
    input.wod.name,
    input.wod.format,
    input.scoreTimeSec ?? null,
    input.scoreRounds ?? null,
    input.scoreReps ?? null,
    input.scoreLoadKg ?? null,
    input.isCapped ? 1 : 0,
    input.isRx ? 1 : 0,
    notes ? notes : null,
    input.performedAt,
    id,
  );
}

export function deleteResult(id: number): void {
  getDb().runSync(`DELETE FROM results WHERE id = ?`, id);
}

// -------------------------------------------------------------- gym sessions

export interface SaveGymSessionInput {
  kind: GymKind;
  /** StrengthExercise[] for kind='strength', CardioActivity[] for kind='cardio'. */
  items: StrengthExercise[] | CardioActivity[];
  notes?: string;
  performedAt: string;
}

export function saveGymSession(input: SaveGymSessionInput): void {
  const notes = input.notes?.trim();
  getDb().runSync(
    `INSERT INTO gym_sessions (kind, items_json, notes, performed_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    input.kind,
    JSON.stringify(input.items),
    notes ? notes : null,
    input.performedAt,
    new Date().toISOString(),
  );
}

/** Gym sessions, most recently performed first. */
export function listGymSessions(limit?: number): GymSessionRow[] {
  const sql = `SELECT * FROM gym_sessions ORDER BY datetime(performed_at) DESC, id DESC${
    limit ? ` LIMIT ${Math.floor(limit)}` : ''
  }`;
  return getDb().getAllSync<GymSessionRow>(sql);
}

export function getGymSession(id: number): GymSessionRow | null {
  return getDb().getFirstSync<GymSessionRow>(`SELECT * FROM gym_sessions WHERE id = ?`, id) ?? null;
}

/** Overwrite an existing gym session (edit flow). */
export function updateGymSession(id: number, input: SaveGymSessionInput): void {
  const notes = input.notes?.trim();
  getDb().runSync(
    `UPDATE gym_sessions SET kind = ?, items_json = ?, notes = ?, performed_at = ? WHERE id = ?`,
    input.kind,
    JSON.stringify(input.items),
    notes ? notes : null,
    input.performedAt,
    id,
  );
}

export function deleteGymSession(id: number): void {
  getDb().runSync(`DELETE FROM gym_sessions WHERE id = ?`, id);
}
