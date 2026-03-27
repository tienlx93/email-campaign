/**
 * Extract the `error` message from an RTK Query rejection, with a fallback.
 * RTK Query errors carry a `data` object from the server response body.
 */
export function extractApiError(err: unknown, fallback: string): string {
  const d = err as { data?: { error?: string }; status?: number };
  return d?.data?.error ?? fallback;
}
