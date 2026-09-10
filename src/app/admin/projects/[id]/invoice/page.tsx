import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProjectDetail } from '@/lib/admin-data';
import { PageHeader } from '@/components/portal/ui';
import InvoiceGenerator from './invoice-generator';

export const metadata = { title: 'New invoice' };

export default async function NewInvoicePage({ params }: { params: { id: string } }) {
  const detail = await getProjectDetail(params.id);
  if (!detail) notFound();
  const { project } = detail;

  return (
    <div className="max-w-3xl">
      <Link href={`/admin/projects/${project.id}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
        <ArrowLeft className="h-4 w-4" /> {project.title}
      </Link>
      <PageHeader title="Generate invoice" subtitle="Builds the PDF, files it to the project's Drive folder, and records it against the client." />
      <InvoiceGenerator
        projectId={project.id}
        clientId={project.client_id}
        client={{
          name: project.profiles?.full_name ?? 'Client',
          company: project.profiles?.company_name ?? null,
          email: project.profiles?.email ?? '',
        }}
      />
    </div>
  );
}
