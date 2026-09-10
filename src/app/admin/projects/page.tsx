import Link from 'next/link';
import { getAllProjects } from '@/lib/admin-data';
import { PageHeader, Card, Badge, EmptyState } from '@/components/portal/ui';

export const metadata = { title: 'Projects' };

const TONE = {
  discovery: 'purple', in_progress: 'purple', review: 'amber', completed: 'green', paused: 'neutral',
} as const;

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="max-w-4xl">
      <PageHeader title="Projects" subtitle={`${projects.length} project${projects.length === 1 ? '' : 's'}.`} />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet." hint="Create one from a client's page." />
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/admin/projects/${p.id}`}>
              <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:border-td-accent/40">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-td-dark">{p.title}</p>
                  <p className="truncate text-xs text-gray-400">
                    {p.profiles?.company_name || p.profiles?.full_name || p.profiles?.email}
                    {p.target_launch_date ? ` · launch ${new Date(p.target_launch_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-td-purple/10 sm:block">
                    <div className="h-full bg-td-accent" style={{ width: `${p.progress_percentage}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{p.progress_percentage}%</span>
                  <Badge tone={TONE[p.status]}>{p.status.replace('_', ' ')}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
