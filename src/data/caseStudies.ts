// Add real projects here as you complete them. Each entry renders as a card
// on the Portfolio page with a Challenge → Approach → Result structure —
// this is what actually converts visitors, far more than a polished image
// alone. Always get the client's sign-off before publishing project details
// (the /review page collects this consent automatically).
//
// IMPORTANT: the two entries below are placeholders showing the intended
// structure — replace them with real projects before launch. Do not publish
// fabricated client names, problems, or results; an empty portfolio is more
// trustworthy than a fake one.

export interface CaseStudy {
  slug: string;
  clientName: string;      // Business name (or "Confidential" if not approved for disclosure)
  category: string;        // e.g. "Branding", "Web Design", "Digital Content"
  image: string;           // Path under /public
  challenge: string;       // What problem did the client come to you with?
  approach: string;        // What did you actually do about it?
  result: string;          // What changed for them? Specifics beat adjectives.
  liveUrl?: string;        // Link to the live site/deliverable, if public
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'thatanyane-lokaleng-farming-livestock',
    clientName: 'Thatanyane Lokaleng Farming & Livestock',
    category: 'Web Design',
    image: '/portfolio/thatanyane-lokaleng.png',
    challenge: 'Established in 2025 in Lokaleng Village, Taung, this farming and livestock enterprise offered a genuinely diverse portfolio — wheat, corn, and pecan nuts alongside cattle, sheep, and goats — but relied entirely on traditional outreach. With no digital presence, they had no way to establish credibility with B2B trading partners or reflect their mission of sustainable, community-driven farming.',
    approach: 'We architected a fast, localized informational site on Next.js: translating their values of stewardship and community empowerment into clear digital copy, structuring an always-on catalog to replace static brochures, and implementing local SEO so the farm surfaces when Taung and North West distributors search for agricultural suppliers.',
    result: 'A polished, authoritative digital footprint that positions the farm as a serious regional enterprise rather than just a local producer — centralizing contact details into a direct pipeline for trading inquiries and giving investors and distributors real proof of operational scale.',
    liveUrl: 'https://thatanyanefarming.co.za/', // Add the live URL once you share it — the "Visit Website" button on the card links here.
  },
  {
    slug: 'placeholder-project-two',
    clientName: '[Add your second client/project name]',
    category: 'Branding',
    image: '/branding/work.png',
    challenge: '[Replace with a real project once you have one.]',
    approach: '[Replace with a real project once you have one.]',
    result: '[Replace with a real project once you have one.]',
    liveUrl: '',
  },
];