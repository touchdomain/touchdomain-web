// Single source of truth for the custom quote builder (src/app/quote/QuoteClient.tsx).
//
// Every amount is in ZAR. The KEYS here must exactly match the <option> and
// checkbox `value` strings in QuoteClient — an option whose value isn't a
// key in PRICING_MAP silently prices at R0, so keep the two in sync when
// adding or renaming anything.

export const PRICING_MAP: Record<string, number> = {
  // Web selects
  'Informational': 2500, 'E-commerce Store': 8500, 'Portfolio/Personal': 2000, 'Blog/Content Hub': 3500,
  'Up to 5 Pages': 1000, '6-10 Pages': 2000, '11-20 Pages': 3500, '20+ Pages': 5000,
  'Yes': 1500, // Copywriting
  'Yes, I need stock images': 800,

  // Web checkboxes
  'Website Security': 500, 'On-Page Optimization': 1200, 'Advanced SEO': 2500, 'Payment Gateway': 1500, 'Booking System': 1800,
  'User Account Functionality': 2500, 'Custom Functionality': 3000, 'CRM System': 4000,

  // Brand selects
  '2 Initial Concepts': 1500, '3 Initial Concepts': 2200,
  '2 Platforms': 800, '4 Platforms': 1400,
  '5 Custom Icons': 600, '10 Custom Icons': 1000, '15 Custom Icons': 1400,
  'Social Post Template': 500, 'Digital Ad Banner Template': 600, 'Email Marketing Template': 800,
  'Master Slide Template': 800, '5-10 Slide Template': 1500, '10-20 Slide Template': 2500,

  // Brand checkboxes
  'Logo Variations': 500, 'Color Palette Definition': 400, 'Typography Selection': 400, 'Basic Brand Board': 800,
  'Letterhead Design': 400, 'Brand Voice': 1200, 'Graphic Patterns': 600, 'Email Signature Design': 300,

  // Digital selects
  '5 Custom Designs': 1200, '10 Custom Designs': 2200, '20 Custom Designs': 4000,
  '2 Short-Form GIFs': 800, '5 Short-Form GIFs': 1800, '10 Short-Form GIFs': 3200,
  '1 Video (up to 30 seconds)': 1500, '3 Videos (up to 30 seconds each)': 4000, '5 Videos (up to 30 seconds each)': 6000,
  'Basic Infographic (Single-page)': 1200, 'Complex Infographic (Multi-section/Interactive)': 2500,
  'Captions for 5 Posts': 500, 'Captions for 10 Posts': 900, 'Captions for 20 Posts': 1600,
  '3 Ad Banner Sizes/Variations': 900, '5 Ad Banner Sizes/Variations': 1400, 'Custom Ad Banner Set': 2000,
  'Up to 60 Seconds': 3500, '60-90 Seconds': 4500, '90-120 Seconds': 5500,
  'Up to 30 Seconds Animation': 2000, '30-60 Seconds Animation': 3500, 'Custom Animation': 5000,

  // Digital checkboxes
  'Profile Image Optimization': 300, 'Newsletter Header Design': 500, 'Animated Logo Reveal': 1500,

  // Ongoing support — recurring monthly
  'Care Plan — Basic': 1800, 'Care Plan — Growth': 3500, 'Care Plan — Scale': 6500,
  'Monthly Content Retainer': 2800, 'Monthly SEO Retainer': 3200,

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
