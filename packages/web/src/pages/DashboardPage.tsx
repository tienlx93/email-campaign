import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DateFilterBar } from '@/components/dashboard/DateFilterBar';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { VolumeTrendChart } from '@/components/dashboard/VolumeTrendChart';
import { DeliveryChart } from '@/components/dashboard/DeliveryChart';
import { useGetDashboardQuery } from '@/store/api';
import {
  getPresetRange, computeGroupBy, toIsoDate,
  type DatePreset, type GroupBy,
} from '@/helpers/date-range';

export function DashboardPage() {
  const defaultRange = getPresetRange('last30');
  const [from, setFrom] = useState<Date>(defaultRange.from);
  const [to, setTo]     = useState<Date>(defaultRange.to);
  const [activePreset, setActivePreset] = useState<DatePreset | null>('last30');
  const groupBy: GroupBy = computeGroupBy(from, to);

  function handlePreset(preset: DatePreset) {
    const range = getPresetRange(preset);
    setFrom(range.from);
    setTo(range.to);
    setActivePreset(preset);
  }

  function handleCustomRange(newFrom: Date, newTo: Date) {
    setFrom(newFrom);
    setTo(newTo);
    setActivePreset(null);
  }

  const { data, isLoading, isError } = useGetDashboardQuery({
    from: toIsoDate(from),
    to:   toIsoDate(to),
    groupBy,
  });

  const fromLabel = from.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const toLabel   = to.toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Monitor your campaign performance at a glance</p>
      </div>

      <DateFilterBar
        from={from} to={to}
        activePreset={activePreset}
        groupBy={groupBy}
        onPreset={handlePreset}
        onCustomRange={handleCustomRange}
      />

      {isError && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>Failed to load dashboard data. Please try again.</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <>
          <div className="grid grid-cols-7 gap-3 mb-5">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl mb-4" />
          <Skeleton className="h-64 rounded-xl" />
        </>
      ) : data ? (
        <>
          <KpiCards kpi={data.kpi} />

          {/* Section title */}
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Performance Overview
            </h2>
            <p className="text-xs text-slate-400">
              {fromLabel} – {toLabel} · grouped by {groupBy}
            </p>
          </div>

          {/* Chart 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                          rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Campaign Volume Trend
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Scheduled · Sent per {groupBy} (drafts excluded — no sent date)
            </p>
            <VolumeTrendChart data={data.volumeSeries} groupBy={groupBy} />
          </div>

          {/* Chart 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                          rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Email Delivery Performance
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              Sent campaigns only · recipients by {groupBy}
            </p>
            <DeliveryChart data={data.deliverySeries} groupBy={groupBy} />
          </div>
        </>
      ) : null}
    </div>
  );
}
