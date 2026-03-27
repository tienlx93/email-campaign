import { Router, Request, Response } from 'express';
import db from '../db';
import { authMiddleware } from '../middleware/auth';
import {
  validate,
  createCampaignSchema,
  updateCampaignSchema,
  scheduleCampaignSchema,
  idParamSchema,
} from '../validators/schemas';
import {
  isCampaignEditable,
  calculateStats,
  upsertRecipients,
  linkRecipientsToCampaign,
} from '../services/campaignService';
import { scheduleJob, cancelJob } from '../scheduler';

const router = Router();
router.use(authMiddleware);

// Helper: fetch full campaign with recipients and stats for the authenticated user
async function getFullCampaign(campaignId: number, userId: number) {
  const campaign = await db('campaigns')
    .where({ id: campaignId, created_by: userId })
    .first();
  if (!campaign) return null;

  const recipientRows = await db('campaign_recipients as cr')
    .join('recipients as r', 'r.id', 'cr.recipient_id')
    .where('cr.campaign_id', campaignId)
    .select('r.id', 'r.email', 'r.name', 'cr.status', 'cr.sent_at', 'cr.opened_at');

  const stats = calculateStats(recipientRows);

  return { ...campaign, recipients: recipientRows, stats };
}

// GET /campaigns
router.get('/', async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20));
  const offset = (page - 1) * limit;

  const [{ count }] = await db('campaigns').where({ created_by: userId }).count('id as count');
  const total = parseInt(String(count), 10);

  const campaigns = await db('campaigns as c')
    .where('c.created_by', userId)
    .leftJoin('campaign_recipients as cr', 'cr.campaign_id', 'c.id')
    .select('c.*')
    .count('cr.recipient_id as recipient_count')
    .groupBy('c.id')
    .orderBy('c.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  const data = campaigns.map(c => ({
    ...c,
    recipient_count: parseInt(String(c.recipient_count), 10),
  }));

  res.json({ data, pagination: { page, limit, total } });
});

// POST /campaigns
router.post('/', validate(createCampaignSchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name, subject, body, recipients } = req.body;

  const [campaign] = await db.transaction(async trx => {
    const inserted = await trx('campaigns')
      .insert({ name, subject, body, status: 'draft', created_by: userId })
      .returning('*');
    const campaignId = inserted[0].id;

    if (recipients && recipients.length > 0) {
      const ids = await upsertRecipients(trx, recipients);
      await linkRecipientsToCampaign(trx, campaignId, ids);
    }

    return inserted;
  });

  const full = await getFullCampaign(campaign.id, userId);
  res.status(201).json(full);
});

// GET /campaigns/:id
router.get('/:id', validate(idParamSchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const campaignId = parseInt(String(req.params.id), 10);

  const full = await getFullCampaign(campaignId, userId);
  if (!full) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }
  res.json(full);
});

// PATCH /campaigns/:id
router.patch(
  '/:id',
  validate(idParamSchema),
  validate(updateCampaignSchema),
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const campaignId = parseInt(String(req.params.id), 10);
    const { name, subject, body, recipients } = req.body;

    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (!isCampaignEditable(campaign.status)) {
      res.status(409).json({ error: 'Campaign can only be edited when status is draft' });
      return;
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
          const ids = await upsertRecipients(trx, recipients);
          await linkRecipientsToCampaign(trx, campaignId, ids);
        }
      }
    });

    const full = await getFullCampaign(campaignId, userId);
    res.json(full);
  }
);

// DELETE /campaigns/:id
router.delete('/:id', validate(idParamSchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const campaignId = parseInt(String(req.params.id), 10);

  const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }

  if (!isCampaignEditable(campaign.status)) {
    res.status(409).json({ error: 'Campaign can only be deleted when status is draft' });
    return;
  }

  await db('campaigns').where({ id: campaignId }).delete();
  res.status(204).send();
});

// POST /campaigns/:id/schedule
router.post(
  '/:id/schedule',
  validate(idParamSchema),
  validate(scheduleCampaignSchema),
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const campaignId = parseInt(String(req.params.id), 10);
    const { scheduled_at } = req.body;

    const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    if (campaign.status === 'sent') {
      res.status(409).json({ error: 'Campaign has already been sent' });
      return;
    }

    if (scheduled_at === null) {
      // Cancel schedule
      await db('campaigns').where({ id: campaignId }).update({
        scheduled_at: null,
        status: campaign.status === 'scheduled' ? 'draft' : campaign.status,
        updated_at: db.fn.now(),
      });
      cancelJob(campaignId);
    } else {
      // Set schedule
      await db('campaigns').where({ id: campaignId }).update({
        scheduled_at,
        status: 'scheduled',
        updated_at: db.fn.now(),
      });
      scheduleJob(campaignId, new Date(scheduled_at));
    }

    const full = await getFullCampaign(campaignId, userId);
    res.json(full);
  }
);

// POST /campaigns/:id/send
router.post('/:id/send', validate(idParamSchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const campaignId = parseInt(String(req.params.id), 10);

  const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }

  if (campaign.status === 'sent') {
    res.status(409).json({ error: 'Campaign already sent' });
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

  cancelJob(campaignId);

  const full = await getFullCampaign(campaignId, userId);
  res.json(full);
});

// GET /campaigns/:id/stats
router.get('/:id/stats', validate(idParamSchema), async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const campaignId = parseInt(String(req.params.id), 10);

  const campaign = await db('campaigns').where({ id: campaignId, created_by: userId }).first();
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' });
    return;
  }

  const rows = await db('campaign_recipients')
    .where({ campaign_id: campaignId })
    .select('status', 'opened_at');

  const stats = calculateStats(rows);
  res.json(stats);
});

export default router;
