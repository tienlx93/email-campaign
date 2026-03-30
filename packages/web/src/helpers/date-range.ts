export type GroupBy = 'day' | 'week' | 'month';

export type DateRange = { from: Date; to: Date };

export type DatePreset = 'last7' | 'last30' | 'last90' | 'thisYear';

export function getPresetRange(preset: DatePreset): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  switch (preset) {
    case 'last7':    from.setDate(from.getDate() - 6);   break;
    case 'last30':   from.setDate(from.getDate() - 29);  break;
    case 'last90':   from.setDate(from.getDate() - 89);  break;
    case 'thisYear': from.setMonth(0, 1);                break;
  }
  return { from, to };
}

export function computeGroupBy(from: Date, to: Date): GroupBy {
  const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 30) return 'day';
  if (days <= 90) return 'week';
  return 'month';
}

export function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function formatPeriodLabel(period: string, groupBy: GroupBy): string {
  const d = new Date(period + 'T00:00:00');
  if (groupBy === 'day') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  if (groupBy === 'week') {
    return `W${getISOWeek(d)} ${d.getFullYear()}`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getISOWeek(d: Date): number {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7
    )
  );
}
