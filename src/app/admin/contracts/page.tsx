import { getClientOptions, getNextInvoiceNumber } from '@/lib/admin-data';
import { PageHeader } from '@/components/portal/ui';
import ContractForm from './contract-form';

export const metadata = { title: 'Contracts' };

export default async function ContractsPage() {
  const [clients, nextInvoiceNumber] = await Promise.all([
    getClientOptions(),
    getNextInvoiceNumber(),
  ]);

  return (
    <div>
      <PageHeader
        title="Contract & invoice generator"
        subtitle="Branded PDFs — download to send, or file straight to a client's portal."
      />
      <ContractForm
        nextInvoiceNumber={nextInvoiceNumber}
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
