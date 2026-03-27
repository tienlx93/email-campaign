import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  registerSchema,
  loginSchema,
  createCampaignSchema,
} from '../validators/schemas';

describe('registerSchema', () => {
  it('valid payload passes', () => {
    expect(() =>
      registerSchema.parse({ email: 'user@example.com', name: 'Alice', password: 'secret123' })
    ).not.toThrow();
  });

  it('invalid email fails', () => {
    expect(() =>
      registerSchema.parse({ email: 'not-an-email', name: 'Alice', password: 'secret123' })
    ).toThrow(ZodError);
  });

  it('password too short fails', () => {
    expect(() =>
      registerSchema.parse({ email: 'user@example.com', name: 'Alice', password: '123' })
    ).toThrow(ZodError);
  });

  it('missing name fails', () => {
    expect(() =>
      registerSchema.parse({ email: 'user@example.com', password: 'secret123' })
    ).toThrow(ZodError);
  });
});

describe('loginSchema', () => {
  it('valid payload passes', () => {
    expect(() =>
      loginSchema.parse({ email: 'user@example.com', password: 'anypass' })
    ).not.toThrow();
  });

  it('invalid email fails', () => {
    expect(() =>
      loginSchema.parse({ email: 'bad', password: 'pass' })
    ).toThrow(ZodError);
  });
});

describe('createCampaignSchema', () => {
  it('valid minimal payload passes', () => {
    expect(() =>
      createCampaignSchema.parse({ name: 'My Campaign', subject: 'Hello', body: '<p>Hi</p>' })
    ).not.toThrow();
  });

  it('missing name fails', () => {
    expect(() =>
      createCampaignSchema.parse({ subject: 'Hello', body: '<p>Hi</p>' })
    ).toThrow(ZodError);
  });

  it('valid with recipients passes', () => {
    expect(() =>
      createCampaignSchema.parse({
        name: 'Camp',
        subject: 'Subj',
        body: 'Body',
        recipients: [{ email: 'a@b.com', name: 'A' }],
      })
    ).not.toThrow();
  });

  it('recipient with invalid email fails', () => {
    expect(() =>
      createCampaignSchema.parse({
        name: 'Camp',
        subject: 'Subj',
        body: 'Body',
        recipients: [{ email: 'bad', name: 'A' }],
      })
    ).toThrow(ZodError);
  });
});
