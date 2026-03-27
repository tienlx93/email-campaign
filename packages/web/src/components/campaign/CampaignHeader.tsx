import { useState } from 'react';
import { Loader2, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { useScheduleCampaignMutation } from '@/store/api';
import { fmtDate, fmtDateTime } from '@/helpers/date';
import type { Campaign } from '@/models/campaign.type';

interface Props {
  campaign: Campaign;
  editing: boolean;
  onToggleEdit: () => void;
  onOpenSchedule: () => void;
  onOpenSend: () => void;
  onOpenDelete: () => void;
}

export function CampaignHeader({
  campaign,
  editing,
  onToggleEdit,
  onOpenSchedule,
  onOpenSend,
  onOpenDelete,
}: Props) {
  const [cancelSchedule, { isLoading: isCancellingSchedule }] = useScheduleCampaignMutation();
  const [cancelError, setCancelError] = useState<string | null>(null);

  async function handleCancelSchedule() {
    setCancelError(null);
    try {
      await cancelSchedule({ id: campaign.id, scheduled_at: null }).unwrap();
    } catch {
      toast.error('Failed to cancel schedule');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-tight">{campaign.name}</h1>
          <p className="text-muted-foreground mt-0.5 truncate">{campaign.subject}</p>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span>Created {fmtDate(campaign.created_at)}</span>
        <span>Updated {fmtDate(campaign.updated_at)}</span>
        {campaign.status === 'scheduled' && campaign.scheduled_at && (
          <span className="flex items-center gap-1 text-blue-600">
            <CalendarClock className="h-4 w-4" />
            Scheduled for {fmtDateTime(campaign.scheduled_at)}
          </span>
        )}
      </div>

      {cancelError && (
        <p className="text-sm text-destructive">{cancelError}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {campaign.status === 'draft' && (
          <>
            <Button variant="outline" size="sm" onClick={onToggleEdit}>
              {editing ? 'Preview' : 'Edit'}
            </Button>
            <Button variant="default" size="sm" onClick={onOpenSchedule}>
              Schedule
            </Button>
            <Button variant="default" size="sm" onClick={onOpenSend}>
              Send Now!
            </Button>
            <Button variant="destructive" size="sm" onClick={onOpenDelete}>
              Delete
            </Button>
          </>
        )}

        {campaign.status === 'scheduled' && (
          <>
            <Button variant="default" size="sm" onClick={onOpenSend}>
              Send Now!
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isCancellingSchedule}
              onClick={() => void handleCancelSchedule()}
            >
              {isCancellingSchedule && <Loader2 className="animate-spin" />}
              Cancel Schedule
            </Button>
            <Button variant="destructive" size="sm" onClick={onOpenDelete}>
              Delete
            </Button>
          </>
        )}

        {campaign.status === 'sent' && (
          <span className="text-sm text-muted-foreground">This campaign has been sent.</span>
        )}
      </div>
    </div>
  );
}
