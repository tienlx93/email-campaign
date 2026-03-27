import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CampaignBodyEditor } from '@/components/CampaignBodyEditor';
import { useUpdateCampaignMutation } from '@/store/api';
import { editCampaignSchema, type EditCampaignFormValues } from '@/validations/campaign';
import { extractApiError } from '@/helpers/api-error';
import type { Campaign } from '@/models/campaign.type';

interface Props {
  campaign: Campaign;
  onCancel: () => void;
}

export function EditSection({ campaign, onCancel }: Props) {
  const [update, { isLoading }] = useUpdateCampaignMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditCampaignFormValues>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: { name: campaign.name, subject: campaign.subject, body: campaign.body },
  });

  async function onSubmit(values: EditCampaignFormValues) {
    setApiError(null);
    try {
      await update({ id: campaign.id, ...values }).unwrap();
      toast.success('Changes saved');
      onCancel();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        toast.error('Campaign can no longer be edited');
        onCancel();
      } else {
        setApiError(extractApiError(err, 'Failed to save changes'));
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="edit-name">Campaign Name</Label>
        <Input id="edit-name" {...register('name')} disabled={isLoading} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="edit-subject">Email Subject</Label>
        <Input id="edit-subject" {...register('subject')} disabled={isLoading} />
        {errors.subject && (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>
      <CampaignBodyEditor
        control={control}
        name="body"
        error={errors.body?.message}
        disabled={isLoading}
      />
      {apiError && (
        <Alert variant="destructive">
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Discard
        </Button>
      </div>
    </form>
  );
}
