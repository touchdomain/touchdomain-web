import { getClientOptions } from '@/lib/admin-data';
import { PageHeader } from '@/components/portal/ui';
import ContractForm from './contract-form';

export const metadata = { title: 'Contracts' };

export default async function ContractsPage() {
  const clients = await getClientOptions();

  return (
    <div>
      <PageHeader
        title="Contract generator"
        subtitle="Produce a branded, offline PDF agreement for a client. Nothing is stored — download it, then send it for signature."
      />
      <ContractForm
        clients={clients.map((c) => ({
          id: c.id,
          full_name: c.full_name ?? '',
          company_name: c.company_name,
          email: c.email ?? '',
        }))}
      />
    </div>
  );
}
