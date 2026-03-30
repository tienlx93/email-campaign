export type GroupBy = 'day' | 'week' | 'month';

export type DateRange = { from: Date; to: Date };

export type DatePreset = 'thisWeek' | 'thisMonth' | 'last3Months' | 'thisYear';

/** Returns a YYYY-MM-DD string in local time (not UTC). */
export function toLocalIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** @deprecated Use toLocalIsoDate instead. Kept for compat — now returns local date string. */
export function toIsoDate(d: Date): string {
  return toLocalIsoDate(d);
}

export function getPresetRange(preset: DatePreset): DateRange {
  const now = new Date();

  // End of today in local time
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const endOfWeek = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  let from: Date;

  switch (preset) {
    case 'thisWeek': {
      // Monday of the current week
      const day = now.getDay(); // 0 = Sun, 1 = Mon, ...
      const diff = (day === 0 ? -6 : 1 - day); // days back to Monday
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff, 0, 0, 0, 0);
      return { from, to: endOfWeek };
      break;
    }
    case 'thisMonth': {
      from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    }
    case 'last3Months': {
      // 1st of 2 months ago → end of this month
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1, 0, 0, 0, 0);
      // to = end of this month
      return { from, to: endOfMonth };
    }
    case 'thisYear': {
      from = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      // to = end of this year
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { from, to: endOfYear };
    }
  }

  return { from, to };
}

export function computeGroupBy(from: Date, to: Date): GroupBy {
  const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 30) return 'day';
  if (days <= 90) return 'week';
  return 'month';
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
