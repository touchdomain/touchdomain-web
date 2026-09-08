// Single source of truth for Touch Domain's legal documents.
//
// Rendered as web pages by src/components/LegalDoc.tsx and as branded PDFs by
// scripts/generate-legal-pdfs.mjs (run `node scripts/generate-legal-pdfs.mjs`
// after editing, then commit the regenerated files in public/legal/).
//
// Plain .mjs (no JSX, no hooks) so both the TypeScript pages and the Node
// PDF script can import it. Types live in legal.d.ts.
//
// Block shapes: { h } heading · { sh } sub-heading · { p } paragraph ·
// { ul: [] } bullet list · { kv: [[label, value]] } label/value rows.

const COMPANY = 'TOUCHDOMAIN (Pty) Ltd';
const REG_NO = '2026/686289/07';
const ADDRESS = '96 Makgathe Street, Ipelegeng, Schweizer-Reneke, 2780';
const INFO_OFFICER = 'Mr. Thabo Mtsweni (Reg. No. 2026-066164)';

export const LEGAL_DOCS = [
  // ─────────────────────────────────────────── Terms & Conditions
  {
    slug: 'terms',
    navLabel: 'Terms & Conditions',
    title: 'Terms & Conditions',
    subtitle: 'The Fine Print, Kept Honest',
    description: 'The terms governing use of the Touch Domain website and our services.',
    effectiveDate: '7 September 2026',
    pdf: '/legal/terms-and-conditions.pdf',
    blocks: [
      { h: 'Business Information' },
      {
        p: `${COMPANY} (Registration No. ${REG_NO}), trading as Touch Domain ("we," "us," or "our"), is a South African-registered company providing web design, branding, digital content, app development, and reseller web hosting services.`,
      },
      { kv: [['Physical Address', ADDRESS], ['Contact Email', 'info@touchdomain.co.za']] },

      { h: 'Using This Website' },
      {
        p: 'By using touchdomain.co.za, you agree to use it lawfully and not to disrupt, scrape, or interfere with its normal operation, including our contact forms and quote calculator.',
      },

      { h: 'Quotes & Estimates' },
      {
        p: 'Any price displayed on our quote calculator, package pages, or automated order confirmations is an estimate based on your selected options — not a final invoice. We confirm final scope and pricing directly with you before work begins, and we may adjust them once we have discussed your specific requirements in full. All prices are in South African Rand (ZAR) and exclude any additional costs (e.g., third-party licensing, domain registration, or hosting renewals) unless explicitly stated. We will agree on any additional costs in writing before work begins.',
      },

      { h: 'Ordering a Package' },
      {
        p: 'Submitting an order or quote request through this website constitutes an expression of interest and does not create a binding contract. A binding agreement is formed only once both parties confirm the scope, pricing, and timeline in writing.',
      },

      { h: 'Payment Terms' },
      {
        p: 'Unless otherwise agreed in writing, projects require a deposit before work begins to cover initial setup and scheduling costs. The remaining balance is due according to the schedule set out in your project confirmation. We accept payment via Electronic Funds Transfer (EFT) and credit/debit card. Accounts unpaid for more than 14 calendar days past the due date may result in project work or hosted services being paused until payment is received in full.',
      },

      { h: 'Cancellation & Refunds' },
      {
        p: 'If you cancel a project after work has begun, we retain the initial deposit to cover administrative fees, reserved time, and work already completed. Any additional milestone payments will be evaluated against the deliverables completed by the cancellation date. Any unearned balance will be refunded at our sole discretion.',
      },

      { h: 'Intellectual Property' },
      {
        p: 'All content on this website — including our branding, copywriting, and design assets — belongs to Touch Domain unless otherwise stated. Project deliverables created for a client become the property of the client upon receipt of full and final payment, subject to any third-party software or content licensing terms.',
      },

      { h: 'Testimonials & Case Studies' },
      {
        p: `We publish a client's name, business name, or project details on this website only with their explicit consent (collected via our review form or separate agreement). Consent may be withdrawn at any time by contacting us in writing.`,
      },

      { h: 'Confidentiality' },
      {
        p: 'Both parties agree to maintain the confidentiality of any non-public business information that is shared during the course of a project. Neither party shall disclose such information to third parties without prior written consent, except where required by law.',
      },

      { h: 'Indemnity' },
      {
        p: 'You warrant that any content, images, logos, fonts, or other materials supplied to Touch Domain for use in your project are owned by you or used with appropriate authorization. You agree to indemnify and hold Touch Domain harmless against any third-party claims arising from our use of materials you provide.',
      },

      { h: 'Limitation of Liability' },
      {
        p: 'While we strive for accuracy across this website, information, including package descriptions and estimated pricing, may change without notice. Touch Domain is not liable for business decisions made solely based on this website without direct confirmation from our team.',
      },

      { h: 'Force Majeure' },
      {
        p: 'Touch Domain is not liable for delays or failures in performance caused by circumstances beyond our reasonable control, including but not limited to load-shedding, power grid failures, internet service provider or hosting provider outages, or third-party service disruptions.',
      },

      { h: 'Your Privacy' },
      {
        p: 'Any personal information submitted through this site is handled in accordance with our Privacy Policy and PAIA Manual, both of which are accessible on this website.',
      },

      { h: 'Changes to These Terms' },
      {
        p: 'We may update these terms from time to time. The current version will always be published on this page with an updated effective date. Changes apply to new orders placed on or after the date of the update. Work under an existing written agreement remains governed by the terms in place when that agreement was confirmed.',
      },

      { h: 'Governing Law & Dispute Resolution' },
      {
        p: 'These terms are governed by and constructed in accordance with the laws of the Republic of South Africa. In the event of a dispute, both parties agree to first attempt to resolve the matter directly and in good faith before initiating formal legal action. These terms are subject to the exclusive jurisdiction of the courts of the Republic of South Africa.',
      },

      { h: 'Severability & Entire Agreement' },
      {
        p: 'If any provision of these terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect. Together with any signed project proposal or written scope confirmation, these terms constitute the entire agreement between you and Touch Domain regarding the services described.',
      },

      { h: 'Questions' },
      { p: 'Reach us at info@touchdomain.co.za for anything on this page.' },
    ],
  },

  // ─────────────────────────────────────────── Privacy Policy
  {
    slug: 'privacy',
    navLabel: 'Privacy Policy',
    title: 'Privacy Policy',
    subtitle: 'How We Handle Your Information',
    description: 'How Touch Domain collects, uses, and protects your personal information under POPIA.',
    effectiveDate: '7 September 2026',
    pdf: '/legal/privacy-policy.pdf',
    blocks: [
      { h: '1. Who We Are' },
      {
        p: `${COMPANY}, trading as Touch Domain ("we," "us," or "our"), is a South African digital studio providing branding, web design, digital content, and app development services.`,
      },
      {
        kv: [
          ['Registration Number', REG_NO],
          ['Registered Physical Address', ADDRESS],
          ['Appointed Information Officer', INFO_OFFICER],
          ['Direct Compliance Email', 'tmtsweni@touchdomain.co.za'],
          ['General Email', 'info@touchdomain.co.za'],
        ],
      },
      {
        p: 'This policy explains how we collect, process, store, and protect your personal information through touchdomain.co.za in accordance with the Protection of Personal Information Act 4 of 2013 (POPIA).',
      },

      { h: '2. Personal Information We Collect' },
      { p: 'We collect personal information that you voluntarily provide to us when completing forms on our website:' },
      {
        ul: [
          'Contact Form: Name, email address, message subject, and enquiry details.',
          'Consultation Booking: Name, email address, phone number, and preferred date/time.',
          'Order Requests: Name, email address, phone number, and selected packages or features.',
          'Custom Quote Builder: Name, email address, phone number, and service requirements.',
          'Reviews & Testimonials: Name, email address, business name, project type, rating, and feedback.',
        ],
      },
      { sh: 'Cookies & Automated Technical Data' },
      {
        p: 'We do not use tracking cookies, analytics scripts, or third-party advertising pixels on this site. However, our web hosting infrastructure automatically collects standard, anonymized server access logs (such as IP addresses, browser types, and timestamp data) solely to maintain platform security, prevent abuse, and ensure site stability.',
      },

      { h: '3. Purpose of Collection & Legal Basis' },
      { p: 'We process your personal information strictly for legitimate business operational purposes, including:' },
      {
        ul: [
          'Responding to your enquiries and project requests.',
          'Preparing custom estimates, scope confirmations, and billing accounts.',
          'Scheduling consultation calls and managing project timelines.',
          'Publishing client reviews and case studies (only with your explicit, separate consent collected on our review form).',
        ],
      },
      { p: 'We do not sell, rent, trade, or share your personal information with third parties for marketing purposes.' },

      { h: '4. Data Storage, Access & Retention' },
      { sh: 'Storage & Access' },
      {
        p: 'Form submissions are transmitted and stored securely within our backend infrastructure. Access is strictly limited to Touch Domain staff directly involved in responding to your request or delivering your project.',
      },
      { sh: 'Retention Period' },
      {
        p: 'We retain personal information for 12 months from your last interaction with us, after which it is securely deleted or anonymized. Personal information may be retained beyond 12 months only where required to fulfill accounting, tax, or legal contractual obligations, or where you explicitly request earlier deletion.',
      },

      { h: '5. Cross-Border Data Transfers' },
      {
        p: 'Our website is hosted on infrastructure provided by Vercel Inc., which may route or store data on servers located outside the Republic of South Africa. Where personal information is processed cross-border, we ensure compliance with Section 72 of POPIA by utilizing reputable cloud service providers that implement industry-standard encryption, organizational security measures, and data protection practices consistent with POPIA.',
      },

      { h: '6. Your Data Protection Rights Under POPIA' },
      { p: 'As a data subject under South African law, you have the right to:' },
      {
        ul: [
          'Access Your Data: Confirm whether we hold personal information about you and request a copy of those records.',
          'Correction or Deletion: Request that inaccurate, irrelevant, or obsolete personal information be corrected or destroyed.',
          'Withdraw Consent: Withdraw your consent at any time regarding the public display of your testimonial, review, or case study.',
          'Object to Processing: Object to the processing of your personal information on reasonable grounds.',
          'Lodge a Complaint: Contact the Information Regulator of South Africa if you believe your personal data rights have been violated.',
        ],
      },

      { h: '7. How to Exercise Your Rights & Contact Us' },
      { p: 'To exercise any of your rights or request further clarity on how your personal data is handled, please contact our Information Officer directly:' },
      {
        kv: [
          ['Information Officer', 'Thabo Mtsweni'],
          ['Email', 'tmtsweni@touchdomain.co.za or info@touchdomain.co.za'],
        ],
      },
      { sh: 'Information Regulator Contact Details' },
      { p: 'If you are unsatisfied with our response, you have the right to lodge a complaint with the South African Information Regulator:' },
      {
        kv: [
          ['Website', 'inforegulator.org.za'],
          ['POPIA Complaints Email', 'POPIAComplaints@inforegulator.org.za'],
          ['General Enquiries Email', 'enquiries@inforegulator.org.za'],
        ],
      },
    ],
  },

  // ─────────────────────────────────────────── PAIA Manual
  {
    slug: 'paia-manual',
    navLabel: 'PAIA Manual',
    title: 'PAIA Manual',
    subtitle: `${COMPANY}`,
    description: 'Manual prepared under Section 51 of the Promotion of Access to Information Act 2 of 2000.',
    effectiveDate: '7 September 2026',
    pdf: '/legal/paia-manual.pdf',
    blocks: [
      {
        p: 'Prepared in accordance with Section 51 of the Promotion of Access to Information Act 2 of 2000 (as amended by the Protection of Personal Information Act 4 of 2013).',
      },

      { h: '1. Company Overview & Contact Details' },
      {
        p: `${COMPANY}, trading as Touch Domain (Registration No. ${REG_NO}), is a South African digital studio offering web design, branding, digital content, app development, and reseller web hosting services.`,
      },
      {
        kv: [
          ['Physical Address', ADDRESS],
          ['Information Officer', INFO_OFFICER],
          ['Contact Email', 'tmtsweni@touchdomain.co.za'],
          ['Website', 'touchdomain.co.za'],
        ],
      },

      { h: "2. The Information Regulator's Section 10 Guide" },
      {
        p: "The Information Regulator has published a Guide in terms of Section 10 of PAIA to assist members of the public in exercising their rights under the Act. Members of the public can inspect or obtain a copy of this Guide from the Information Regulator's website (inforegulator.org.za) or by contacting them at:",
      },
      {
        kv: [
          ['Email', 'enquiries@inforegulator.org.za / PAIAComplaints@inforegulator.org.za'],
          ['Physical Address', 'JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001'],
        ],
      },

      { h: '3. Records Automatically Available Without Formal Request' },
      { p: 'The following information is automatically available on our website without submitting a formal PAIA request:' },
      {
        ul: [
          'General service descriptions and package pricing estimates',
          'Public blog posts, case studies, and portfolio showcases',
          'Privacy Policy, Website Terms & Conditions, and this PAIA Manual',
        ],
      },

      { h: '4. Categories of Records Held by Touch Domain' },
      { p: 'Touch Domain maintains records across the following operational categories:' },
      {
        ul: [
          'Client & Commercial Records: Project briefs, contracts, quotes, invoices, payment history, scope confirmations, and general correspondence.',
          'Website & Form Submissions: Enquiries, contact form submissions, quote requests, and consultation bookings (retained for 12 months).',
          'Financial Records: Accounting entries, bank statements, tax records, and asset registers.',
          'Supplier & Partner Records: Service provider agreements, reseller web hosting arrangements, software licenses, and third-party vendor contact details.',
          'Marketing & Communications: Testimonials, client reviews, case study assets (where explicit consent was granted), and operational consent records.',
        ],
      },

      { h: '5. How to Submit a Request for Access to Records' },
      { sh: 'Prescribed Form' },
      {
        p: "Requests for access to records held by Touch Domain must be made using Form 2 (Request for Access to Record), available on the Information Regulator's website or upon request from our Information Officer.",
      },
      { sh: 'Submission' },
      { p: 'Send the completed Form 2 to our Information Officer via email at tmtsweni@touchdomain.co.za.' },
      { sh: 'Sufficient Detail' },
      { p: 'The request must provide sufficient detail to enable the Information Officer to identify:' },
      {
        ul: [
          'The specific record(s) requested.',
          'The identity and contact details of the requester.',
          'The right the requester seeks to exercise or protect.',
        ],
      },
      { sh: 'Outcome & Prescribed Fees' },
      {
        ul: [
          'Requesters seeking their own personal information are exempt from paying a request fee.',
          'For third-party requests, a prescribed request fee is payable before processing begins. Search, reproduction, and delivery fees apply as prescribed under PAIA Regulations.',
          'The Information Officer will notify the requester of the decision and applicable fees using prescribed Form 3 within 30 calendar days of receipt.',
        ],
      },

      { h: '6. Grounds for Refusal of Access' },
      {
        p: 'Touch Domain may lawfully refuse a request for access to records under mandatory provisions of PAIA, including where disclosure would:',
      },
      {
        ul: [
          'Unreasonably reveal personal information about a third party (data subject).',
          'Violate commercial confidentiality or trade secrets of a third party or Touch Domain.',
          'Breach professional privilege or contractual obligations of confidentiality.',
          'Threaten the safety of individuals, property, or digital infrastructure.',
        ],
      },

      { h: '7. Personal Information Processing (POPIA Integration)' },
      {
        p: 'In terms of the Protection of Personal Information Act 4 of 2013 (POPIA), Touch Domain processes personal information as follows:',
      },
      {
        ul: [
          'Purpose of Processing: To render digital services, generate quotes, fulfill reseller hosting orders, maintain accounting records, send billing communications, and comply with legal tax obligations.',
          'Categories of Data Subjects: Clients, prospective clients, website visitors, vendors, and service providers.',
          'Categories of Personal Information: Names, business names, contact details (email, phone, address), IP addresses, payment transaction histories, and project specifications.',
          'Recipients of Personal Information: Information is disclosed only to authorized employees, technical subcontractors (e.g., hosting providers), and professional advisors operating under strict confidentiality obligations.',
          'Cross-Border Data Transfers: Web hosting and cloud database servers operated by our third-party infrastructure partners may store or route data internationally. We ensure these providers uphold data security standards compatible with POPIA.',
          'Data Security Measures: Touch Domain employs appropriate technical and organizational measures to safeguard personal information, including encrypted SSL web connections, strict credential management, multi-factor authentication, regular system updates, and restricted operational access.',
        ],
      },

      { h: '8. Availability of This Manual' },
      {
        p: 'This manual is publicly available in PDF format on touchdomain.co.za and for inspection at our principal place of business during normal working hours upon reasonable notice.',
      },
    ],
  },

  // ─────────────────────────────────────────── ECTA Disclosure
  {
    slug: 'ecta-disclosure',
    navLabel: 'ECTA Disclosure',
    title: 'ECTA Disclosure',
    subtitle: 'Electronic Communications and Transactions Act',
    description: 'Enterprise information published under Section 43 of the Electronic Communications and Transactions Act 25 of 2002.',
    effectiveDate: '7 September 2026',
    pdf: '/legal/ecta-disclosure.pdf',
    blocks: [
      {
        p: 'Published in accordance with Section 43 of the South African Electronic Communications and Transactions Act 25 of 2002.',
      },

      { h: '1. Enterprise Information' },
      {
        kv: [
          ['Full Registered Name', COMPANY],
          ['Trading Name', 'Touch Domain'],
          ['Registration Number', REG_NO],
          ['Legal Status', 'Private Company registered under the Companies Act of South Africa'],
          ['Directors', 'Thabo Mtsweni'],
        ],
      },

      { h: '2. Physical Address & Contact Details' },
      {
        kv: [
          ['Physical Address', ADDRESS],
          ['Postal Address', ADDRESS],
          ['General Email', 'info@touchdomain.co.za'],
          ['Compliance Email', 'tmtsweni@touchdomain.co.za'],
          ['Website', 'touchdomain.co.za'],
        ],
      },

      { h: '3. Main Business Activity' },
      {
        p: 'Touch Domain provides custom web design, branding, digital content creation, application development, and reseller web hosting services.',
      },

      { h: '4. Pricing, Estimates & Invoicing' },
      {
        ul: [
          'All prices, quote calculations, and package fees displayed on touchdomain.co.za are quoted in South African Rand (ZAR).',
          'Automated estimates on this website do not constitute binding invoices. Final fixed pricing, payment terms, and project scopes are confirmed in writing via a formal project agreement prior to commencing work.',
          'Pricing excludes additional third-party costs (such as domain registrations, external software licensing, or third-party hosting infrastructure) unless explicitly itemized and agreed upon in writing.',
        ],
      },

      { h: '5. Payment & Security Infrastructure' },
      {
        p: 'Electronic payments and bank transfers (EFT) are processed using secure banking gateways and standard encrypted channels (SSL/TLS protocols) to safeguard transactional information.',
      },

      { h: '6. Service Records & Transaction Records' },
      {
        p: 'A full record of transactions, scope documents, and tax invoices will be provided to the client electronically and maintained for statutory record-keeping periods.',
      },

      { h: '7. Cancellation & Cooling-Off Period' },
      {
        p: "Under Section 44 of ECTA, consumers purchasing services electronically may be entitled to a 7-day cooling-off period following agreement, provided services have not already commenced with the client's consent. Once bespoke creative work, web development, or domain registrations have commenced at the request of the client, standard cancellation procedures outlined in our Terms & Conditions apply.",
      },

      { h: '8. Codes of Conduct & Dispute Resolution' },
      {
        p: 'Touch Domain operates in compliance with South African commercial and electronic commerce laws. In the event of a dispute, procedures set out in our Terms & Conditions will apply, prioritizing direct, good-faith negotiation before external escalation.',
      },
    ],
  },
];

export function getLegalDoc(slug) {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
