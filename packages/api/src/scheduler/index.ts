import schedule from 'node-schedule';
import db from '../db';

const jobs = new Map<number, schedule.Job>();

async function sendCampaign(campaignId: number): Promise<void> {
  const campaign = await db('campaigns').where({ id: campaignId }).first();
  if (!campaign || campaign.status !== 'scheduled') {
    jobs.delete(campaignId);
    return;
  }
  await db.transaction(async trx => {
    await trx('campaign_recipients')
      .where({ campaign_id: campaignId })
      .update({ status: 'sent', sent_at: db.fn.now() });
    await trx('campaigns')
      .where({ id: campaignId })
      .update({ status: 'sent', updated_at: db.fn.now() });
  });
  jobs.delete(campaignId);
}

export async function initScheduler(): Promise<void> {
  const campaigns = await db('campaigns')
    .where({ status: 'scheduled' })
    .whereNotNull('scheduled_at')
    .where('scheduled_at', '>', db.fn.now());

  for (const campaign of campaigns) {
    scheduleJob(campaign.id, new Date(campaign.scheduled_at));
  }
}

export function scheduleJob(campaignId: number, scheduledAt: Date): void {
  cancelJob(campaignId);
  const job = schedule.scheduleJob(scheduledAt, () => sendCampaign(campaignId));
  if (job) {
    jobs.set(campaignId, job);
  }
}

export function cancelJob(campaignId: number): void {
  const existing = jobs.get(campaignId);
  if (existing) {
    existing.cancel();
    jobs.delete(campaignId);
  }
}

export function cancelAllJobs(): void {
  for (const [id, job] of jobs.entries()) {
    job.cancel();
    jobs.delete(id);
  }
}
