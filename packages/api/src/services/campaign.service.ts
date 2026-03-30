import type { Knex } from 'knex';
import db from '../db';
import { ServiceError } from '../errors/ServiceError';
import { scheduleJob, cancelJob } from '../scheduler';
import { isCampaignEditable, calculateStats } from './campaign.utils';
import type {
  CreateCampaignDto,
  UpdateCampaignDto,
  ScheduleCampaignDto,
  ListCampaignsQueryDto,
} from '../validators/campaign.validator';

export class CampaignService {
  // ─── Private helpers ────────────────────────────────────────────────────────

  private async upsertRecipients(
    trx: Knex.Transaction,
    recipients: Array<{ email: string; name: string }>
  ): Promise<number[]> {
    if (recipients.length === 0) return [];
    const allRows = recipients.map(r => ({ email: r.email, name: r.name }));
    await trx('recipients').insert(allRows).onConflict('email').merge();
    const emails = recipients.map(r => r.email);
    const rows = await trx('recipients').whereIn('email', emails).select('id', 'email');
    const emailToId = new Map(rows.map((r: { id: number; email: string }) => [r.email, r.id]));
    return recipients.map(r => emailToId.get(r.email) as number);
  }

  private async linkRecipientsToCampaign(
    trx: Knex.Transaction,
    campaignId: number,
    recipientIds: number[]
  ): Promise<void> {
    if (recipientIds.length === 0) return;
    const rows = recipientIds.map(rid => ({ campaign_id: campaignId, recipient_id: rid }));
    await trx('campaign_recipients').insert(rows).onConflict(['campaign_id', 'recipient_id']).ignore();
  }

  private async getFullCampaign(campaignId: number, userId: number) {
    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) return null;

    const recipientRows = await db('campaign_recipients as cr')
      .join('recipients as r', 'r.id', 'cr.recipient_id')
      .where('cr.campaign_id', campaignId)
      .select('r.id', 'r.email', 'r.name', 'cr.status', 'cr.sent_at', 'cr.opened_at');

    return { ...campaign, recipients: recipientRows, stats: calculateStats(recipientRows) };
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  async list(userId: number, query: ListCampaignsQueryDto) {
    const { page = 1, limit = 20, search, status } = query;
    const offset = (page - 1) * limit;

    // Base query: filter by user, optional search/status
    const baseQuery = () => {
      let q = db('campaigns').where('created_by', userId);
      if (search) {
        q = q.where(builder =>
          builder
            .whereILike('name', `%${search}%`)
            .orWhereILike('subject', `%${search}%`)
        );
      }
      if (status) {
        q = q.where('status', status);
      }
      return q;
    };

    const [{ count }] = await baseQuery().count('id as count');
    const total = parseInt(String(count), 10);

    const rows = await db('campaigns as c')
      .where('c.created_by', userId)
      .modify(q => {
        if (search) {
          q.where(b =>
            b.whereILike('c.name', `%${search}%`).orWhereILike('c.subject', `%${search}%`)
          );
        }
        if (status) q.where('c.status', status);
      })
      .leftJoin('campaign_recipients as cr', 'cr.campaign_id', 'c.id')
      .select('c.*')
      .count('cr.recipient_id as recipient_count')
      .groupBy('c.id')
      .orderBy('c.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const campaigns = rows.map((c: Record<string, unknown>) => ({
      ...c,
      recipient_count: parseInt(String(c.recipient_count), 10),
    }));

    return { campaigns, pagination: { page, limit, total } };
  }

  async create(userId: number, dto: CreateCampaignDto) {
    const { name, subject, body, recipients } = dto;

    const [campaign] = await db.transaction(async trx => {
      const inserted = await trx('campaigns')
        .insert({ name, subject, body, status: 'draft', created_by: userId })
        .returning('*');
      const campaignId = inserted[0].id;

      if (recipients && recipients.length > 0) {
        const ids = await this.upsertRecipients(trx, recipients);
        await this.linkRecipientsToCampaign(trx, campaignId, ids);
      }

      return inserted;
    });

    return this.getFullCampaign(campaign.id, userId);
  }

  async getById(userId: number, campaignId: number) {
    const campaign = await this.getFullCampaign(campaignId, userId);
    if (!campaign) {
      throw new ServiceError(404, 'Campaign not found');
    }
    return campaign;
  }

  async update(userId: number, campaignId: number, dto: UpdateCampaignDto) {
    const { name, subject, body, recipients } = dto;

    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      throw new ServiceError(404, 'Campaign not found');
    }
    if (!isCampaignEditable(campaign.status)) {
      throw new ServiceError(409, 'Campaign can only be edited when status is draft');
    }

    await db.transaction(async trx => {
      const updates: Record<string, unknown> = { updated_at: db.fn.now() };
      if (name !== undefined) updates.name = name;
      if (subject !== undefined) updates.subject = subject;
      if (body !== undefined) updates.body = body;

      await trx('campaigns').where({ id: campaignId }).update(updates);

      if (recipients !== undefined) {
        await trx('campaign_recipients').where({ campaign_id: campaignId }).delete();
        if (recipients.length > 0) {
          const ids = await this.upsertRecipients(trx, recipients);
          await this.linkRecipientsToCampaign(trx, campaignId, ids);
        }
      }
    });

    return this.getFullCampaign(campaignId, userId);
  }

  async delete(userId: number, campaignId: number): Promise<void> {
    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      throw new ServiceError(404, 'Campaign not found');
    }
    if (!isCampaignEditable(campaign.status)) {
      throw new ServiceError(409, 'Campaign can only be deleted when status is draft');
    }
    await db('campaigns').where({ id: campaignId }).delete();
  }

  async schedule(userId: number, campaignId: number, dto: ScheduleCampaignDto) {
    const { scheduled_at } = dto;

    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      throw new ServiceError(404, 'Campaign not found');
    }
    if (campaign.status === 'sent') {
      throw new ServiceError(409, 'Campaign has already been sent');
    }

    if (scheduled_at === null) {
      await db('campaigns').where({ id: campaignId }).update({
        scheduled_at: null,
        status: campaign.status === 'scheduled' ? 'draft' : campaign.status,
        updated_at: db.fn.now(),
      });
      cancelJob(campaignId);
    } else {
      await db('campaigns').where({ id: campaignId }).update({
        scheduled_at,
        status: 'scheduled',
        updated_at: db.fn.now(),
      });
      scheduleJob(campaignId, new Date(scheduled_at));
    }

    return this.getFullCampaign(campaignId, userId);
  }

  async send(userId: number, campaignId: number) {
    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      throw new ServiceError(404, 'Campaign not found');
    }
    if (campaign.status === 'sent') {
      throw new ServiceError(409, 'Campaign already sent');
    }

    await db.transaction(async trx => {
      await trx('campaign_recipients')
        .where({ campaign_id: campaignId })
        .update({ status: 'sent', sent_at: db.fn.now() });
      await trx('campaigns')
        .where({ id: campaignId })
        .update({ status: 'sent', updated_at: db.fn.now() });
    });

    cancelJob(campaignId);
    return this.getFullCampaign(campaignId, userId);
  }

  async getStats(userId: number, campaignId: number) {
    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      throw new ServiceError(404, 'Campaign not found');
    }
    const rows = await db('campaign_recipients')
      .where({ campaign_id: campaignId })
      .select('status', 'opened_at');
    return calculateStats(rows);
  }
}
