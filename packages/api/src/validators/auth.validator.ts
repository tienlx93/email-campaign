import { z } from 'zod';
import { BaseValidator } from './base.validator';

// ─── Register ────────────────────────────────────────────────────────────────

export type RegisterDto = {
  email: string;
  name: string;
  password: string;
};

export const registerSchema = z.object({
  email: z.string().email('Valid email is required').max(255, 'Valid email is required'),
  name: z.string().trim().min(1, 'Name is required').max(255, 'Name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be at most 100 characters'),
});

export class RegisterValidator extends BaseValidator<RegisterDto> {
  protected schema = registerSchema;
}

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginDto = {
  email: string;
  password: string;
};

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export class LoginValidator extends BaseValidator<LoginDto> {
  protected schema = loginSchema;
}
