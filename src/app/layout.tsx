import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import PageLoader from '../components/PageLoader';
// @ts-ignore: side-effect import for global styles
import "./globals.css";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

// This replaces the Google Fonts link in your HTML
const roboto = Roboto({ 
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900']
});

const SITE_URL = "https://www.touchdomain.co.za";
const SITE_TITLE = "Touch Domain | Crafting Brands. Engineering Digital Experiences.";
const SITE_DESCRIPTION = "Touch Domain specializes in crafting brands and engineering digital experiences that drive impactful online success.";

export const metadata: Metadata = {
  // metadataBase lets every relative URL below (og:image, canonical, etc.)
  // resolve correctly without hardcoding the domain in each one.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // Every page currently shares this same title/description — the pages
  // themselves are Client Components ('use client'), which Next.js does not
  // allow to export their own metadata. Giving each page a genuinely unique
  // title/description needs those pages restructured into a thin Server
  // Component wrapper around the existing client content — a real, separate
  // piece of work, not something folded into this file.
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
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
  icons: {
    icon: [
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon/favicon.ico',
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
};

// LocalBusiness / ProfessionalService structured data — helps Google
// understand what Touch Domain actually is (a South African digital
// studio), independent of whatever page someone lands on first.
// NOTE: address is deliberately omitted rather than guessed — add your real
// registered business address here once you're ready to include it; that
// would meaningfully strengthen local search relevance beyond what this
// covers today.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Touch Domain",
  "description": SITE_DESCRIPTION,
  "url": SITE_URL,
  "telephone": "+27813276153",
  "email": "info@touchdomain.co.za",
  "areaServed": "South Africa",
  "sameAs": [
    "https://web.facebook.com/profile.php?id=61592261381746",
    "https://www.instagram.com/touchdomain/",
    "https://www.linkedin.com/company/touchdomain/",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* FontAwesome kit removed — every icon site-wide now uses the inline
            SVG Icon component (src/components/Icon.tsx) instead. FontAwesome's
            icon glyphs were failing to render everywhere with no explainable
            cause even under forced overrides; this script was pure dead
            weight downloading for zero visual benefit once the migration
            was complete. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={roboto.className}>
        <PageLoader />
        <Navigation />
        
        {/* 'children' represents whatever page is currently active (e.g., page.tsx or quote/page.tsx) */}
        <div className="min-h-screen">
          {children}
        </div>
        
        <Footer />
        
      </body>
    </html>
  );
}