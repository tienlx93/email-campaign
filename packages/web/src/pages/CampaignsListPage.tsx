import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BsSearch, BsEnvelopePlus, BsInbox } from 'react-icons/bs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { useListCampaignsQuery } from '@/store/api';
import { fmtDate, fmtNullable } from '@/helpers/date';
import type { CampaignSummary } from '@/models/campaign.type';

export function CampaignsListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((val: string) => {
    setSearchInput(val);
    setSearchParams({ page: '1' });
  }, [setSearchParams]);

  const handleStatusChange = useCallback((val: string) => {
    setStatusFilter(val);
    setSearchParams({ page: '1' });
  }, [setSearchParams]);

  const { data, isLoading, isFetching, isError, refetch } = useListCampaignsQuery({
    page,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  }, { refetchOnMountOrArgChange: true });

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.limit) : 1;
  const hasFilters = !!debouncedSearch || statusFilter !== 'all';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-foreground">Email Campaigns</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.pagination.total} campaign{data.pagination.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button asChild size="sm">
          <Link to="/campaigns/new">
            <BsEnvelopePlus className="mr-1.5" /> New Campaign
          </Link>
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <Input
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Search by campaign name or subject…"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load campaigns.</span>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : data?.pagination.total === 0 && !hasFilters ? (
        /* Zero campaigns total */
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <BsInbox className="text-5xl text-slate-300" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">No campaigns yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Create your first campaign to get started.</p>
          </div>
          <Button asChild><Link to="/campaigns/new">New Campaign</Link></Button>
        </div>
      ) : data?.campaigns.length === 0 && hasFilters ? (
        /* Filtered to zero */
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <BsSearch className="text-4xl text-slate-300" />
          <div>
            <h2 className="text-base font-semibold text-foreground">
              No campaigns match your search
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Try a different search term or clear the filters.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setSearchInput(''); setStatusFilter('all'); }}>
            Clear filters
          </Button>
        </div>
      ) : (
        <div className={isFetching ? 'opacity-60 pointer-events-none transition-opacity' : ''}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.campaigns.map((c: CampaignSummary) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => void navigate(`/campaigns/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate">{c.subject}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                  <TableCell>{c.recipient_count}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmtNullable(c.scheduled_at)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{fmtDate(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            Showing {data.campaigns.length} of {data.pagination.total}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}
              onClick={() => setSearchParams({ page: String(page - 1) })}>
              ← Prev
            </Button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages}
              onClick={() => setSearchParams({ page: String(page + 1) })}>
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
