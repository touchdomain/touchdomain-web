'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Loader2, Unlock } from 'lucide-react';
import { reopenOnboarding } from '@/lib/actions/projects';

export default function OnboardingReopen({ clientId }: { clientId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() =>
        start(async () => {
          const res = await reopenOnboarding(clientId);
          if (res.success) toast.success('Onboarding reopened for the client.');
          else toast.error(res.error);
        })
      }
      disabled={pending}
      className="inline-flex items-center gap-1 text-xs font-semibold text-td-purple hover:text-td-accent"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
      Reopen for editing
    </button>
  );
}
