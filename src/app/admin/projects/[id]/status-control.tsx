'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { updateProjectStatus } from '@/lib/actions/projects';
import type { ProjectStatus } from '@/lib/database.types';

const OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'discovery', label: 'Discovery' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
];

export default function StatusControl({ projectId, status }: { projectId: string; status: ProjectStatus }) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const res = await updateProjectStatus(projectId, e.target.value as ProjectStatus);
          if (!res.success) toast.error(res.error);
        })
      }
      className="rounded-lg border border-td-purple/15 bg-white px-3 py-1.5 text-xs font-semibold text-td-purple outline-none focus:border-td-accent"
    >
      {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
