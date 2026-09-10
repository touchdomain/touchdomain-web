import type { Metadata } from 'next';
import LegalDoc from '@/components/LegalDoc';
import { getLegalDoc, type LegalDoc as LegalDocType } from '@/data/legal';

const doc = getLegalDoc('ecta-disclosure') as LegalDocType;

export const metadata: Metadata = {
  title: `${doc.title} | Touch Domain`,
  description: doc.description,
  alternates: { canonical: '/ecta-disclosure' },
};

export default function EctaDisclosurePage() {
  return <LegalDoc slug="ecta-disclosure" />;
}
