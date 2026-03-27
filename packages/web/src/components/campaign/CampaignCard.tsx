import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { fmtDate, fmtDateTime } from '@/helpers/date';
import type { CampaignSummary } from '@/models/campaign.type';

export function CampaignCard({ campaign }: { campaign: CampaignSummary }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => void navigate(`/campaigns/${campaign.id}`)}
    >
      <CardContent className="pt-5 pb-4 px-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight">{campaign.name}</h3>
          <StatusBadge status={campaign.status} />
        </div>
        <p className="text-sm text-muted-foreground truncate">{campaign.subject}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{campaign.recipient_count} recipients</span>
          {campaign.status === 'scheduled' && campaign.scheduled_at && (
            <span className="text-blue-600">
              Scheduled for {fmtDateTime(campaign.scheduled_at)}
            </span>
          )}
          <span className="ml-auto">Created {fmtDate(campaign.created_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
