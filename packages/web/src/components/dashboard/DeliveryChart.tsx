import { BarChart } from '@mui/x-charts/BarChart';
import type { DeliveryPeriod } from '@/models/dashboard.type';
import type { GroupBy } from '@/helpers/date-range';
import { formatPeriodLabel } from '@/helpers/date-range';

interface Props { data: DeliveryPeriod[]; groupBy: GroupBy; }

export function DeliveryChart({ data, groupBy }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No sent campaigns in this period
      </div>
    );
  }

  const xLabels = data.map(d => formatPeriodLabel(d.period, groupBy));

  return (
    <BarChart
      height={220}
      series={[
        {
          data: data.map(d => d.sentRecipients),
          label: 'Sent',
          color: '#3b82f6',
          stack: 'stack1',
        },
        {
          data: data.map(d => d.openedRecipients),
          label: 'Opened',
          color: '#10b981',
          stack: 'stack1',
        },
        {
          data: data.map(d => d.failedRecipients),
          label: 'Failed',
          color: '#ef4444',
          stack: 'stack1',
        },
      ]}
      xAxis={[{ scaleType: 'band', data: xLabels }]}
      yAxis={[{ label: 'Recipients' }]}
      tooltip={{ trigger: 'item' }}
      margin={{ top: 30, bottom: 40, left: 60, right: 10 }}
    />
  );
}
