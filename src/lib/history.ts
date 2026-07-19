import { listGymSessions, listResults } from './db';
import type { GymSessionRow, ResultRow } from './types';

export type HistoryItem = { type: 'wod'; row: ResultRow } | { type: 'gym'; row: GymSessionRow };

/** WOD results + gym sessions, merged and sorted by when they were performed. */
export function listAllHistory(limit?: number): HistoryItem[] {
  const items: HistoryItem[] = [
    ...listResults().map((row): HistoryItem => ({ type: 'wod', row })),
    ...listGymSessions().map((row): HistoryItem => ({ type: 'gym', row })),
  ];
  items.sort((a, b) => {
    const t = new Date(b.row.performed_at).getTime() - new Date(a.row.performed_at).getTime();
    return t !== 0 ? t : b.row.id - a.row.id;
  });
  return limit ? items.slice(0, limit) : items;
}
