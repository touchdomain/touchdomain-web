import type { Metadata } from 'next';
import ServicesClient from './ServicesClient';

export const metadata: Metadata = {
  title: 'Services & Packages | Branding, Web Design, Hosting & Apps',
  description: "Explore Touch Domain's packages for brand identity, web design, digital content, hosting, email, and custom app development — pick a package or customise your own.",
  alternates: {
    canonical: '/services',
  },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
