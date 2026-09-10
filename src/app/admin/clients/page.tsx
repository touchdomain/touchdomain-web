import Link from 'next/link';
import { getClientsWithProjects } from '@/lib/admin-data';
import { PageHeader, Card, Badge, EmptyState } from '@/components/portal/ui';
import NewClient from './new-client';

export const metadata = { title: 'Clients' };

export default async function ClientsPage() {
  const clients = await getClientsWithProjects();

  return (
    <div className="max-w-4xl">
      <PageHeader title="Clients" subtitle={`${clients.length} client account${clients.length === 1 ? '' : 's'}.`} action={<NewClient />} />

      {clients.length === 0 ? (
        <EmptyState title="No clients yet." hint="Provision one to give them portal access." />
      ) : (
        <div className="space-y-3">
          {clients.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-td-dark">{c.full_name}</p>
                  <p className="text-xs text-gray-400">{c.company_name || '—'} · {c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
                </div>
                <span className="text-[11px] text-gray-400">
                  Added {new Date(c.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {c.projects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 border-t border-td-purple/10 pt-3">
                  {c.projects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/admin/projects/${p.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-td-purple/[0.04] px-3 py-1.5 text-xs font-medium text-td-dark hover:bg-td-purple/10"
                    >
                      {p.title}
                      <Badge tone={p.status === 'completed' ? 'green' : 'purple'}>{p.progress_percentage}%</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
