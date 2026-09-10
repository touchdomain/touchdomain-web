import { ExternalLink } from 'lucide-react';
import { getClientContracts, getClientContext } from '@/lib/portal-data';
import { PageHeader, Card, Badge, EmptyState } from '@/components/portal/ui';
import type { ContractStatus } from '@/lib/database.types';
import SignContract from './sign-contract';

export const metadata = { title: 'Contracts' };

const STATUS: Record<ContractStatus, { label: string; tone: 'amber' | 'purple' | 'green' | 'neutral' }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Awaiting your signature', tone: 'amber' },
  client_signed: { label: 'Signed — awaiting countersignature', tone: 'purple' },
  executed: { label: 'Fully signed', tone: 'green' },
  void: { label: 'Void', tone: 'neutral' },
};

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function ClientContractsPage() {
  const [contracts, { profile }] = await Promise.all([getClientContracts(), getClientContext()]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Contracts" subtitle="Review and sign your agreements with Touch Domain." />

      {contracts.length === 0 ? (
        <EmptyState title="No contracts yet." hint="When we send you an agreement it will appear here to sign." />
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => {
            const s = STATUS[c.status];
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-td-dark">{c.title}</p>
                    <p className="text-xs text-gray-400">Sent {shortDate(c.created_at)}</p>
                  </div>
                  <Badge tone={s.tone}>{s.label}</Badge>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs">
                  <a
                    href={`/api/contracts/${c.id}?v=source`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-td-purple hover:text-td-accent"
                  >
                    Read the agreement <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {c.status === 'executed' && (
                    <a
                      href={`/api/contracts/${c.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-td-purple hover:text-td-accent"
                    >
                      Download signed copy <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {c.status === 'sent' && (
                  <div className="mt-4">
                    <SignContract contractId={c.id} suggestedName={profile?.full_name ?? ''} />
                  </div>
                )}
                {c.status === 'client_signed' && c.client_signed_at && (
                  <p className="mt-3 text-xs text-gray-400">
                    You signed on {shortDate(c.client_signed_at)}. We&apos;ll countersign and send the final copy shortly.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
