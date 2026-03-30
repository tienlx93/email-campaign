import { BarChart } from '@mui/x-charts/BarChart';
import type { DeliveryPeriod } from '@/models/dashboard.type';
import type { GroupBy } from '@/helpers/date-range';
import { formatPeriodLabel } from '@/helpers/date-range';
import { MuiThemeWrapper } from './MuiThemeWrapper';

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

  // Break the stack into non-overlapping segments so totals don't double-count:
  //   Opened  +  Not-opened (sent - opened - failed)  +  Failed  =  total recipients
  const openedData    = data.map(d => d.openedRecipients);
  const notOpenedData = data.map(d => Math.max(0, d.sentRecipients - d.openedRecipients - d.failedRecipients));
  const failedData    = data.map(d => d.failedRecipients);

  return (
    <MuiThemeWrapper>
      <BarChart
        height={220}
        series={[
          {
            data: openedData,
            label: 'Opened',
            color: '#10b981',
            stack: 'stack1',
            valueFormatter: (value, { dataIndex }) => {
              const sent = data[dataIndex]?.sentRecipients ?? 0;
              if (value === null || value === undefined || sent === 0) return String(value ?? 0);
              const pct = Math.round((value / sent) * 100);
              return `${value} (${pct}% of sent)`;
            },
          },
          {
            data: notOpenedData,
            label: 'Not opened',
            color: '#93c5fd',
            stack: 'stack1',
          },
          {
            data: failedData,
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
    </MuiThemeWrapper>
  );
}
