import { describe, it, expect } from 'vitest';
import { calculateStats } from '../services/campaignService';

describe('calculateStats', () => {
  it('returns all zeros when no recipients', () => {
    expect(calculateStats([])).toEqual({
      total: 0,
      sent: 0,
      failed: 0,
      opened: 0,
      open_rate: 0,
      send_rate: 0,
    });
  });

  it('counts sent and calculates send_rate', () => {
    const rows = [
      { status: 'sent', opened_at: null },
      { status: 'sent', opened_at: null },
      { status: 'pending', opened_at: null },
    ];
    expect(calculateStats(rows)).toEqual({
      total: 3,
      sent: 2,
      failed: 0,
      opened: 0,
      open_rate: 0,
      send_rate: 0.6667,
    });
  });

  it('counts opened and calculates open_rate', () => {
    const ts = new Date().toISOString();
    const rows = [
      { status: 'sent', opened_at: ts },
      { status: 'sent', opened_at: ts },
      { status: 'sent', opened_at: null },
      { status: 'sent', opened_at: null },
    ];
    expect(calculateStats(rows)).toEqual({
      total: 4,
      sent: 4,
      failed: 0,
      opened: 2,
      open_rate: 0.5,
      send_rate: 1,
    });
  });

  it('handles failed status', () => {
    const rows = [
      { status: 'sent', opened_at: null },
      { status: 'failed', opened_at: null },
    ];
    expect(calculateStats(rows)).toEqual({
      total: 2,
      sent: 1,
      failed: 1,
      opened: 0,
      open_rate: 0,
      send_rate: 0.5,
    });
  });

  it('rounds to 4 decimal places', () => {
    const ts = new Date().toISOString();
    const rows = [
      { status: 'sent', opened_at: ts },
      { status: 'sent', opened_at: null },
      { status: 'sent', opened_at: null },
    ];
    const result = calculateStats(rows);
    expect(result.open_rate).toBe(0.3333);
  });
});
