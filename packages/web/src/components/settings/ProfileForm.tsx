import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { BsPerson } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, updateUser } from '@/store/authSlice';
import { useUpdateProfileMutation } from '@/store/api';
import { getInitials, getAvatarColor } from '@/helpers/avatar';
import { profileSchema, type ProfileFormValues } from '@/validations/settings';

export function ProfileForm() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser)!;
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  async function onSubmit(values: ProfileFormValues) {
    try {
      const res = await updateProfile({ name: values.name }).unwrap();
      dispatch(updateUser({ name: res.user.name }));
      toast.success('Name updated successfully');
    } catch {
      toast.error('Failed to update name');
    }
  }

  const initials    = getInitials(user.name);
  const avatarColor = getAvatarColor(user.name);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      {/* Card header with avatar */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <span
          className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </span>
        <div>
          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{user.name}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <BsPerson /> Profile Information
        </h3>

        <div className="space-y-1.5">
          <Label htmlFor="name">Display Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          <p className="text-xs text-slate-400">This name appears in the top bar and your avatar initials</p>
        </div>

        <div className="space-y-1.5">
          <Label>Email <span className="text-slate-400 font-normal">(read-only)</span></Label>
          <Input value={user.email} readOnly disabled className="opacity-60 cursor-not-allowed" />
        </div>

        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? 'Saving…' : 'Save Name'}
        </Button>
      </form>
    </div>
  );
}
