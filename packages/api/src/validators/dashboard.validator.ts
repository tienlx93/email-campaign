import { z } from 'zod';
import { BaseValidator } from './base.validator';

export type DashboardQueryDto = {
  from: string;
  to: string;
  groupBy: 'day' | 'week' | 'month';
};

export const dashboardQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD'),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

export class DashboardQueryValidator extends BaseValidator<DashboardQueryDto> {
  protected source = 'query' as const;
  protected schema = dashboardQuerySchema;
}
