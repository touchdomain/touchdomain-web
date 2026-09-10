import { FileText, ExternalLink } from 'lucide-react';
import { getClientContext, getClientFiles } from '@/lib/portal-data';
import { PageHeader, Card, EmptyState } from '@/components/portal/ui';
import UploadWidget from './upload-widget';

export const metadata = { title: 'Files' };

function formatSize(bytes: number | null) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export default async function FilesPage() {
  const [{ project }, files] = await Promise.all([getClientContext(), getClientFiles()]);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Project files"
        subtitle="Share assets, briefs and reference material with your project team."
      />

      {project ? (
        <UploadWidget />
      ) : (
        <EmptyState title="Uploads open once your project is set up." />
      )}

      <div className="mt-8">
        {files.length === 0 ? (
          <p className="text-sm italic text-gray-400">Nothing uploaded yet.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li key={f.id}>
                <Card className="flex items-center justify-between p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-td-accent" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-td-dark">{f.file_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(f.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {f.file_size_bytes ? ` · ${formatSize(f.file_size_bytes)}` : ''}
                      </p>
                    </div>
                  </div>
                  {f.view_link && (
                    <a
                      href={f.view_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
                    >
                      Open <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
