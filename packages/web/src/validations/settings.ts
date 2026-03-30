import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Max 100 characters'),
});
export type ProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     z.string().min(8, 'Must be at least 8 characters').max(100),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type PasswordFormValues = z.infer<typeof passwordSchema>;
