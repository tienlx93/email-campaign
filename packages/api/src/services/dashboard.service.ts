import db from '../db';
import type { DashboardQueryDto } from '../validators/dashboard.validator';

export class DashboardService {
  async getSummary(userId: number, dto: DashboardQueryDto) {
    const { from, to, groupBy } = dto;
    const fromTs = `${from} 00:00:00`;
    const toTs = `${to} 23:59:59`;

    // ── KPI counts ──────────────────────────────────────────────────────────
    const [kpiCampaigns] = await db('campaigns')
      .where('created_by', userId)
      .whereBetween('created_at', [fromTs, toTs])
      .select(
        db.raw('COUNT(*) as total_campaigns'),
        db.raw("SUM(CASE WHEN status = 'draft'     THEN 1 ELSE 0 END) as draft_campaigns"),
        db.raw("SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_campaigns"),
        db.raw("SUM(CASE WHEN status = 'sent'      THEN 1 ELSE 0 END) as sent_campaigns")
      );

    const [kpiEmails] = await db('campaigns as c')
      .join('campaign_recipients as cr', 'cr.campaign_id', 'c.id')
      .where('c.created_by', userId)
      .where('c.status', 'sent')
      .whereBetween('c.created_at', [fromTs, toTs])
      .select(
        db.raw('COUNT(cr.id) as total_recipients'),
        db.raw("SUM(CASE WHEN cr.status = 'sent'          THEN 1 ELSE 0 END) as sent_recipients"),
        db.raw('SUM(CASE WHEN cr.opened_at IS NOT NULL    THEN 1 ELSE 0 END) as opened_recipients'),
        db.raw("SUM(CASE WHEN cr.status = 'failed'        THEN 1 ELSE 0 END) as failed_recipients")
      );

    const kpi = {
      totalCampaigns:     parseInt(String(kpiCampaigns.total_campaigns     ?? 0), 10),
      draftCampaigns:     parseInt(String(kpiCampaigns.draft_campaigns     ?? 0), 10),
      scheduledCampaigns: parseInt(String(kpiCampaigns.scheduled_campaigns ?? 0), 10),
      sentCampaigns:      parseInt(String(kpiCampaigns.sent_campaigns      ?? 0), 10),
      totalRecipients:    parseInt(String(kpiEmails?.total_recipients      ?? 0), 10),
      sentRecipients:     parseInt(String(kpiEmails?.sent_recipients       ?? 0), 10),
      openedRecipients:   parseInt(String(kpiEmails?.opened_recipients     ?? 0), 10),
      failedRecipients:   parseInt(String(kpiEmails?.failed_recipients     ?? 0), 10),
    };

    // ── Volume series ───────────────────────────────────────────────────────
    const truncFn = groupBy === 'day' ? 'day' : groupBy === 'week' ? 'week' : 'month';
    const volumeRows = await db('campaigns')
      .where('created_by', userId)
      .whereIn('status', ['scheduled', 'sent'])
      .whereBetween('created_at', [fromTs, toTs])
      .select(
        db.raw(`DATE_TRUNC('${truncFn}', created_at)::date::text as period`),
        db.raw("SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_count"),
        db.raw("SUM(CASE WHEN status = 'sent'      THEN 1 ELSE 0 END) as sent_count")
      )
      .groupByRaw(`DATE_TRUNC('${truncFn}', created_at)`)
      .orderByRaw(`DATE_TRUNC('${truncFn}', created_at)`);

    const volumeSeries = volumeRows.map((r: Record<string, unknown>) => ({
      period:         String(r.period),
      scheduledCount: parseInt(String(r.scheduled_count ?? 0), 10),
      sentCount:      parseInt(String(r.sent_count      ?? 0), 10),
    }));

    // ── Delivery series ─────────────────────────────────────────────────────
    const deliveryRows = await db('campaign_recipients as cr')
      .join('campaigns as c', 'c.id', 'cr.campaign_id')
      .where('c.created_by', userId)
      .where('c.status', 'sent')
      .whereNotNull('cr.sent_at')
      .whereBetween('cr.sent_at', [fromTs, toTs])
      .select(
        db.raw(`DATE_TRUNC('${truncFn}', cr.sent_at)::date::text as period`),
        db.raw('COUNT(cr.id) as sent_recipients'),
        db.raw('SUM(CASE WHEN cr.opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened_recipients'),
        db.raw("SUM(CASE WHEN cr.status = 'failed'     THEN 1 ELSE 0 END) as failed_recipients")
      )
      .groupByRaw(`DATE_TRUNC('${truncFn}', cr.sent_at)`)
      .orderByRaw(`DATE_TRUNC('${truncFn}', cr.sent_at)`);

    const deliverySeries = deliveryRows.map((r: Record<string, unknown>) => ({
      period:           String(r.period),
      sentRecipients:   parseInt(String(r.sent_recipients    ?? 0), 10),
      openedRecipients: parseInt(String(r.opened_recipients  ?? 0), 10),
      failedRecipients: parseInt(String(r.failed_recipients  ?? 0), 10),
    }));

    return { kpi, volumeSeries, deliverySeries };
  }
}
