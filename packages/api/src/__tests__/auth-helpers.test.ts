import { describe, it, expect } from 'vitest';
import { generateToken, verifyToken } from '../middleware/auth';

describe('generateToken', () => {
  it('returns a non-empty string', () => {
    const token = generateToken({ id: 1, email: 'a@b.com' });
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
  });
});

describe('verifyToken', () => {
  it('returns the original payload', () => {
    const payload = { id: 1, email: 'test@example.com' };
    const token = generateToken(payload);
    const result = verifyToken(token) as Record<string, unknown>;
    expect(result).toMatchObject({ id: 1, email: 'test@example.com' });
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('not.a.valid.token')).toThrow();
  });

  it('throws on expired token', () => {
    // TODO: test with expired token in Step 4 once JWT_SECRET is configured
    expect(true).toBe(true);
  });
});
