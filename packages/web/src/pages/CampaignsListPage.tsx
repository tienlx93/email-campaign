import { useSearchParams, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CampaignCard } from '@/components/campaign/CampaignCard';
import { SkeletonCard } from '@/components/campaign/SkeletonCard';
import { useListCampaignsQuery } from '@/store/api';

export function CampaignsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  const { data, isLoading, isFetching, isError, refetch } = useListCampaignsQuery(
    { page },
    { refetchOnMountOrArgChange: true }
  );

  const totalPages = data ? Math.ceil(data.pagination.total / data.pagination.limit) : 1;

  function setPage(next: number) {
    setSearchParams({ page: String(next) });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Campaigns</h1>
          {data && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.pagination.total} campaign{data.pagination.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <Button asChild>
          <Link to="/campaigns/new">New Campaign</Link>
        </Button>
      </div>

      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load campaigns. Something went wrong.</span>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isFetching ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : data?.pagination.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Mail className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">No campaigns yet</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first campaign to get started.
            </p>
          </div>
          <Button asChild>
            <Link to="/campaigns/new">New Campaign</Link>
          </Button>
        </div>
      ) : (
        <div className={`grid gap-3 md:grid-cols-2 ${isFetching ? 'opacity-60' : ''}`}>
          {data?.campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}

      {data && totalPages >= 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
