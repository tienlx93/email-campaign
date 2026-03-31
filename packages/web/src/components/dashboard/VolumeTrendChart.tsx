import { BarChart } from '@mui/x-charts/BarChart';
import type { VolumePeriod } from '@/models/dashboard.type';
import type { GroupBy } from '@/helpers/date-range';
import { formatPeriodLabel } from '@/helpers/date-range';
import { MuiThemeWrapper } from './MuiThemeWrapper';

interface Props { data: VolumePeriod[]; groupBy: GroupBy; }

export function VolumeTrendChart({ data, groupBy }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No campaign activity in this period
      </div>
    );
  }

  const xLabels = data.map(d => formatPeriodLabel(d.period, groupBy));

  return (
    <MuiThemeWrapper>
      <BarChart
        height={220}
        series={[
          {
            data: data.map(d => d.scheduledCount),
            label: 'Scheduled',
            color: '#f59e0b',
            stack: 'stack1',
          },
          {
            data: data.map(d => d.sentCount),
            label: 'Sent',
            color: '#10b981',
            stack: 'stack1',
          },
        ]}
        xAxis={[{ scaleType: 'band', data: xLabels }]}
        yAxis={[{ label: 'Campaigns' }]}
        // slotProps={{ tooltip: { trigger: 'item' } }}
        margin={{ top: 30, bottom: 40, left: 50, right: 10 }}
      />
    </MuiThemeWrapper>
  );
}
