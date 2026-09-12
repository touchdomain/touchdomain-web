'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, Loader2, ShieldAlert } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { saveOnboardingProgress, submitOnboarding, type OnboardingInput } from '@/lib/actions/onboarding';
import { PLAYBOOKS, type DiscoveryAnswers } from '@/lib/playbooks';
import { EXPLAINERS, type ExplainerKey } from '@/components/portal/explainers';
import { Card, SectionTitle, inputClass, btnPrimary } from '@/components/portal/ui';
import type { ProjectOnboarding } from '@/lib/database.types';

type FieldKey = Exclude<keyof OnboardingInput, 'discovery'>;

interface FieldDef {
  key: FieldKey;
  label: string;
  placeholder: string;
  rows?: number;
  /** Small helper line under the label — plain-language explanation of any jargon. */
  help?: string;
  /** Optional small diagram rendered under the help text. */
  visual?: ExplainerKey;
}

const SECTIONS: { title: string; fields: FieldDef[]; note?: string }[] = [
  {
    title: '1. Business Overview',
    fields: [
      { key: 'business_name', label: 'Business / trading name', placeholder: 'e.g. Acme Trading', rows: 1 },
      { key: 'primary_goal', label: 'The single most important goal for this project', placeholder: 'What does success look like 3 months after launch?' },
      { key: 'target_audience', label: 'Who are your customers?', placeholder: 'Describe your ideal client.' },
      { key: 'unique_value_prop', label: 'What makes you different from competitors?', placeholder: 'Your edge, in your own words.', help: 'Why would someone choose you over the next option? No need for polish — we’ll help shape the wording later.' },
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
      { key: 'primary_cta', label: 'Main call-to-action for visitors', placeholder: 'e.g. “Book a call”, “Get a quote”, “Shop now”.', help: 'The one action you most want a visitor to take — the button most of the page should point toward.', rows: 1 },
    ],
  },
  {
    title: '4. Technical & Access',
    note: 'Never paste passwords or API keys here. Share them as a one-time secret link (e.g. onetimesecret.com) in the field at the bottom of this section.',
    fields: [
      {
        key: 'domain_status',
        label: 'Domain name',
        placeholder: 'Registered with whom? Do you have access?',
        help: 'Your domain is your web address (e.g. yourbusiness.co.za) — separate from where the site itself is hosted, see below.',
        visual: 'domain-hosting',
      },
      { key: 'tech_infrastructure', label: 'Existing hosting / infrastructure', placeholder: 'Current host, platform, anything we must work around.', help: '"Hosting" is whatever currently stores your website so it’s reachable online — leave blank if you’re starting fresh.' },
      { key: 'third_party_integrations', label: 'Third-party tools to connect', placeholder: 'CRM, payment gateway, email marketing, booking…', help: 'Any outside service or software the site needs to talk to — a CRM (customer-tracking tool), a way to take payments, an email newsletter tool, a booking calendar, etc.' },
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

export default function OnboardingForm({
  initial,
  playbooks,
}: {
  initial: ProjectOnboarding | null;
  playbooks: string[];
}) {
  const activePlaybooks = playbooks.map((k) => PLAYBOOKS[k]).filter(Boolean);

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
  const [discovery, setDiscovery] = useState<DiscoveryAnswers>(() => {
    const d = (initial?.discovery ?? {}) as DiscoveryAnswers;
    return typeof d === 'object' && d ? d : {};
  });
  const setDisc = (pb: string, q: string, v: string) =>
    setDiscovery((prev) => ({ ...prev, [pb]: { ...(prev[pb] ?? {}), [q]: v } }));

  const [secret, setSecret] = useState(initial?.secure_credential_links ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [submitting, setSubmitting] = useState(false);
  const alreadySubmitted = initial?.status === 'submitted' || initial?.status === 'reviewed';
  const router = useRouter();

  // Serialise to a stable string so useDebounce isn't fed a fresh object
  // reference on every render (which would loop forever).
  const snapshot = useMemo(
    () => JSON.stringify({ ...form, secure_credential_links: secret, discovery }),
    [form, secret, discovery]
  );
  const debouncedSnapshot = useDebounce(snapshot, 900);
  const lastSaved = useRef(snapshot); // don't re-save the value we loaded with

  useEffect(() => {
    if (alreadySubmitted) return; // locked — no autosave after submission
    if (debouncedSnapshot === lastSaved.current) return;
    const payload = JSON.parse(debouncedSnapshot) as OnboardingInput;
    let cancelled = false;
    (async () => {
      setStatus('saving');
      const res = await saveOnboardingProgress(payload);
      if (cancelled) return;
      if (res.success) {
        lastSaved.current = debouncedSnapshot;
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2500);
      } else {
        setStatus('error');
        toast.error(res.error);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedSnapshot, alreadySubmitted]);

  const set = (key: FieldKey, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    // Flush any pending edits first.
    const saved = await saveOnboardingProgress({ ...form, secure_credential_links: secret, discovery } as OnboardingInput);
    if (!saved.success) {
      toast.error(saved.error);
      setSubmitting(false);
      return;
    }
    lastSaved.current = snapshot;
    const res = await submitOnboarding();
    setSubmitting(false);
    if (res.success) {
      toast.success('Onboarding submitted — thank you!');
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {alreadySubmitted ? (
        <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Submitted{initial?.submitted_at ? ` on ${new Date(initial.submitted_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}.
            These answers are now locked. Need to change something? Email{' '}
            <a href="mailto:helper@touchdomain.co.za" className="font-semibold underline">helper@touchdomain.co.za</a> and we&apos;ll reopen it.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm">
          {status === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin text-td-accent" /> <span className="text-gray-400">Saving…</span></>}
          {status === 'saved' && <><Check className="h-3.5 w-3.5 text-emerald-500" /> <span className="text-gray-400">Saved</span></>}
          {status === 'error' && <span className="text-red-500">Couldn’t save — check your connection</span>}
          {status === 'idle' && <span className="text-gray-400">Your answers save automatically as you type.</span>}
        </div>
      )}

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
            {section.fields.map((f) => {
              const Visual = f.visual ? EXPLAINERS[f.visual] : null;
              return (
                <div key={f.key}>
                  <label className="mb-1 block text-sm font-medium text-td-dark">{f.label}</label>
                  {f.help && <p className="mb-1.5 text-xs text-gray-400">{f.help}</p>}
                  {Visual && <Visual />}
                  <textarea
                    rows={f.rows ?? 3}
                    value={form[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    disabled={alreadySubmitted}
                    className={`${inputClass} mt-1.5 resize-y disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
                  />
                </div>
              );
            })}
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
                  disabled={alreadySubmitted}
                  className={`${inputClass} resize-y disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
                />
              </div>
            )}
          </div>
        </Card>
      ))}

      {activePlaybooks.map((pb) => (
        <Card key={pb.key}>
          <SectionTitle>{pb.label} — project details</SectionTitle>
          {pb.intro && <p className="mb-4 text-xs text-gray-500">{pb.intro}</p>}
          <div className="space-y-4">
            {pb.questions.map((q) => {
              const Visual = q.visual ? EXPLAINERS[q.visual] : null;
              return (
                <div key={q.key}>
                  <label className="mb-1 block text-sm font-medium text-td-dark">{q.label}</label>
                  {q.help && <p className="mb-1 text-xs text-gray-400">{q.help}</p>}
                  {Visual && <Visual />}
                  {q.type === 'select' && q.options ? (
                    <select
                      value={discovery[pb.key]?.[q.key] ?? ''}
                      onChange={(e) => setDisc(pb.key, q.key, e.target.value)}
                      disabled={alreadySubmitted}
                      className={`${inputClass} mt-1.5 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
                    >
                      <option value="">— select —</option>
                      {q.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <textarea
                      rows={q.rows ?? 3}
                      value={discovery[pb.key]?.[q.key] ?? ''}
                      onChange={(e) => setDisc(pb.key, q.key, e.target.value)}
                      disabled={alreadySubmitted}
                      className={`${inputClass} mt-1.5 resize-y disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {!alreadySubmitted && (
        <div className="flex flex-col gap-3 rounded-2xl border border-td-purple/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <p className="text-sm text-gray-500">Done? Submit to let the team know it’s ready to review.</p>
          <button onClick={handleSubmit} disabled={submitting} className={btnPrimary}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit onboarding
          </button>
        </div>
      )}
    </div>
  );
}
