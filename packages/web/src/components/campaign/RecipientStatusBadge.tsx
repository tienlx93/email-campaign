import type { RecipientStatus } from '@/models/campaign.type';

const classes: Record<RecipientStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  sent: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-700',
};

export function RecipientStatusBadge({ status }: { status: RecipientStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
