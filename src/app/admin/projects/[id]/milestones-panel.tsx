'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { setMilestoneComplete, addMilestone, deleteMilestone } from '@/lib/actions/projects';
import { SectionTitle, inputClass, btnSecondary } from '@/components/portal/ui';
import type { Milestone } from '@/lib/database.types';

export default function MilestonesPanel({ projectId, milestones }: { projectId: string; milestones: Milestone[] }) {
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');

  const toggle = (m: Milestone) => {
    start(async () => {
      const res = await setMilestoneComplete(m.id, !m.is_completed);
      if (!res.success) toast.error(res.error);
    });
  };

  const remove = (id: string) => {
    start(async () => {
      const res = await deleteMilestone(id);
      if (!res.success) toast.error(res.error);
    });
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    start(async () => {
      const res = await addMilestone(projectId, title.trim(), due || undefined);
      if (res.success) { setTitle(''); setDue(''); setAdding(false); }
      else toast.error(res.error);
    });
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle className="mb-0">Milestones</SectionTitle>
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-td-accent" />}
      </div>

      <div className="space-y-2">
        {milestones.map((m) => (
          <div key={m.id} className="group flex items-start gap-3 rounded-xl border border-td-purple/10 bg-white p-3">
            <input
              type="checkbox"
              checked={m.is_completed}
              onChange={() => toggle(m)}
              disabled={pending}
              className="mt-0.5 h-4 w-4 rounded border-td-purple/30 text-td-purple focus:ring-td-accent"
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${m.is_completed ? 'text-gray-400 line-through' : 'text-td-dark'}`}>{m.title}</p>
              {m.due_date && <p className="text-xs text-gray-400">Due {new Date(m.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</p>}
            </div>
            <button onClick={() => remove(m.id)} disabled={pending} className="text-gray-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {milestones.length === 0 && <p className="text-sm italic text-gray-400">No milestones yet.</p>}
      </div>

      {adding ? (
        <form onSubmit={add} className="mt-3 space-y-2 rounded-xl border border-td-purple/10 p-3">
          <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title" className={inputClass} />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputClass} />
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className={btnSecondary}>Add</button>
            <button type="button" onClick={() => setAdding(false)} className="text-sm text-gray-400 hover:text-td-dark">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setAdding(true)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-td-purple hover:text-td-accent">
          <Plus className="h-4 w-4" /> Add milestone
        </button>
      )}
    </div>
  );
}
