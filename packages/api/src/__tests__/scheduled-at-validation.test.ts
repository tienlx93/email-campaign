import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import { scheduleCampaignSchema } from '../validators/schemas';

// TDD Red Phase: scheduleCampaignSchema is currently a stub (z.object({})).
// - "accepts" tests pass because the empty schema accepts any input.
// - "rejects" tests FAIL as expected — the empty schema does not validate dates.
// These tests will turn green in Step 4 when the schema is fully implemented.

describe('scheduleCampaignSchema — scheduled_at validation', () => {
  it('accepts null to cancel scheduling', () => {
    expect(() => scheduleCampaignSchema.parse({ scheduled_at: null })).not.toThrow();
  });

  it('accepts a datetime 2 minutes in the future', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    expect(() => scheduleCampaignSchema.parse({ scheduled_at: futureDate })).not.toThrow();
  });

  it('rejects a past datetime', () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    expect(() => scheduleCampaignSchema.parse({ scheduled_at: pastDate })).toThrow(ZodError);
  });

  it('rejects a datetime less than 1 minute in the future', () => {
    const soonDate = new Date(Date.now() + 30 * 1000).toISOString();
    expect(() => scheduleCampaignSchema.parse({ scheduled_at: soonDate })).toThrow(ZodError);
  });
});
