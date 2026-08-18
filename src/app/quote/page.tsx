import type { Metadata } from 'next';
import QuoteClient from './QuoteClient';

export const metadata: Metadata = {
  title: 'Get a Custom Quote | Touch Domain',
  description: 'Build your own package and get an instant estimate for branding, web design, hosting, or app development with Touch Domain.',
  alternates: {
    canonical: '/quote',
  },
};

export default function QuotePage() {
  return <QuoteClient />;
}
