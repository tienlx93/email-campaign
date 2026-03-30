import { ProfileForm } from '@/components/settings/ProfileForm';
import { PasswordForm } from '@/components/settings/PasswordForm';

export function UserSettingsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">User Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Update your display name and password</p>
      </div>
      <div className="space-y-4">
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  );
}
