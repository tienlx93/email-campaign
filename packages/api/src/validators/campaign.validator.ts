import { z } from 'zod';
import { BaseValidator } from './base.validator';

// ─── Shared ───────────────────────────────────────────────────────────────────

const recipientItemSchema = z.object({
  email: z.string().email('Invalid recipient email').max(255),
  name: z.string().trim().min(1, 'Recipient name is required').max(255),
});

export type RecipientItemDto = {
  email: string;
  name: string;
};

// ─── Create Campaign ──────────────────────────────────────────────────────────

export type CreateCampaignDto = {
  name: string;
  subject: string;
  body: string;
  recipients?: RecipientItemDto[];
};

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Email body is required'),
  recipients: z.array(recipientItemSchema).max(1000).optional(),
});

export class CreateCampaignValidator extends BaseValidator<CreateCampaignDto> {
  protected schema = createCampaignSchema;
}

// ─── Update Campaign ──────────────────────────────────────────────────────────

export type UpdateCampaignDto = {
  name?: string;
  subject?: string;
  body?: string;
  recipients?: RecipientItemDto[];
};

export const updateCampaignSchema = z
  .object({
    name: z.string().trim().min(1, 'Campaign name cannot be empty').max(255).optional(),
    subject: z.string().trim().min(1, 'Subject cannot be empty').max(500).optional(),
    body: z.string().min(1, 'Body cannot be empty').optional(),
    recipients: z.array(recipientItemSchema).max(1000).optional(),
  })
  .refine(
    data =>
      data.name !== undefined ||
      data.subject !== undefined ||
      data.body !== undefined ||
      data.recipients !== undefined,
    { message: 'At least one field must be provided' }
  );

export class UpdateCampaignValidator extends BaseValidator<UpdateCampaignDto> {
  protected schema = updateCampaignSchema;
}

// ─── Schedule Campaign ────────────────────────────────────────────────────────

export type ScheduleCampaignDto = {
  scheduled_at: string | null;
};

export const scheduleCampaignSchema = z.object({
  scheduled_at: z.union([
    z.null(),
    z
      .string()
      .datetime()
      .refine(
        val => new Date(val) > new Date(Date.now() + 60000),
        'scheduled_at must be a future date at least 1 minute from now, or null to cancel'
      ),
  ]),
});

export class ScheduleCampaignValidator extends BaseValidator<ScheduleCampaignDto> {
  protected schema = scheduleCampaignSchema;
}

// ─── Campaign ID Param ────────────────────────────────────────────────────────

export type CampaignIdParamDto = {
  id: number;
};

// Input is { id: string } (from req.params), output is { id: number } (after transform).
// BaseValidator uses ZodType<T, ZodTypeDef, unknown> so the input/output mismatch is permitted.
// This validator's role is to reject non-integer / non-positive values with a 400.
// Controllers still call parseInt(String(req.params.id), 10) to retrieve the value — that is
// the documented retrieval pattern; the validator is a guard, not a typed channel.
export const idParamSchema = z.object({
  id: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => Number.isInteger(val) && val > 0, 'Invalid campaign id'),
});

export class CampaignIdParamValidator extends BaseValidator<CampaignIdParamDto> {
  protected source = 'params' as const;
  protected schema = idParamSchema;
}

// ─── List Campaigns Query ─────────────────────────────────────────────────────

export type ListCampaignsQueryDto = {
  page: number;
  limit: number;
};

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class ListCampaignsQueryValidator extends BaseValidator<ListCampaignsQueryDto> {
  protected source = 'query' as const;
  protected schema = listCampaignsQuerySchema;
}
