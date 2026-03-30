import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CampaignHeader } from '@/components/campaign/CampaignHeader';
import { CampaignStats } from '@/components/campaign/CampaignStats';
import { CampaignBody } from '@/components/campaign/CampaignBody';
import { RecipientEditorSection } from '@/components/campaign/RecipientEditorSection';
import { RecipientsTable } from '@/components/campaign/RecipientsTable';
import { DetailSkeleton } from '@/components/campaign/DetailSkeleton';
import { ScheduleDialog } from '@/components/campaign/ScheduleDialog';
import {
  useGetCampaignQuery,
  useSendCampaignMutation,
  useDeleteCampaignMutation,
} from '@/store/api';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campaignId = parseInt(id ?? '0', 10);

  const { data: campaign, isLoading, isError, error, refetch } = useGetCampaignQuery(campaignId);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState(false);

  const [send, { isLoading: isSending }] = useSendCampaignMutation();
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  const is404 = isError && (error as { status?: number })?.status === 404;

  if (isLoading) return <DetailSkeleton />;

  if (is404) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-3">
        <h2 className="text-xl font-semibold">Campaign not found</h2>
        <p className="text-muted-foreground">
          This campaign does not exist or you do not have permission to view it.
        </p>
        <Button asChild variant="outline">
          <Link to="/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>Something went wrong. Please try again.</span>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!campaign) return null;

  async function handleSend() {
    try {
      await send(campaignId).unwrap();
      toast.success('Campaign sent successfully');
      setSendOpen(false);
    } catch (err) {
      setSendOpen(false);
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        toast.error('Campaign was already sent');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  }

  async function handleDelete() {
    try {
      await deleteCampaign(campaignId).unwrap();
      toast.success('Campaign deleted');
      void navigate('/campaigns');
    } catch (err) {
      setDeleteOpen(false);
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        toast.error('Only draft campaigns can be deleted');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <Link
        to="/campaigns"
        className="text-sm text-muted-foreground hover:text-foreground inline-block"
      >
        ← Back to campaigns
      </Link>

      <CampaignHeader
        campaign={campaign}
        editing={editing}
        onToggleEdit={() => setEditing((e) => !e)}
        onOpenSchedule={() => setScheduleOpen(true)}
        onOpenSend={() => setSendOpen(true)}
        onOpenDelete={() => setDeleteOpen(true)}
      />

      <Separator />

      <CampaignStats stats={campaign.stats} status={campaign.status} />

      <Separator />

      <CampaignBody
        campaign={campaign}
        editing={editing}
        onEditDone={() => setEditing(false)}
      />

      <Separator />

      <div>
        <h2 className="font-semibold mb-3">
          Recipients ({campaign.recipients.length})
        </h2>
        {campaign.status === 'draft' ? (
          <RecipientEditorSection campaign={campaign} />
        ) : (
          <RecipientsTable recipients={campaign.recipients} />
        )}
      </div>

      {/* ── Dialogs ── */}
      <ScheduleDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        campaignId={campaignId}
      />

      <AlertDialog open={sendOpen} onOpenChange={setSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately send the campaign to all {campaign.recipients.length}{' '}
              recipients. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void handleSend()}
              disabled={isSending}
            >
              {isSending && <Loader2 className="animate-spin" />}
              Send Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => void handleDelete()}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
