import { z, ZodSchema } from 'zod';
import { RequestHandler } from 'express';

export const registerSchema = z.object({
  email: z.string().email('Valid email is required').max(255, 'Valid email is required'),
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const recipientItemSchema = z.object({
  email: z.string().email('Invalid recipient email').max(255),
  name: z.string().trim().min(1, 'Recipient name is required').max(255),
});

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Campaign name is required').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(500),
  body: z.string().min(1, 'Email body is required'),
  recipients: z.array(recipientItemSchema).max(1000).optional(),
});

export const updateCampaignSchema = z
  .object({
    name: z.string().trim().min(1, 'Campaign name cannot be empty').max(255).optional(),
    subject: z.string().trim().min(1, 'Subject cannot be empty').max(500).optional(),
    body: z.string().min(1, 'Body cannot be empty').optional(),
    recipients: z.array(recipientItemSchema).max(1000).optional(),
  })
  .refine(
    data => data.name !== undefined || data.subject !== undefined || data.body !== undefined || data.recipients !== undefined,
    { message: 'At least one field must be provided' }
  );

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

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const idParamSchema = z.object({
  id: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => Number.isInteger(val) && val > 0, 'Invalid campaign id'),
});

export function validate(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const isParamSchema = schema === (idParamSchema as ZodSchema);
    const data = isParamSchema ? req.params : req.body;
    const result = schema.safeParse(data);
    if (!result.success) {
      res.status(400).json({ error: 'Validation failed', details: result.error.errors });
      return;
    }
    if (isParamSchema) {
      req.params = result.data as Record<string, string>;
    } else {
      req.body = result.data;
    }
    next();
  };
}
