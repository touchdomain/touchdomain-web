'use client';

import { useState } from 'react';
import { ClipboardList, FileSignature, FolderOpen, Receipt, X } from 'lucide-react';
import { dismissPortalIntro } from '@/lib/actions/portal';
import { btnPrimary } from './ui';

const STEPS = [
  {
    icon: ClipboardList,
    title: 'Start with onboarding',
    body: "The Onboarding questionnaire tells us about your business, brand, and goals — the more you fill in, the less back-and-forth we need before work starts. You can save and come back any time before submitting.",
  },
  {
    icon: FileSignature,
    title: 'Contracts',
    body: 'Agreements land under Contracts for you to review and sign right in the portal. Once countersigned, the final signed copy stays there for you to download any time.',
  },
  {
    icon: FolderOpen,
    title: 'Files',
    body: "Deliverables, drafts, and anything we upload for you — logos, designs, documents — show up under Files as the project progresses.",
  },
  {
    icon: Receipt,
    title: 'Invoices',
    body: "Invoices appear under Invoices as they're issued. Paid by EFT or ATM deposit? Upload the slip against the invoice right there and we'll confirm it — no need to email it separately.",
  },
];

export default function PortalIntro({ show }: { show: boolean }) {
  const [open, setOpen] = useState(show);
  const [dismissing, setDismissing] = useState(false);

  if (!open) return null;

  const close = async () => {
    setOpen(false);
    setDismissing(true);
    await dismissPortalIntro();
    setDismissing(false);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={close}
          disabled={dismissing}
          aria-label="Close"
          className="absolute right-4 top-4 text-gray-300 transition-colors hover:text-td-purple disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 text-xl font-bold text-td-dark">Welcome to your Touch Domain portal</h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Here&apos;s where everything for your project lives, and how to get started.
        </p>

        <div className="mt-6 space-y-5">
          {STEPS.map((step) => (
            <div key={step.title} className="flex gap-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-td-purple/8">
                <step.icon className="h-5 w-5 text-td-purple" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-td-dark">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-500">{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Questions any time? Email{' '}
          <a href="mailto:helper@touchdomain.co.za" className="text-td-accent hover:underline">
            helper@touchdomain.co.za
          </a>
          .
        </p>

        <button onClick={close} disabled={dismissing} className={`${btnPrimary} mt-6 w-full`}>
          Let&apos;s get started
        </button>
      </div>
    </div>
  );
}
