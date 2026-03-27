/**
 * Pure utility functions for campaign logic.
 * No DB access — tested directly by unit tests.
 */

export type StatsResult = {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
};

export function isCampaignEditable(status: string): boolean {
  return status === 'draft';
}

export function calculateStats(
  rows: Array<{ status: string; opened_at: string | null }>
): StatsResult {
  const total = rows.length;
  if (total === 0) {
    return { total: 0, sent: 0, failed: 0, opened: 0, open_rate: 0, send_rate: 0 };
  }
  const sent = rows.filter(r => r.status === 'sent').length;
  const failed = rows.filter(r => r.status === 'failed').length;
  const opened = rows.filter(r => r.opened_at !== null).length;
  const open_rate = parseFloat((opened / total).toFixed(4));
  const send_rate = parseFloat((sent / total).toFixed(4));
  return { total, sent, failed, opened, open_rate, send_rate };
}
