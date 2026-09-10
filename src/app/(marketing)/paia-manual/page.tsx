import type { Metadata } from 'next';
import LegalDoc from '@/components/LegalDoc';
import { getLegalDoc, type LegalDoc as LegalDocType } from '@/data/legal';

const doc = getLegalDoc('paia-manual') as LegalDocType;

export const metadata: Metadata = {
  title: `${doc.title} | Touch Domain`,
  description: doc.description,
  alternates: { canonical: '/paia-manual' },
};

export default function PaiaManualPage() {
  return <LegalDoc slug="paia-manual" />;
}
