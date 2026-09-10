import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster } from "sonner";
// @ts-ignore: side-effect import for global styles
import "./globals.css";

// Self-hosted by next/font — the single source of Roboto for the site.
// Applied via roboto.className on <body>, which cascades to everything.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ['100', '300', '400', '500', '700', '900'],
});

const SITE_URL = "https://www.touchdomain.co.za";

// Root metadata is intentionally minimal + noindex. The marketing route
// group ((marketing)/layout.tsx) re-opens indexing and supplies the real
// SEO copy; the portal (admin/dashboard/login) stays out of search.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Touch Domain",
    template: "%s | Touch Domain",
  },
  robots: { index: false, follow: false },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { fontFamily: 'inherit' },
            classNames: {
              toast: 'rounded-[14px] border border-td-purple/15',
            },
          }}
        />
      </body>
    </html>
  );
}
