// Product playbooks -> client discovery questions shown in onboarding.
//
// Each project is tagged (projects.playbooks) with the keys that apply; the
// onboarding questionnaire then renders the matching sections and stores the
// answers in project_onboarding.discovery as:
//   { "<playbookKey>": { "<questionKey>": "answer", ... }, ... }
//
// Questions are lifted from the "Client Intake Questionnaire" table in each
// playbook (Web / Brand / Content / App) or distilled from the Hosting &
// Ongoing Support playbook. Reworded slightly to address the client directly.

export interface PlaybookQuestion {
  key: string;
  label: string;
  /** Small helper line under the label. */
  help?: string;
  type?: 'text' | 'select';
  options?: string[];
  rows?: number;
}

export interface Playbook {
  key: string;
  label: string;
  intro?: string;
  questions: PlaybookQuestion[];
}

export const PLAYBOOKS: Record<string, Playbook> = {
  web_design: {
    key: 'web_design',
    label: 'Web Design',
    intro:
      'A few questions specific to your website build. The more detail here, the smoother the design phase — missing answers are the main cause of delays mid-build.',
    questions: [
      { key: 'business_goal', label: 'What should this website achieve?', help: 'Leads, sales, bookings, information — what does success look like?' },
      { key: 'website_type', label: 'Website type', type: 'select', options: ['Informational', 'E-commerce Store', 'Portfolio / Personal', 'Blog / Content Hub'], rows: 1 },
      { key: 'audience', label: 'Who is the primary visitor, and what device do they mostly browse on?' },
      { key: 'content_readiness', label: 'Do you have copy and images ready, or do you need us to write copy / source stock images?' },
      { key: 'sitemap', label: 'What pages are must-haves vs nice-to-haves?', help: 'This confirms the page-count tier.' },
      { key: 'functionality', label: 'Any of: payments, bookings, user accounts, custom functionality, CRM integration?' },
      { key: 'competitors', label: '2–3 competitor sites — what do you like and dislike about them?' },
      { key: 'existing_brand', label: 'Do you have an existing logo, colour palette, or brand guide?' },
      { key: 'domain_hosting', label: 'Do you have a domain already? Are you taking a Touch Domain hosting plan?' },
      { key: 'timeline', label: 'Any hard launch date?', help: 'Event, campaign, financial year-end…' },
      { key: 'decision_maker', label: 'Who signs off on design and copy — one person, or a committee?', rows: 1 },
    ],
  },

  brand_identity: {
    key: 'brand_identity',
    label: 'Brand Identity',
    intro: 'A completed brief here removes most revision cycles later — take your time on the personality and inspiration questions.',
    questions: [
      { key: 'business_overview', label: 'What does the business do, and what does it want to be known for in 3 years?' },
      { key: 'audience', label: 'Who is the primary customer?', help: 'Age range, income band, where they spend time online.' },
      { key: 'competitors', label: '3 direct competitors — what do you like and dislike about their branding?' },
      { key: 'personality', label: 'Pick 3 adjectives the brand should feel like', help: 'e.g. bold, trustworthy, playful.', rows: 1 },
      { key: 'existing_assets', label: 'Any existing logo, colours, or fonts that must be kept, or retired?' },
      { key: 'colour_direction', label: 'Colours to use / colours to avoid. Any industry or cultural constraints?' },
      { key: 'usage_context', label: 'Where will this brand appear first — website, signage, uniforms, packaging?' },
      { key: 'inspiration', label: '3 reference brands (any industry) whose visual identity you admire.' },
      { key: 'non_negotiables', label: 'Anything you explicitly do not want.' },
      { key: 'decision_maker', label: 'Who signs off — a single person or a committee?', rows: 1 },
    ],
  },

  digital_content: {
    key: 'digital_content',
    label: 'Digital Content',
    intro: 'Run through this before we start production, even for a small batch.',
    questions: [
      { key: 'purpose', label: 'What is this content for — a campaign, always-on social presence, a launch, ads?' },
      { key: 'platforms', label: 'Where will this content be published?', help: 'Confirms the sizes and formats we produce.' },
      { key: 'quantities', label: 'Confirm the exact counts you need for each content type.' },
      { key: 'messaging', label: 'Key messages or offers that must appear across the batch.' },
      { key: 'brand_assets', label: 'Is there a brand board / brand guide on file for your business?' },
      { key: 'content_themes', label: 'Any recurring themes, campaigns, or content pillars to plan around?' },
      { key: 'reference_examples', label: 'Any content (yours or a competitor’s) you want used as a quality benchmark.' },
      { key: 'review_process', label: 'Who reviews and approves before content goes live — one person or several?', rows: 1 },
      { key: 'deadline', label: 'Any hard publish dates?', help: 'Campaign launch, event, seasonal tie-in.' },
    ],
  },

  app_development: {
    key: 'app_development',
    label: 'App Development',
    intro:
      'These answers set the scope and the price. Be as concrete as you can — vague requirements here are the main cause of scope creep.',
    questions: [
      { key: 'core_purpose', label: 'What is the one thing this app must let a user do?' },
      { key: 'users', label: 'Who uses it — the public, staff only, or both? Roughly how many users?' },
      { key: 'platforms', label: 'Platform', type: 'select', options: ['Installable web app (PWA) only', 'Native App Store / Play Store presence', 'Not sure yet'], rows: 1 },
      { key: 'offline_needs', label: 'Does any part of the app need to work without an internet connection?', rows: 1 },
      { key: 'data_accounts', label: 'Does it need user accounts, saved data, or a database behind it?' },
      { key: 'integrations', label: 'Any third-party services it must connect to?', help: 'Payments, calendars, CRM, other APIs.' },
      { key: 'multi_user_roles', label: 'Are there different permission levels (admin vs staff vs customer)?' },
      { key: 'existing_systems', label: 'Does this need to talk to any existing software or spreadsheet-based process you use?' },
      { key: 'design_assets', label: 'Is there a brand guide / design system on file to build from?' },
      { key: 'timeline_budget', label: 'Any hard deadline, and is there a budget ceiling above the “from” price?' },
    ],
  },

  hosting: {
    key: 'hosting',
    label: 'Hosting & Email',
    intro: 'A few details so we can provision the right plan and plan any migration.',
    questions: [
      { key: 'domain', label: 'Do you already own the domain? Who is it registered with?' },
      { key: 'what_you_need', label: 'What do you need?', type: 'select', options: ['Website hosting', 'Professional email only', 'Both'], rows: 1 },
      { key: 'current_setup', label: 'Is the site currently hosted somewhere (Wix, WordPress, another host)? Is email set up already?' },
      { key: 'migration', label: 'Are we moving an existing site / mailboxes across, or starting fresh?', rows: 1 },
      { key: 'email_accounts', label: 'How many mailboxes, and what addresses do you want?', help: 'e.g. hello@yourdomain, accounts@yourdomain' },
      { key: 'access', label: 'Do you have login access to your current domain / DNS and hosting?', help: 'Share credentials via a one-time secret link in the Technical section above — never in plain text.' },
      { key: 'ongoing_support', label: 'Interested in a Care Plan (updates, backups, monitoring) or a monthly content / SEO retainer?' },
    ],
  },
};

export const PLAYBOOK_LIST = Object.values(PLAYBOOKS);

export function playbookLabel(key: string): string {
  return PLAYBOOKS[key]?.label ?? key;
}

export type DiscoveryAnswers = Record<string, Record<string, string>>;
