// Plain data module — deliberately NOT a 'use client' file. This is what
// makes it safe to import from both page.tsx (Server Component, builds the
// FAQPage JSON-LD) and FAQClient.tsx (Client Component, renders the visible
// accordion). Importing this same array from a 'use client' file instead
// broke the production build: Next.js treats every export of a client file
// as a client-side reference, even plain data, so the server-side .map()
// call in page.tsx failed with "map() from the server but map is on the
// client." Keep this file plain — no 'use client', no hooks, no JSX.

export const faqItems = [
  {
    question: "What services does Touch Domain actually offer?",
    answer: "Five things, all under one roof: brand identity (logos, colour, typography), web design, digital content (graphics, video, copy), website hosting and email, and custom app development. Most agencies specialise in one of these — we do all five as one coherent identity, with the same team supporting you after launch."
  },
  {
    question: "Do I need a website before I can get hosting or email from you?",
    answer: "No. If you already have a website elsewhere, or don't have one yet, our Email tiers give you a professional @yourdomain inbox on its own, no website required. If you want a full site hosted too, that's a separate set of Hosting tiers, which include email as part of the package."
  },
  {
    question: "Can I just get email hosting without a full website?",
    answer: "Yes — that's exactly what the Email Starter, Email Team, and Email Business tiers are for. No website needed."
  },
  {
    question: "What's included in your website hosting?",
    answer: "Every hosting tier includes free SSL, free daily backups, and a set number of email accounts under your own domain. Higher tiers add more storage, more mailboxes, and priority support response."
  },
  {
    question: "Do you build mobile apps?",
    answer: "We build Progressive Web Apps (installable, offline-capable, no app store required) and fully custom web applications with real business logic — user accounts, dashboards, payment integration, and more. We don't currently build native iOS or Android apps."
  },
  {
    question: "How does pricing work — do I have to pick a fixed package?",
    answer: "You can choose one of our set packages for simplicity, or use our quote tool to fully customise a solution across branding, web design, content, hosting, and apps, and get an instant estimate before you talk to us."
  },
  {
    question: "What if I'm not sure which service I actually need?",
    answer: "That's exactly what our free consultation is for. Tell us a bit about where you're starting from and what you're hoping to achieve, and we'll point you toward the right package — or tell you honestly if you don't need everything you were considering."
  },
  {
    question: "Do you only work with businesses in major cities?",
    answer: "No. We work with South African SMEs wherever they're based, not just in major metros."
  },
  {
    question: "Will you still be there after my website launches?",
    answer: "Yes — this is a core part of how we work. Because we also host what we build, we stay involved after launch rather than handing over a finished site and disappearing. Ongoing Care Plan retainers are also available if you want us actively maintaining and updating your site over time."
  },
  {
    question: "What happens if my site goes down?",
    answer: "If we're hosting it, that's on us to sort out, and there's one team to call rather than juggling a separate designer, host, and email provider. Hosting plans include daily backups specifically so a problem doesn't mean losing your content."
  },
];