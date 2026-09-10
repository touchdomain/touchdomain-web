'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, BookOpen } from 'lucide-react';
import { updateProjectPlaybooks } from '@/lib/actions/projects';
import { PLAYBOOK_LIST } from '@/lib/playbooks';
import { SectionTitle } from '@/components/portal/ui';

export default function PlaybooksControl({
  projectId,
  selected,
}: {
  projectId: string;
  selected: string[];
}) {
  const [picked, setPicked] = useState<string[]>(selected);
  const [pending, start] = useTransition();
  const dirty = JSON.stringify([...picked].sort()) !== JSON.stringify([...selected].sort());

  const toggle = (key: string) =>
    setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const save = () =>
    start(async () => {
      const res = await updateProjectPlaybooks(projectId, picked);
      if (res.success) toast.success('Playbooks updated — the client sees the matching onboarding questions.');
      else toast.error(res.error);
    });

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-td-accent" />
        <SectionTitle className="mb-0">Playbooks</SectionTitle>
      </div>
      <p className="mb-3 text-xs text-gray-400">
        Tag the products this project covers. Each adds its intake questions to the client&apos;s onboarding.
      </p>
      <div className="flex flex-wrap gap-2">
        {PLAYBOOK_LIST.map((pb) => (
          <button
            key={pb.key}
            onClick={() => toggle(pb.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              picked.includes(pb.key)
                ? 'border-td-purple bg-td-purple text-white'
                : 'border-td-purple/20 text-td-dark hover:border-td-accent'
            }`}
          >
            {pb.label}
          </button>
        ))}
      </div>
      {dirty && (
        <button
          onClick={save}
          disabled={pending}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-td-purple px-4 py-1.5 text-xs font-semibold text-white hover:bg-td-accent disabled:opacity-50"
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save playbooks
        </button>
      )}
    </div>
  );
}
