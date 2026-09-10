// Product playbooks -> client discovery questions shown in onboarding.
//
// Each project is tagged (projects.playbooks) with the keys that apply; the
// onboarding questionnaire then renders the matching sections and stores the
// answers in project_onboarding.discovery as:
//   { "<playbookKey>": { "<questionKey>": "answer", ... }, ... }
//
// The Web Design set is taken from the Web Design Playbook's "Web Discovery
// — Client Intake Questionnaire". Fill the other playbooks from their own
// intake sections — the structure is the same.

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
    intro: 'Questions specific to your brand work.',
    questions: [
      { key: '_placeholder', label: 'Add your Brand Identity intake questions in src/lib/playbooks.ts', help: 'Copy them from the Brand Identity Playbook.' },
    ],
  },

  digital_content: {
    key: 'digital_content',
    label: 'Digital Content',
    intro: 'Questions specific to your content work.',
    questions: [
      { key: '_placeholder', label: 'Add your Digital Content intake questions in src/lib/playbooks.ts', help: 'Copy them from the Digital Content Playbook.' },
    ],
  },

  app_development: {
    key: 'app_development',
    label: 'App Development',
    intro: 'Questions specific to your app build.',
    questions: [
      { key: '_placeholder', label: 'Add your App Development intake questions in src/lib/playbooks.ts', help: 'Copy them from the App Development Playbook.' },
    ],
  },

  hosting: {
    key: 'hosting',
    label: 'Hosting & Email',
    intro: 'Questions specific to hosting and email setup.',
    questions: [
      { key: '_placeholder', label: 'Add your Hosting intake questions in src/lib/playbooks.ts', help: 'Copy them from the Website Hosting Playbook.' },
    ],
  },
};

export const PLAYBOOK_LIST = Object.values(PLAYBOOKS);

export function playbookLabel(key: string): string {
  return PLAYBOOKS[key]?.label ?? key;
}

export type DiscoveryAnswers = Record<string, Record<string, string>>;
