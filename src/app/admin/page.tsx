import Link from 'next/link';
import { Users, FolderKanban, ReceiptText, ClipboardList, ArrowRight } from 'lucide-react';
import { getAdminStats, getAllProjects } from '@/lib/admin-data';
import { PageHeader, Card, SectionTitle, StatCard, Badge } from '@/components/portal/ui';

const money = (n: number) => 'R ' + n.toLocaleString('en-ZA', { minimumFractionDigits: 0 });

const STATUS_TONE = {
  discovery: 'purple', in_progress: 'purple', review: 'amber', completed: 'green', paused: 'neutral',
} as const;

export default async function AdminOverviewPage() {
  const [stats, projects] = await Promise.all([getAdminStats(), getAllProjects()]);
  const active = projects.filter((p) => p.status !== 'completed' && p.status !== 'paused').slice(0, 6);

  return (
    <div className="max-w-5xl">
      <PageHeader title="Overview" subtitle="Everything at a glance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clients" value={stats.clients} icon={Users} />
        <StatCard label="Active projects" value={stats.activeProjects} icon={FolderKanban} />
        <StatCard label="Outstanding" value={money(stats.outstandingZar)} icon={ReceiptText} />
        <StatCard label="Onboarding pending" value={stats.pendingOnboarding} icon={ClipboardList} />
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle className="mb-0">Active projects</SectionTitle>
          <Link href="/admin/projects" className="inline-flex items-center gap-1 text-sm font-semibold text-td-purple hover:text-td-accent">
            All projects <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {active.length === 0 ? (
          <Card><p className="text-sm italic text-gray-400">No active projects.</p></Card>
        ) : (
          <div className="space-y-2">
            {active.map((p) => (
              <Link key={p.id} href={`/admin/projects/${p.id}`}>
                <Card className="flex items-center justify-between p-4 transition-colors hover:border-td-accent/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-td-dark">{p.title}</p>
                    <p className="truncate text-xs text-gray-400">
                      {p.profiles?.company_name || p.profiles?.full_name || p.profiles?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500">{p.progress_percentage}%</span>
                    <Badge tone={STATUS_TONE[p.status]}>{p.status.replace('_', ' ')}</Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
