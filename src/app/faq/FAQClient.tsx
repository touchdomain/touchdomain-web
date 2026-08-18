'use client';
import { useState } from 'react';
import Link from 'next/link';
import HalfCircleTopRight from '../../components/HalfcircleTopRight';
import HalfCircleBottomLeft from '../../components/HalfcircleBottomLeft';

// Single source of truth for FAQ content — the parent Server Component
// (page.tsx) reads this same array to build the FAQPage JSON-LD, so the
// visible accordion and the structured data sent to search engines can
// never drift out of sync with each other.
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

export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="relative py-[2rem] my-[1.5rem]">
      <section id="faq-page" className="section-wrapper overflow-hidden pt-24">
        <h2>Frequently Asked Questions</h2>
        <h3 className="heading-text mb-[10px]">Straight Answers, No Jargon</h3>
        <p className="intro">
          Common questions about how Touch Domain works, what's included, and how to get started.
        </p>
        <HalfCircleTopRight />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 mt-8">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-td-purple font-[600] text-[16px]">{item.question}</span>
                  <i className={`fa fa-chevron-down !bg-transparent !p-0 text-td-accent text-[14px] transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-gray-600 text-[14.5px] leading-relaxed pb-5 pr-8">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-10 relative z-10">
          <p className="text-gray-500 text-[14px] mb-4">Still have a question we haven't covered?</p>
          <Link href="/contact" className="inline-block text-[14px] px-6 py-3 bg-td-purple text-white rounded-[20px] font-[600] transition-all duration-300 hover:bg-transparent hover:border-td-purple hover:text-td-purple border-[1.7px] border-transparent">
            Get in Touch
          </Link>
        </div>

        <HalfCircleBottomLeft />
      </section>
    </main>
  );
}