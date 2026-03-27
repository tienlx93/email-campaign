import type { Knex } from 'knex';

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

export async function upsertRecipients(
  trx: Knex.Transaction,
  recipients: Array<{ email: string; name: string }>
): Promise<number[]> {
  if (recipients.length === 0) return [];
  const ids: number[] = [];
  for (const r of recipients) {
    const result = await trx('recipients')
      .insert({ email: r.email, name: r.name })
      .onConflict('email')
      .merge({ name: r.name })
      .returning('id');
    ids.push(result[0].id);
  }
  return ids;
}

export async function linkRecipientsToCampaign(
  trx: Knex.Transaction,
  campaignId: number,
  recipientIds: number[]
): Promise<void> {
  if (recipientIds.length === 0) return;
  const rows = recipientIds.map(rid => ({ campaign_id: campaignId, recipient_id: rid }));
  await trx('campaign_recipients').insert(rows).onConflict(['campaign_id', 'recipient_id']).ignore();
}
