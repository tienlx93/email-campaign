import type { DashboardKpi } from '@/models/dashboard.type';

interface Props { kpi: DashboardKpi; }

function pct(num: number, den: number): string {
  if (den === 0) return '0%';
  return `${Math.round((num / den) * 100)}%`;
}

interface CardProps { label: string; value: string | number; sub: string; color: string; }

function KpiCard({ label, value, sub, color }: CardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700
                    rounded-xl p-4 flex flex-col gap-1 min-w-0">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">{label}</span>
      <span className={`text-2xl font-extrabold ${color}`}>{value}</span>
      <span className="text-[10px] text-slate-400 truncate">{sub}</span>
    </div>
  );
}

export function KpiCards({ kpi }: Props) {
  return (
    <div className="grid grid-cols-7 gap-3 mb-5">
      <KpiCard label="Total"        value={kpi.totalCampaigns}    sub="campaigns"       color="text-slate-900 dark:text-slate-100" />
      <KpiCard label="Draft"        value={kpi.draftCampaigns}    sub="campaigns"       color="text-slate-500" />
      <KpiCard label="Scheduled"    value={kpi.scheduledCampaigns} sub="campaigns"      color="text-amber-500" />
      <KpiCard label="Emails Sent"  value={kpi.totalRecipients.toLocaleString()} sub="recipients" color="text-blue-500" />
      <KpiCard label="Success Rate" value={pct(kpi.sentRecipients, kpi.totalRecipients)}  sub="sent / total"    color="text-emerald-500" />
      <KpiCard label="Open Rate"    value={pct(kpi.openedRecipients, kpi.sentRecipients)} sub="opened / sent"  color="text-indigo-500" />
      <KpiCard label="Failed Rate"  value={pct(kpi.failedRecipients, kpi.totalRecipients)} sub="failed / total" color="text-red-500" />
    </div>
  );
}
