'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Check, Loader2, ShieldAlert } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { saveOnboardingProgress, submitOnboarding, type OnboardingInput } from '@/lib/actions/onboarding';
import { Card, SectionTitle, inputClass, btnPrimary } from '@/components/portal/ui';
import type { ProjectOnboarding } from '@/lib/database.types';

type FieldKey = keyof OnboardingInput;

interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder: string;
  rows?: number;
}

const SECTIONS: { title: string; fields: FieldDef[]; note?: string }[] = [
  {
    title: '1. Business Overview',
    fields: [
      { key: 'business_name', label: 'Business / trading name', placeholder: 'e.g. Acme Trading', rows: 1 },
      { key: 'primary_goal', label: 'The single most important goal for this project', placeholder: 'What does success look like 3 months after launch?' },
      { key: 'target_audience', label: 'Who are your customers?', placeholder: 'Describe your ideal client.' },
      { key: 'unique_value_prop', label: 'What makes you different from competitors?', placeholder: 'Your edge, in your own words.' },
      { key: 'competitors', label: 'Competitors or businesses you admire', placeholder: 'Names or links — what you like about them.' },
    ],
  },
  {
    title: '2. Brand',
    fields: [
      { key: 'brand_vibe', label: 'Brand personality / vibe', placeholder: 'e.g. warm and approachable, bold and premium…' },
      { key: 'brand_colors', label: 'Existing brand colours (if any)', placeholder: 'Hex codes or a description.', rows: 2 },
      { key: 'brand_fonts', label: 'Existing brand fonts (if any)', placeholder: 'Font names, or a link to your brand guide.', rows: 2 },
    ],
  },
  {
    title: '3. Content',
    fields: [
      { key: 'content_strategy', label: 'What content do you already have?', placeholder: 'Copy, photos, videos, testimonials…' },
      { key: 'copywriting_status', label: 'Website copy — who writes it?', placeholder: 'You’ll supply it / you want us to write it / a mix.', rows: 2 },
      { key: 'photography_status', label: 'Photography', placeholder: 'You have your own / need stock / need a shoot.', rows: 2 },
      { key: 'primary_cta', label: 'Main call-to-action for visitors', placeholder: 'e.g. “Book a call”, “Get a quote”, “Shop now”.', rows: 1 },
    ],
  },
  {
    title: '4. Technical & Access',
    note: 'Never paste passwords or API keys here. Share them as a one-time secret link (e.g. onetimesecret.com) in the field at the bottom of this section.',
    fields: [
      { key: 'domain_status', label: 'Domain name', placeholder: 'Registered with whom? Do you have access?' },
      { key: 'tech_infrastructure', label: 'Existing hosting / infrastructure', placeholder: 'Current host, platform, anything we must work around.' },
      { key: 'third_party_integrations', label: 'Third-party tools to connect', placeholder: 'CRM, payment gateway, email marketing, booking…' },
    ],
  },
  {
    title: '5. Design & Features',
    fields: [
      { key: 'design_likes', label: 'Websites / designs you like', placeholder: 'Links + what specifically you like.' },
      { key: 'design_dislikes', label: 'Anything you definitely don’t want', placeholder: 'Styles, layouts, or references to avoid.' },
      { key: 'must_have_features', label: 'Must-have features', placeholder: 'Booking, e-commerce, client login, blog…' },
    ],
  },
];

const EMPTY: Record<FieldKey, string> = SECTIONS.flatMap((s) => s.fields).reduce(
  (acc, f) => ({ ...acc, [f.key]: '' }),
  {} as Record<FieldKey, string>
);

export default function OnboardingForm({ initial }: { initial: ProjectOnboarding | null }) {
  const [form, setForm] = useState<Record<FieldKey, string>>(() => {
    const seeded = { ...EMPTY };
    if (initial) {
      for (const key of Object.keys(EMPTY) as FieldKey[]) {
        const v = initial[key as keyof ProjectOnboarding];
        if (typeof v === 'string') seeded[key] = v;
      }
    }
    return seeded;
  });
  const [secret, setSecret] = useState(initial?.secure_credential_links ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const alreadySubmitted = initial?.status === 'submitted' || initial?.status === 'reviewed';

  const debounced = useDebounce({ ...form, secure_credential_links: secret }, 900);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    (async () => {
      setStatus('saving');
      const res = await saveOnboardingProgress(debounced as OnboardingInput);
      if (res.success) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2500);
      } else {
        setStatus('error');
        toast.error(res.error);
      }
    })();
  }, [debounced]);

  const set = (key: FieldKey, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    // Flush any pending edits first.
    const saved = await saveOnboardingProgress({ ...form, secure_credential_links: secret } as OnboardingInput);
    if (!saved.success) {
      toast.error(saved.error);
      setSubmitting(false);
      return;
    }
    const res = await submitOnboarding();
    setSubmitting(false);
    if (res.success) toast.success('Onboarding submitted — thank you!');
    else toast.error(res.error);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-2 text-sm">
        {status === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin text-td-accent" /> <span className="text-gray-400">Saving…</span></>}
        {status === 'saved' && <><Check className="h-3.5 w-3.5 text-emerald-500" /> <span className="text-gray-400">Saved</span></>}
        {status === 'error' && <span className="text-red-500">Couldn’t save — check your connection</span>}
        {status === 'idle' && <span className="text-gray-400">Your answers save automatically as you type.</span>}
      </div>

      {SECTIONS.map((section) => (
        <Card key={section.title}>
          <SectionTitle>{section.title}</SectionTitle>
          {section.note && (
            <p className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              <ShieldAlert className="mt-px h-4 w-4 shrink-0" />
              {section.note}
            </p>
          )}
          <div className="space-y-4">
            {section.fields.map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-sm font-medium text-td-dark">{f.label}</label>
                <textarea
                  rows={f.rows ?? 3}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={`${inputClass} resize-y`}
                />
              </div>
            ))}
            {section.title.startsWith('4.') && (
              <div>
                <label className="mb-1 block text-sm font-medium text-td-dark">
                  Secure credential links <span className="font-normal text-gray-400">(one-time secret URLs only)</span>
                </label>
                <textarea
                  rows={3}
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="https://onetimesecret.com/secret/…  — one link per line"
                  className={`${inputClass} resize-y`}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      <div className="flex items-center justify-between rounded-2xl border border-td-purple/10 bg-white p-5">
        <p className="text-sm text-gray-500">
          {alreadySubmitted
            ? 'Submitted — you can still edit and it will re-save.'
            : 'Done? Submit to let the team know it’s ready to review.'}
        </p>
        <button onClick={handleSubmit} disabled={submitting} className={btnPrimary}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {alreadySubmitted ? 'Re-submit' : 'Submit onboarding'}
        </button>
      </div>
    </div>
  );
}
