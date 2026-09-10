import Link from 'next/link';
import { getClientsWithProjects, getStaff } from '@/lib/admin-data';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, EmptyState, SectionTitle } from '@/components/portal/ui';
import NewClient from './new-client';
import NewStaff from './new-staff';
import UserActions from './user-actions';

export const metadata = { title: 'Clients & staff' };

export default async function ClientsPage() {
  const supabase = createClient();
  const [{ data: { user } }, clients, staff] = await Promise.all([
    supabase.auth.getUser(),
    getClientsWithProjects(),
    getStaff(),
  ]);
  const meId = user?.id ?? '';

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Clients & staff"
        subtitle={`${clients.length} client${clients.length === 1 ? '' : 's'} · ${staff.length} staff`}
        action={
          <div className="flex flex-wrap gap-2">
            <NewStaff />
            <NewClient />
          </div>
        }
      />

      <section className="mb-8">
        <SectionTitle>Staff</SectionTitle>
        <div className="space-y-2">
          {staff.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-td-dark">
                  {s.full_name}{s.id === meId && <span className="ml-2 text-xs font-normal text-gray-400">(you)</span>}
                </p>
                <p className="text-xs text-gray-400">{s.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="purple">admin</Badge>
                <UserActions userId={s.id} name={s.full_name} role="admin" isSelf={s.id === meId} />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Clients</SectionTitle>
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
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-400">
                      Added {new Date(c.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <UserActions userId={c.id} name={c.full_name} role="client" isSelf={false} />
                  </div>
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
      </section>
    </div>
  );
}
