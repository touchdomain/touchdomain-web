import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Touch Domain | South African Web Design, Branding & Hosting for SMEs',
  description: 'Touch Domain is a South African digital studio building brands, websites, apps, and hosting for small and growing businesses — one team, from concept to launch and beyond.',
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return <HomeClient />;
}