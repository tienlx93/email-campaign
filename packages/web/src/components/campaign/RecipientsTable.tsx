import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RecipientStatusBadge } from './RecipientStatusBadge';
import { fmtNullable } from '@/helpers/date';
import type { Recipient } from '@/models/campaign.type';

export function RecipientsTable({ recipients }: { recipients: Recipient[] }) {
  return (
    <div className={recipients.length > 50 ? 'max-h-96 overflow-y-auto' : ''}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Opened At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No recipients linked to this campaign.
              </TableCell>
            </TableRow>
          ) : (
            recipients.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>
                  <RecipientStatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtNullable(r.sent_at)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtNullable(r.opened_at)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
