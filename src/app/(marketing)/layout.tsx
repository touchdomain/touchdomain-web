import type { Metadata } from "next";
import Script from "next/script";
import PageLoader from "@/components/PageLoader";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SITE_URL = "https://www.touchdomain.co.za";
const SITE_TITLE = "Touch Domain | Crafting Brands. Engineering Digital Experiences.";
const SITE_DESCRIPTION =
  "Touch Domain specializes in crafting brands and engineering digital experiences that drive impactful online success.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Touch Domain",
    images: [
      {
        url: "/branding/og-image.png",
        width: 1200,
        height: 630,
        alt: "Touch Domain — South African Digital Studio for SMEs",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/branding/og-image.png"],
  },
};

// LocalBusiness / ProfessionalService structured data. Registered address
// matches the legal documents (src/data/legal.mjs).
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Touch Domain",
  "legalName": "TOUCHDOMAIN (Pty) Ltd",
  "description": SITE_DESCRIPTION,
  "url": SITE_URL,
  "telephone": "+27813276153",
  "email": "info@touchdomain.co.za",
  "areaServed": "South Africa",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "96 Makgathe Street, Ipelegeng",
    "addressLocality": "Schweizer-Reneke",
    "postalCode": "2780",
    "addressRegion": "North West",
    "addressCountry": "ZA",
  },
  "sameAs": [
    "https://web.facebook.com/profile.php?id=61592261381746",
    "https://www.instagram.com/touchdomain/",
    "https://www.linkedin.com/company/touchdomain/",
  ],
};

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* FontAwesome kit — afterInteractive so its <i>→<svg> rewrite runs
          after hydration. Portal routes use lucide-react instead. */}
      <Script src="https://kit.fontawesome.com/76e3c9c22e.js" crossOrigin="anonymous" />
      <PageLoader />
      <Navigation />
      <div className="min-h-screen">{children}</div>
      <Footer />
    </>
  );
}
