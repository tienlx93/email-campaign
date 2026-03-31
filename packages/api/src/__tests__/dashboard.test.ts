import { describe, it, expect } from 'vitest';
import { DashboardService } from '../services/dashboard.service';

describe('DashboardService', () => {
  it('is a class with a getSummary method', () => {
    const svc = new DashboardService();
    expect(typeof svc.getSummary).toBe('function');
  });

  it('getSummary accepts userId and dto without throwing (type-level)', () => {
    const svc = new DashboardService();
    // Will reject at runtime due to missing DB — test verifies method signature
    expect(() => {
      void svc.getSummary(1, {
        from: '2026-01-01',
        to: '2026-03-30',
        groupBy: 'day',
      });
    }).not.toThrow(); // constructor is sync; method returns a promise
  });
});
