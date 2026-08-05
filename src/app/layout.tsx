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

export const metadata: Metadata = {
  title: "Touch Domain | Crafting Brands. Engineering Digital Experiences.",
  description: "Touch Domain specializes in crafting brands and engineering digital experiences that drive impactful online success.",
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
      <head>
        {/* If you are keeping FontAwesome, you can drop the CDN link here */}
        <script src="https://kit.fontawesome.com/76e3c9c22e.js" crossOrigin="anonymous" defer></script>
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