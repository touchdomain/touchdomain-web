import type { Metadata } from 'next';
import AboutClient from './AboutClient';

export const metadata: Metadata = {
  title: 'About Touch Domain | Our Story, Mission & Values',
  description: "Meet Touch Domain — a South African digital studio built on client-centric collaboration, technical excellence, and a real plan for what comes after launch.",
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
