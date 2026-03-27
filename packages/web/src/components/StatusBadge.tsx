import { Badge } from '@/components/ui/badge';
import type { CampaignSummary } from '@/store/api';

interface StatusBadgeProps {
  status: CampaignSummary['status'];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'sent') {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Sent</Badge>;
  }
  if (status === 'scheduled') {
    return (
      <Badge variant="outline" className="border-blue-400 text-blue-700">
        Scheduled
      </Badge>
    );
  }
  return <Badge variant="secondary">Draft</Badge>;
}
