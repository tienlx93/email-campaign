import { Progress } from '@/components/ui/progress';
import type { Stats, CampaignStatus } from '@/models/campaign.type';

interface Props {
  stats: Stats;
  status: CampaignStatus;
}

export function CampaignStats({ stats, status }: Props) {
  if (status === 'draft' && stats.total === 0) {
    return <p className="text-sm text-muted-foreground">No recipients added yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Sent</p>
        <p className="text-2xl font-bold">{stats.sent}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress
            value={stats.send_rate * 100}
            className="h-1.5 flex-1 [&_div]:bg-green-500"
          />
          <span className="text-xs text-muted-foreground">
            {(stats.send_rate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Opened</p>
        <p className="text-2xl font-bold">{stats.opened}</p>
        <div className="flex items-center gap-2 mt-1">
          <Progress
            value={stats.open_rate * 100}
            className="h-1.5 flex-1 [&_div]:bg-blue-500"
          />
          <span className="text-xs text-muted-foreground">
            {(stats.open_rate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Failed</p>
        <p className="text-2xl font-bold">{stats.failed}</p>
      </div>
    </div>
  );
}
