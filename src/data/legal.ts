// Typed facade over legal.mjs. Pages and components import from here;
// scripts/generate-legal-pdfs.mjs imports legal.mjs directly (it runs under
// plain Node). The content itself lives in the .mjs so both can share it.

// @ts-ignore — plain data module, no type declarations of its own
export { LEGAL_DOCS, getLegalDoc } from './legal.mjs';

export type LegalBlock =
  | { h: string }
  | { sh: string }
  | { p: string }
  | { ul: string[] }
  | { kv: [string, string][] };

export interface LegalDoc {
  slug: string;
  navLabel: string;
  title: string;
  subtitle: string;
  description: string;
  effectiveDate: string;
  pdf: string;
  blocks: LegalBlock[];
}
