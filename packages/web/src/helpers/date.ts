/** Format an ISO date string as "Jan 5, 2025" */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format an ISO datetime string as "Jan 5, 2025, 3:04 PM" */
export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Format a nullable ISO datetime string; returns "—" when null. */
export function fmtNullable(iso: string | null): string {
  return iso ? fmtDateTime(iso) : '—';
}
