export type StatsResult = {
  total: number;
  sent: number;
  failed: number;
  opened: number;
  open_rate: number;
  send_rate: number;
};

export function isCampaignEditable(status: string): boolean {
  throw new Error('not implemented');
}

export function calculateStats(
  rows: Array<{ status: string; opened_at: string | null }>
): StatsResult {
  throw new Error('not implemented');
}
