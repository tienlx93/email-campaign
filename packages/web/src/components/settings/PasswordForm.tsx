import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { BsShieldLock } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdatePasswordMutation } from '@/store/api';
import { passwordSchema, type PasswordFormValues } from '@/validations/settings';

export function PasswordForm() {
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(values: PasswordFormValues) {
    try {
      await updatePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();
      toast.success('Password updated successfully');
      reset();
    } catch (err: unknown) {
      const msg =
        typeof err === 'object' && err !== null && 'data' in err
          ? (err as { data: { error: string } }).data.error
          : 'Failed to update password';
      toast.error(msg);
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <BsShieldLock /> Change Password
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input id="currentPassword" type="password" {...register('currentPassword')} />
          {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="newPassword">New Password</Label>
          <Input id="newPassword" type="password" placeholder="Min 8 characters" {...register('newPassword')} />
          {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input id="confirmPassword" type="password" placeholder="Re-enter new password" {...register('confirmPassword')} />
          {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" disabled={isLoading} variant="secondary" size="sm">
          {isLoading ? 'Updating…' : 'Update Password'}
        </Button>
      </form>
    </div>
  );
}
