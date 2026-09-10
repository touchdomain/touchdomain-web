// Static package/plan catalogue for the admin contract & invoice generators.
// Fees in ZAR. Kept in sync with the public /services page and
// src/lib/pricingConfig.ts (the quote builder). Once-off unless `period` set.

export interface PackageDef {
  key: string;
  label: string;
  category: 'Brand Identity' | 'Web Design' | 'Digital Content' | 'App Development';
  fee: number;
  feeNote?: string; // e.g. "from" for open-ended tiers
  deliverables: string[];
}

export interface PlanDef {
  key: string;
  label: string;
  fee: number;
  period: '/month';
  includes: string[];
}

export const PACKAGES: Record<string, PackageDef> = {
  brand_launchpad: {
    key: 'brand_launchpad', label: 'Brand Identity — Launchpad', category: 'Brand Identity', fee: 3500,
    deliverables: ['Primary Logo Design', 'Logo Variations', 'Colour Palette Definition', 'Typography Selection', 'Basic Brand Board', 'Essential Digital Assets (2–3 platforms)'],
  },
  brand_elevate: {
    key: 'brand_elevate', label: 'Brand Identity — Elevate & Expand', category: 'Brand Identity', fee: 7500,
    deliverables: ['Everything in Launchpad', 'Comprehensive Brand Style Guide', 'Full Stationery Suite', 'Social Media Kit (profiles, covers, 3–5 templates)', 'Basic Iconography Set', 'Marketing Collateral Design'],
  },
  brand_pinnacle: {
    key: 'brand_pinnacle', label: 'Brand Identity — Pinnacle Identity', category: 'Brand Identity', fee: 14000,
    deliverables: ['Everything in Elevate & Expand', 'In-depth Brand Strategy Workshop', 'Extensive Imagery Guidelines', 'Custom Graphic Elements', 'Corporate Presentation Template', 'Brand Voice Guidelines'],
  },
  web_launchpad: {
    key: 'web_launchpad', label: 'Web Design — Digital Launchpad', category: 'Web Design', fee: 6500,
    deliverables: ['Custom Website Design (up to 5 core pages)', 'Responsive Web Development', 'Basic Content Integration', 'Initial SEO Setup', 'Contact Form Integration'],
  },
  web_accelerator: {
    key: 'web_accelerator', label: 'Web Design — Online Accelerator', category: 'Web Design', fee: 14500,
    deliverables: ['Everything in Digital Launchpad', 'Custom Website Design (10 pages)', 'Advanced UI/UX Enhancements', 'Basic E-commerce Integration', 'CMS Setup', 'Blog Section Integration'],
  },
  web_dominator: {
    key: 'web_dominator', label: 'Web Design — Digital Dominator', category: 'Web Design', fee: 28000, feeNote: 'from',
    deliverables: ['Everything in Online Accelerator', 'Custom Website Design (15+ pages)', 'Advanced E-commerce Solutions', 'API Integrations', 'Performance Optimisation', 'Advanced SEO & Post-launch Support'],
  },
  content_starter: {
    key: 'content_starter', label: 'Digital Content — Storyteller Starter', category: 'Digital Content', fee: 4000,
    deliverables: ['5 Social Media Graphics', '2 Animated GIFs', '3 Basic Digital Ad Banners', 'Image Curation & Optimisation'],
  },
  content_maximizer: {
    key: 'content_maximizer', label: 'Digital Content — Impact Maximizer', category: 'Digital Content', fee: 8500,
    deliverables: ['Everything in Storyteller Starter', 'In-depth Content Calendar', 'Social Media Video (up to 30s)', 'Infographic Design', 'Custom Iconography Set (5–7)', 'Newsletter Header Design'],
  },
  content_narrative: {
    key: 'content_narrative', label: 'Digital Content — Narrative Designer', category: 'Digital Content', fee: 15000,
    deliverables: ['Everything in Impact Maximizer', 'Full Digital Content Strategy', 'Explainer Video (up to 90s)', 'Interactive Content Element', 'Motion Graphics', 'Custom Branded Templates'],
  },
  app_essentials: {
    key: 'app_essentials', label: 'App Development — App Essentials', category: 'App Development', fee: 14500, feeNote: 'from',
    deliverables: ['Progressive Web App Build', 'Offline Capability', 'Add-to-Home-Screen', 'Push Notification Ready'],
  },
  app_growth: {
    key: 'app_growth', label: 'App Development — App Growth', category: 'App Development', fee: 32000, feeNote: 'from',
    deliverables: ['User Accounts & Authentication', 'Database-Backed Dashboard', 'One Core Workflow', 'Mobile-Responsive Throughout'],
  },
  app_priority: {
    key: 'app_priority', label: 'App Development — App Priority', category: 'App Development', fee: 55000, feeNote: 'from',
    deliverables: ['Multi-User Roles & Permissions', 'Payment Integration', 'Admin Dashboard', 'Third-Party API Integrations'],
  },
};

export const HOSTING_PLANS: Record<string, PlanDef> = {
  foundation: { key: 'foundation', label: 'Hosting — Foundation', fee: 89, period: '/month', includes: ['2GB SSD Storage', '5 Email Accounts', 'Free SSL', 'Free Weekly Backups', 'Standard Support'] },
  growth: { key: 'growth', label: 'Hosting — Growth', fee: 159, period: '/month', includes: ['5GB SSD Storage', '15 Email Accounts', 'Free SSL', 'Free Weekly Backups', 'Standard Support'] },
  priority: { key: 'priority', label: 'Hosting — Priority', fee: 249, period: '/month', includes: ['10GB SSD Storage', '25 Email Accounts', 'Free SSL', 'Free Weekly Backups', 'Priority Support Response'] },
};

export const EMAIL_PLANS: Record<string, PlanDef> = {
  starter: { key: 'starter', label: 'Email — Starter', fee: 35, period: '/month', includes: ['5 Mailboxes', '2GB Storage / Mailbox', 'Webmail & Mobile Access', 'Standard Support'] },
  team: { key: 'team', label: 'Email — Team', fee: 65, period: '/month', includes: ['15 Mailboxes', '5GB Storage / Mailbox', 'Webmail & Mobile Access', 'Standard Support'] },
  business: { key: 'business', label: 'Email — Business', fee: 99, period: '/month', includes: ['30 Mailboxes', '10GB Storage / Mailbox', 'Webmail & Mobile Access', 'Priority Support Response'] },
};

export const CAREPLAN_PLANS: Record<string, PlanDef> = {
  basic: { key: 'basic', label: 'Care Plan — Basic', fee: 800, period: '/month', includes: ['Site oversight', 'Security updates', 'Minor content edits each month'] },
  growth: { key: 'growth', label: 'Care Plan — Growth', fee: 1525, period: '/month', includes: ['Everything in Basic', 'Regular social content support (~2 posts / week)'] },
  scale: { key: 'scale', label: 'Care Plan — Scale', fee: 2368, period: '/month', includes: ['Everything in Growth', 'Ongoing SEO retainer', 'Monthly performance reporting'] },
};

export const RETAINER_PLANS: Record<string, PlanDef> = {
  content: { key: 'content', label: 'Monthly Content Retainer', fee: 1325, period: '/month', includes: ['Recurring batch of social graphics and captions each month'] },
  seo: { key: 'seo', label: 'Monthly SEO Retainer', fee: 2658, period: '/month', includes: ['Ongoing on-page and technical SEO work'] },
};
