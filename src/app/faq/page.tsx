import type { Metadata } from 'next';
import FAQClient, { faqItems } from './FAQClient';

export const metadata: Metadata = {
  title: 'FAQ | Touch Domain',
  description: 'Common questions about Touch Domain\'s branding, web design, hosting, email, and app development services — answered plainly.',
  alternates: {
    canonical: '/faq',
  },
};

// FAQPage structured data — built directly from the same faqItems array the
// visible accordion renders, so this can't silently drift out of sync with
// what's actually on the page. This is what enables Google's FAQ rich
// snippets, and is exactly the kind of structured Q&A content AI search
// systems favour when picking up a site (the same reasoning behind llms.txt).
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      <FAQClient />
    </>
  );
}