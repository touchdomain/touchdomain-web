import type { Metadata } from 'next';
import LegalDoc from '../../components/LegalDoc';
import { getLegalDoc, type LegalDoc as LegalDocType } from '../../data/legal';

const doc = getLegalDoc('terms') as LegalDocType;

export const metadata: Metadata = {
  title: `${doc.title} | Touch Domain`,
  description: doc.description,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return <LegalDoc slug="terms" />;
}
