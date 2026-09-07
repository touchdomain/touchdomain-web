// Single source of truth for the custom quote builder (src/app/quote/QuoteClient.tsx).
//
// Every amount is in ZAR. The KEYS here must exactly match the <option> and
// checkbox `value` strings in QuoteClient — an option whose value isn't a
// key in PRICING_MAP silently prices at R0, so keep the two in sync when
// adding or renaming anything.
//
// The once-off design / branding / content items are calibrated against the
// fixed packages on /services: rebuilding a package's core contents à la
// carte (with the +10% markup, see itemPrice) lands roughly 10–25% above
// the package price, so a package is always the better deal. Hosting, email
// and the app tiers are copied verbatim from /services. Prices are kept
// deliberately modest for the SME market.

export const PRICING_MAP: Record<string, number> = {
  // Web selects
  'Informational': 4500, 'E-commerce Store': 9000, 'Portfolio/Personal': 3800, 'Blog/Content Hub': 5000,
  'Up to 5 Pages': 1500, '6-10 Pages': 3000, '11-20 Pages': 5500, '20+ Pages': 8000,
  'Yes': 1200, // Copywriting
  'Yes, I need stock images': 600,

  // Web checkboxes
  'Website Security': 600, 'On-Page Optimization': 1300, 'Advanced SEO': 2200, 'Payment Gateway': 1800, 'Booking System': 2000,
  'User Account Functionality': 2500, 'Custom Functionality': 2800, 'CRM System': 3200,

  // Brand selects
  '2 Initial Concepts': 1700, '3 Initial Concepts': 2600,
  '2 Platforms': 500, '4 Platforms': 900,
  '5 Custom Icons': 600, '10 Custom Icons': 1100, '15 Custom Icons': 1500,
  'Social Post Template': 450, 'Digital Ad Banner Template': 500, 'Email Marketing Template': 650,
  'Master Slide Template': 700, '5-10 Slide Template': 1400, '10-20 Slide Template': 2200,

  // Brand checkboxes
  'Logo Variations': 450, 'Color Palette Definition': 400, 'Typography Selection': 400, 'Basic Brand Board': 550,
  'Letterhead Design': 450, 'Brand Voice': 900, 'Graphic Patterns': 550, 'Email Signature Design': 300,

  // Digital selects
  '5 Custom Designs': 1800, '10 Custom Designs': 3200, '20 Custom Designs': 5800,
  '2 Short-Form GIFs': 800, '5 Short-Form GIFs': 1700, '10 Short-Form GIFs': 3000,
  '1 Video (up to 30 seconds)': 2000, '3 Videos (up to 30 seconds each)': 4800, '5 Videos (up to 30 seconds each)': 7000,
  'Basic Infographic (Single-page)': 1300, 'Complex Infographic (Multi-section/Interactive)': 2500,
  'Captions for 5 Posts': 500, 'Captions for 10 Posts': 900, 'Captions for 20 Posts': 1600,
  '3 Ad Banner Sizes/Variations': 800, '5 Ad Banner Sizes/Variations': 1200, 'Custom Ad Banner Set': 1800,
  'Up to 60 Seconds': 3800, '60-90 Seconds': 4800, '90-120 Seconds': 6000,
  'Up to 30 Seconds Animation': 2200, '30-60 Seconds Animation': 3600, 'Custom Animation': 5000,

  // Digital checkboxes
  'Profile Image Optimization': 300, 'Newsletter Header Design': 500, 'Animated Logo Reveal': 1400,

  // Ongoing support — recurring monthly
  'Care Plan — Basic': 800, 'Care Plan — Growth': 1525, 'Care Plan — Scale': 2368,
  'Monthly Content Retainer': 1325, 'Monthly SEO Retainer': 2658,

  // Website hosting — recurring monthly
  'Hosting — Foundation': 89, 'Hosting — Growth': 159, 'Hosting — Priority': 249,
  // Email-only — recurring monthly, an alternative to a full hosting tier
  'Email — Starter': 35, 'Email — Team': 65, 'Email — Business': 99,

  // App development — a once-off cost, but quoted "from" (real scope varies
  // too much for a fixed number) and shown as its own subtotal rather than
  // folded into the design/branding/content project total.
  'App Essentials': 14500, 'App Growth': 32000, 'App Priority': 55000,
};

// Look up a base price by option value; unknown / empty keys price at 0.
export const priceOf = (key: string | undefined | null): number =>
  (key && PRICING_MAP[key]) || 0;

// Hosting and email-only tiers are mutually exclusive with each other as
// well as within themselves — every hosting tier already bundles email
// accounts, so a separate email plan on top is redundant.
export const HOSTING_TIERS = ['Hosting — Foundation', 'Hosting — Growth', 'Hosting — Priority'];
export const EMAIL_TIERS = ['Email — Starter', 'Email — Team', 'Email — Business'];

// App tiers — pulled out of the once-off project total and shown on their
// own line.
export const APP_TIERS = ['App Essentials', 'App Growth', 'App Priority'];

// Care plans are cumulative tiers ("Growth = Basic + …", "Scale = Growth + …"),
// so only one applies at a time. Each higher tier already contains one or
// more of the standalone monthly retainers; selecting it therefore removes
// (and disables) the retainer it already covers so the estimate can't
// double-count.
export const CARE_PLANS = ['Care Plan — Basic', 'Care Plan — Growth', 'Care Plan — Scale'];
export const RETAINER_INCLUDES: Record<string, string[]> = {
  'Care Plan — Growth': ['Monthly Content Retainer'],
  'Care Plan — Scale': ['Monthly Content Retainer', 'Monthly SEO Retainer'],
};

// À-la-carte markup. Picking individual design / branding / content pieces
// costs more than committing to a package that bundles the same scope, so
// each once-off item in the quote builder is priced at base + this markup.
// The app tiers and every monthly recurring plan (hosting, email, care
// plans, standalone retainers) are exempt — they aren't sold inside a
// package to begin with, so there's no bundle discount to claw back.
export const A_LA_CARTE_MARKUP = 0.1; // 10%

const MARKUP_EXEMPT = new Set<string>([
  ...APP_TIERS,
  ...HOSTING_TIERS,
  ...EMAIL_TIERS,
  ...CARE_PLANS,
  'Monthly Content Retainer',
  'Monthly SEO Retainer',
]);

// Price of a single once-off item as sold à la carte in the quote builder:
// base price plus the markup, rounded to the nearest R10 to keep estimates
// tidy. Exempt items and unknown keys return their base price unchanged.
export const itemPrice = (key: string | undefined | null): number => {
  const base = priceOf(key);
  if (!base || (key && MARKUP_EXEMPT.has(key))) return base;
  return Math.round((base * (1 + A_LA_CARTE_MARKUP)) / 10) * 10;
};

// Pure reducer for the Ongoing Support checkbox group. Selecting a care plan
// replaces any other care plan (they're cumulative tiers) and removes the
// standalone monthly retainer(s) that plan already bundles, so the monthly
// estimate can't double-count.
export function applyRetainerToggle(current: string[], value: string, checked: boolean): string[] {
  if (!checked) return current.filter(f => f !== value);

  let next = [...current, value];
  if (CARE_PLANS.includes(value)) {
    const bundled = RETAINER_INCLUDES[value] ?? [];
    next = next.filter(f => f === value || (!CARE_PLANS.includes(f) && !bundled.includes(f)));
  }
  return next;
}
