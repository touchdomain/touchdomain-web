import type { Metadata } from 'next';
import WorkClient from './WorkClient';

export const metadata: Metadata = {
  title: 'Our Portfolio | Touch Domain Case Studies',
  description: 'See real projects Touch Domain has delivered for South African businesses — from brand identity to fully custom websites.',
  alternates: {
    canonical: '/work',
  },
};

export default function PortfolioPage() {
  return <WorkClient />;
}
