// Small visual explainers for the handful of onboarding/discovery questions
// that are genuinely hard to picture in words alone. Pure presentation, no
// state — safe to render from a server or client component.

import { Globe, Server, MonitorSmartphone, ArrowRight, Smartphone, Store } from 'lucide-react';

const box = 'flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-td-purple/15 bg-white p-3 text-center';
const iconWrap = 'rounded-full bg-td-purple/10 p-2 text-td-purple';

export function DomainHostingDiagram() {
  return (
    <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-td-purple/[0.03] p-3">
      <div className={box}>
        <span className={iconWrap}><Globe className="h-4 w-4" /></span>
        <span className="text-[11px] font-semibold text-td-dark">Domain</span>
        <span className="text-[10px] leading-tight text-gray-400">Your address, e.g. yourbusiness.co.za</span>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-td-purple/30" />
      <div className={box}>
        <span className={iconWrap}><Server className="h-4 w-4" /></span>
        <span className="text-[11px] font-semibold text-td-dark">Hosting</span>
        <span className="text-[10px] leading-tight text-gray-400">The server your site lives on</span>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-td-purple/30" />
      <div className={box}>
        <span className={iconWrap}><MonitorSmartphone className="h-4 w-4" /></span>
        <span className="text-[11px] font-semibold text-td-dark">Website</span>
        <span className="text-[10px] leading-tight text-gray-400">What a visitor actually sees</span>
      </div>
    </div>
  );
}

export function SitemapDiagram() {
  return (
    <div className="mt-2 rounded-xl bg-td-purple/[0.03] p-3">
      <div className="flex justify-center">
        <span className="rounded-lg border border-td-purple/25 bg-white px-3 py-1.5 text-[11px] font-semibold text-td-purple">Home</span>
      </div>
      <div className="mx-auto mt-1.5 h-3 w-px bg-td-purple/20" />
      <div className="flex justify-center gap-1.5">
        {['About', 'Services', 'Contact'].map((page) => (
          <span key={page} className="rounded-lg border border-td-purple/15 bg-white px-2.5 py-1 text-[10px] font-medium text-gray-500">
            {page}
          </span>
        ))}
      </div>
      <p className="mt-2 text-center text-[10px] text-gray-400">
        A sitemap is just this list of pages and how they connect — Home branching out to the rest.
      </p>
    </div>
  );
}

export function PwaVsNativeDiagram() {
  return (
    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      <div className={box}>
        <span className={iconWrap}><Smartphone className="h-4 w-4" /></span>
        <span className="text-[11px] font-semibold text-td-dark">Installable web app (PWA)</span>
        <span className="text-[10px] leading-tight text-gray-400">Adds an icon to the home screen straight from the browser — no store, no approval wait, cheaper to build</span>
      </div>
      <div className={box}>
        <span className={iconWrap}><Store className="h-4 w-4" /></span>
        <span className="text-[11px] font-semibold text-td-dark">Native app</span>
        <span className="text-[10px] leading-tight text-gray-400">Listed on the App Store / Google Play — needed for store visibility or deep device features</span>
      </div>
    </div>
  );
}

export const EXPLAINERS = {
  'domain-hosting': DomainHostingDiagram,
  sitemap: SitemapDiagram,
  'pwa-vs-native': PwaVsNativeDiagram,
} as const;

export type ExplainerKey = keyof typeof EXPLAINERS;
