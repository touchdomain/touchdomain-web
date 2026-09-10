import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FileText, ExternalLink, ReceiptText } from 'lucide-react';
import { getProjectDetail } from '@/lib/admin-data';
import { PageHeader, Card, SectionTitle, Badge } from '@/components/portal/ui';
import MilestonesPanel from './milestones-panel';
import StatusControl from './status-control';
import PaymentPanel from './payment-panel';
import DriveFolderButton from './drive-folder-button';
import OnboardingReopen from './onboarding-reopen';
import PlaybooksControl from './playbooks-control';
import { PLAYBOOKS } from '@/lib/playbooks';
import { progressFor } from '@/lib/project-status';

const ONBOARDING_GROUPS: { label: string; fields: [string, string][] }[] = [
  {
    label: 'Business',
    fields: [
      ['business_name', 'Business name'], ['primary_goal', 'Primary goal'],
      ['target_audience', 'Target audience'], ['unique_value_prop', 'Value proposition'],
      ['competitors', 'Competitors'],
    ],
  },
  {
    label: 'Brand',
    fields: [['brand_vibe', 'Brand vibe'], ['brand_colors', 'Colours'], ['brand_fonts', 'Fonts']],
  },
  {
    label: 'Content',
    fields: [
      ['content_strategy', 'Existing content'], ['copywriting_status', 'Copywriting'],
      ['photography_status', 'Photography'], ['primary_cta', 'Primary CTA'],
    ],
  },
  {
    label: 'Technical',
    fields: [
      ['domain_status', 'Domain'], ['tech_infrastructure', 'Infrastructure'],
      ['third_party_integrations', 'Integrations'], ['secure_credential_links', 'Credential links'],
    ],
  },
  {
    label: 'Design & Features',
    fields: [
      ['design_likes', 'Likes'], ['design_dislikes', 'Dislikes'], ['must_have_features', 'Must-have features'],
    ],
  },
];

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const detail = await getProjectDetail(params.id);
  if (!detail) notFound();
  const { project, onboarding, milestones, files, paymentMilestones } = detail;
  const agreementDate = project.created_at.slice(0, 10);
  const displayProgress = progressFor(
    project.status,
    milestones.length,
    milestones.filter((m) => m.is_completed).length,
    project.progress_percentage
  );

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={project.title}
        subtitle={`${project.profiles?.full_name ?? ''} · ${project.profiles?.company_name || project.profiles?.email || ''}`}
        action={
          <div className="flex items-center gap-3">
            <StatusControl projectId={project.id} status={project.status} />
            <Link href={`/admin/projects/${project.id}/invoice`} className="inline-flex items-center gap-1.5 rounded-full border border-td-purple/25 px-4 py-2 text-sm font-semibold text-td-purple hover:bg-td-purple hover:text-white">
              <ReceiptText className="h-4 w-4" /> New invoice
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="text-gray-500">Progress <b className="text-td-dark">{displayProgress}%</b></span>
        {project.target_launch_date && (
          <span className="text-gray-500">Launch <b className="text-td-dark">{new Date(project.target_launch_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</b></span>
        )}
        <span className="text-gray-500">Onboarding <Badge tone={onboarding?.status === 'submitted' || onboarding?.status === 'reviewed' ? 'green' : 'amber'}>{(onboarding?.status ?? 'not started').replace('_', ' ')}</Badge></span>
        {project.google_drive_folder_id ? (
          <a href={`https://drive.google.com/drive/folders/${project.google_drive_folder_id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-td-purple hover:text-td-accent">
            Drive folder <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <DriveFolderButton projectId={project.id} />
        )}
      </div>

      <div className="mb-6">
        <PaymentPanel
          projectId={project.id}
          agreementDate={agreementDate}
          totalFeeZar={project.total_fee_zar}
          milestones={paymentMilestones}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <PlaybooksControl projectId={project.id} selected={project.playbooks ?? []} />
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle className="mb-0">Onboarding answers</SectionTitle>
              {(onboarding?.status === 'submitted' || onboarding?.status === 'reviewed') && (
                <OnboardingReopen clientId={project.client_id} />
              )}
            </div>
            {!onboarding ? (
              <p className="text-sm italic text-gray-400">No onboarding record.</p>
            ) : (
              <div className="space-y-5">
                {(project.playbooks ?? []).map((pbKey) => {
                  const pb = PLAYBOOKS[pbKey];
                  const answers = ((onboarding.discovery ?? {}) as Record<string, Record<string, string>>)[pbKey] ?? {};
                  const answered = pb?.questions.filter((q) => answers[q.key]) ?? [];
                  if (answered.length === 0) return null;
                  return (
                    <div key={pbKey}>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-td-accent">{pb.label} discovery</p>
                      <dl className="space-y-2">
                        {answered.map((q) => (
                          <div key={q.key} className="rounded-lg bg-td-accent/[0.06] p-3">
                            <dt className="text-xs font-semibold text-td-purple">{q.label}</dt>
                            <dd className="mt-0.5 whitespace-pre-wrap text-sm text-td-dark">{answers[q.key]}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
                {ONBOARDING_GROUPS.map((g) => {
                  const answered = g.fields.filter(([k]) => (onboarding as Record<string, unknown>)[k]);
                  if (answered.length === 0) return null;
                  return (
                    <div key={g.label}>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-gray-400">{g.label}</p>
                      <dl className="space-y-2">
                        {answered.map(([k, label]) => (
                          <div key={k} className="rounded-lg bg-td-purple/[0.03] p-3">
                            <dt className="text-xs font-semibold text-td-purple">{label}</dt>
                            <dd className="mt-0.5 whitespace-pre-wrap text-sm text-td-dark">{String((onboarding as Record<string, unknown>)[k])}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle>Client files</SectionTitle>
            {files.length === 0 ? (
              <p className="text-sm italic text-gray-400">No files uploaded.</p>
            ) : (
              <ul className="space-y-2">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between rounded-lg border border-td-purple/10 p-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-td-accent" />
                      <span className="truncate text-sm text-td-dark">{f.file_name}</span>
                    </span>
                    {f.view_link && (
                      <a href={f.view_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent">
                        Open <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <MilestonesPanel projectId={project.id} milestones={milestones} />
          </Card>
        </div>
      </div>
    </div>
  );
}
