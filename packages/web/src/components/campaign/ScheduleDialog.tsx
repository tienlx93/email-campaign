import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useScheduleCampaignMutation } from '@/store/api';
import { scheduleSchema, type ScheduleFormValues } from '@/validations/campaign';
import { extractApiError } from '@/helpers/api-error';

interface Props {
  open: boolean;
  onClose: () => void;
  campaignId: number;
}

export function ScheduleDialog({ open, onClose, campaignId }: Props) {
  const [schedule, { isLoading }] = useScheduleCampaignMutation();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleFormValues>({ resolver: zodResolver(scheduleSchema) });

  async function onSubmit(values: ScheduleFormValues) {
    setApiError(null);
    try {
      await schedule({
        id: campaignId,
        scheduled_at: new Date(values.scheduled_at).toISOString(),
      }).unwrap();
      onClose();
    } catch (err) {
      setApiError(extractApiError(err, 'Failed to schedule campaign'));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Campaign</DialogTitle>
          <DialogDescription>
            Choose a future date and time to automatically send this campaign.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="scheduled_at">Date &amp; Time</Label>
            <Input id="scheduled_at" type="datetime-local" {...register('scheduled_at')} />
            {errors.scheduled_at && (
              <p className="text-sm text-destructive">{errors.scheduled_at.message}</p>
            )}
            {apiError && <p className="text-sm text-destructive">{apiError}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
