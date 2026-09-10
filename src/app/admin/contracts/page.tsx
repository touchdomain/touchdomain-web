import { ExternalLink } from 'lucide-react';
import { getClientOptions, getNextInvoiceNumber, getContracts } from '@/lib/admin-data';
import { createClient } from '@/lib/supabase/server';
import { PageHeader, Card, Badge, SectionTitle } from '@/components/portal/ui';
import type { ContractStatus } from '@/lib/database.types';
import ContractForm from './contract-form';
import Countersign from './countersign';

export const metadata = { title: 'Contracts' };

const STATUS: Record<ContractStatus, { label: string; tone: 'amber' | 'purple' | 'green' | 'neutral' }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent — awaiting client', tone: 'amber' },
  client_signed: { label: 'Client signed — countersign', tone: 'purple' },
  executed: { label: 'Executed', tone: 'green' },
  void: { label: 'Void', tone: 'neutral' },
};

const shortDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function ContractsPage() {
  const supabase = createClient();
  const [{ data: { user } }, clients, nextInvoiceNumber, contracts] = await Promise.all([
    supabase.auth.getUser(),
    getClientOptions(),
    getNextInvoiceNumber(),
    getContracts(),
  ]);
  const myProfile = user
    ? (await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()).data
    : null;
  const myName = myProfile?.full_name && myProfile.full_name !== 'Client' ? myProfile.full_name : 'Touch Domain';

  const active = contracts.filter((c) => c.status !== 'void');

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Send agreements for in-portal signature, then countersign. Or just download a PDF."
      />

      {active.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Sent for signature</SectionTitle>
          <div className="space-y-2">
            {active.map((c) => {
              const s = STATUS[c.status];
              return (
                <Card key={c.id} className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-td-dark">{c.title}</p>
                      <p className="text-xs text-gray-400">
                        {c.profiles?.company_name || c.profiles?.full_name || 'Client'} · sent {shortDate(c.created_at)}
                        {c.client_signed_at ? ` · client signed ${shortDate(c.client_signed_at)}` : ''}
                        {c.executed_at ? ` · executed ${shortDate(c.executed_at)}` : ''}
                      </p>
                    </div>
                    <Badge tone={s.tone}>{s.label}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs">
                    <a href={`/api/contracts/${c.id}?v=source`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-td-purple hover:text-td-accent">
                      Source PDF <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    {c.status === 'executed' && (
                      <a href={`/api/contracts/${c.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-td-purple hover:text-td-accent">
                        Executed PDF <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <Countersign contractId={c.id} status={c.status} defaultName={myName} />
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>New document</SectionTitle>
        <ContractForm
          nextInvoiceNumber={nextInvoiceNumber}
          clients={clients.map((c) => ({
            id: c.id,
            full_name: c.full_name ?? '',
            company_name: c.company_name,
            email: c.email ?? '',
          }))}
        />
      </section>
    </div>
  );
}
