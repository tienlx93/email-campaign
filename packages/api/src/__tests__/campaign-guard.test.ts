import { describe, it, expect } from 'vitest';
import { isCampaignEditable } from '../services/campaign.utils';

describe('isCampaignEditable', () => {
  it('allows editing when status is draft', () => {
    expect(isCampaignEditable('draft')).toBe(true);
  });

  it('rejects editing when status is scheduled', () => {
    expect(isCampaignEditable('scheduled')).toBe(false);
  });

  it('rejects editing when status is sent', () => {
    expect(isCampaignEditable('sent')).toBe(false);
  });

  it('rejects editing for unknown status', () => {
    expect(isCampaignEditable('unknown')).toBe(false);
  });
});
