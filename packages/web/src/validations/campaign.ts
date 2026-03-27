import { z } from 'zod';
import { isQuillEmpty } from '@/lib/quill';

// ─── Create campaign ──────────────────────────────────────────────────────────

export const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255, 'Max 255 characters'),
  subject: z.string().min(1, 'Subject is required').max(500, 'Max 500 characters'),
  body: z.string().refine((v) => !isQuillEmpty(v), 'Email body is required'),
  recipients: z.array(
    z.object({
      name: z.string().min(1, 'Recipient name is required'),
      email: z.string().email('Enter a valid email address'),
    })
  ),
});
export type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>;

// ─── Edit campaign (draft only) ───────────────────────────────────────────────

export const editCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255, 'Max 255 characters'),
  subject: z.string().min(1, 'Subject is required').max(500, 'Max 500 characters'),
  body: z.string().refine((v) => !isQuillEmpty(v), 'Email body is required'),
});
export type EditCampaignFormValues = z.infer<typeof editCampaignSchema>;

// ─── Schedule campaign ────────────────────────────────────────────────────────

export const scheduleSchema = z.object({
  scheduled_at: z.string().refine((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && d.getTime() > Date.now() + 60_000;
  }, 'Please select a future date and time'),
});
export type ScheduleFormValues = z.infer<typeof scheduleSchema>;

// ─── Add recipients (in detail editor) ───────────────────────────────────────

export const newRecipientSchema = z.object({
  newRecipients: z.array(
    z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Enter a valid email address'),
    })
  ),
});
export type NewRecipientFormValues = z.infer<typeof newRecipientSchema>;
