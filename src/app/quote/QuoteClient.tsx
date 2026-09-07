'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FormStatus from './../../components/FormStatus';
import FAQCta from './../../components/FAQCta';
import {
  priceOf,
  applyRetainerToggle,
  HOSTING_TIERS,
  EMAIL_TIERS,
  CARE_PLANS,
  RETAINER_INCLUDES,
} from './../../lib/pricingConfig';


// Same pure-CSS group-hover tooltip mechanism already used and proven in
// PricingCard.tsx, adapted for a form field label instead of a feature
// list item. Kept local to this file since no other form on the site
// currently needs per-field explanations at this density.
function FieldLabel({ text, tooltip, htmlFor, className }: { text: string; tooltip: string; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`form-label text-sm font-semibold flex items-center gap-[6px] group relative cursor-help w-fit ${className || ''}`}>
      {text}
      <i className="!bg-transparent !p-0 fas fa-circle-info text-[13px] text-td-accent flex-shrink-0"></i>
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-[220px] bg-white text-td-purple font-medium text-xs p-3 rounded-lg shadow-xl z-50 pointer-events-none border-b-4 border-td-accent normal-case">
        {tooltip}
        <div className="absolute top-full left-4 border-4 border-transparent border-t-white"></div>
      </div>
    </label>
  );
}

export default function QuoteClient() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<string[]>([]);
  const [retainerFeatures, setRetainerFeatures] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Once-off project total — design, branding, content and their feature
  // checkboxes. The App Development tier is deliberately excluded here and
  // surfaced on its own line (appTotal below): it's quoted "from" and its
  // scope varies too much to sit inside a firm project number.
  useEffect(() => {
    let currentTotal = 0;
    Object.entries(selections).forEach(([category, val]) => {
      if (category === 'App Development') return;
      currentTotal += priceOf(val);
    });
    features.forEach(feature => {
      currentTotal += priceOf(feature);
    });
    setTotal(currentTotal);
  }, [selections, features]);

  // App development — a once-off cost, shown on its own line rather than
  // folded into the project total.
  const appTotal = priceOf(selections['App Development']);

  // Ongoing Support total — calculated separately since it's a recurring
  // monthly cost, not part of the once-off project estimate above.
  useEffect(() => {
    let currentMonthly = 0;
    retainerFeatures.forEach(item => {
      currentMonthly += priceOf(item);
    });
    setMonthlyTotal(currentMonthly);
  }, [retainerFeatures]);

  // A care plan already bundles one or more of the standalone monthly
  // retainers (see RETAINER_INCLUDES); those get removed from the estimate
  // and disabled in the UI while that plan is selected.
  const activeCarePlan = retainerFeatures.find(f => CARE_PLANS.includes(f));
  const bundledRetainers = activeCarePlan ? RETAINER_INCLUDES[activeCarePlan] ?? [] : [];

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, category: string) => {
    setSelections(prev => ({ ...prev, [category]: e.target.value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFeatures(prev => 
      checked ? [...prev, value] : prev.filter(f => f !== value)
    );
  };

  const handleRetainerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setRetainerFeatures(prev => applyRetainerToggle(prev, value, checked));
  };

  // Hosting and Email tiers are mutually exclusive with EACH OTHER too, not
  // just within themselves — every hosting tier already includes email
  // accounts, so picking a hosting plan makes a separate email plan
  // redundant, and vice versa. Both still feed into the same
  // retainerFeatures array (and therefore the same monthly total) as
  // everything else in this section.
  const handleHostingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setRetainerFeatures(prev => {
      const cleared = prev.filter(f => !HOSTING_TIERS.includes(f) && !EMAIL_TIERS.includes(f));
      return value ? [...cleared, value] : cleared;
    });
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setRetainerFeatures(prev => {
      const cleared = prev.filter(f => !HOSTING_TIERS.includes(f) && !EMAIL_TIERS.includes(f));
      return value ? [...cleared, value] : cleared;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const form = e.target as HTMLFormElement;
    
    // Combine selects and checkboxes for the PDF payload. Drop dropdowns left
    // on "Choose an option" (empty value) so they don't render as blank lines.
    const combinedSelections = {
        ...Object.fromEntries(Object.entries(selections).filter(([, v]) => v)),
        'Additional Features': features.length > 0 ? features.join(', ') : 'None',
        'Ongoing Support': retainerFeatures.length > 0 ? retainerFeatures.join(', ') : 'None'
    };

    const quoteData = {
      selections: combinedSelections,
      estimatedTotal: total.toLocaleString('en-ZA'),
      estimatedApp: appTotal.toLocaleString('en-ZA'),
      estimatedMonthly: monthlyTotal.toLocaleString('en-ZA'),
      clientName: (form.querySelector('#clientNameInput') as HTMLInputElement).value,
      clientEmail: (form.querySelector('#clientEmailInput') as HTMLInputElement).value,
      clientPhone: (form.querySelector('#phoneNumberInput') as HTMLInputElement).value,
      message: (form.querySelector('#messageTextarea') as HTMLTextAreaElement).value,
      website: (form.querySelector('#quoteWebsiteInput') as HTMLInputElement).value, // honeypot
    };

    try {
      const response = await fetch('/api/submit-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Quote request and PDF estimate sent successfully!' });
        setSelections({});
        setFeatures([]);
        setRetainerFeatures([]);
        form.reset();
      } else {
        setStatus({ type: 'error', message: result.message || 'Failed to submit.' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      {/* ── Static Hero Section ── */}
      <section className="relative block h-screen overflow-x-hidden bg-white w-full pt-[100px] pb-0 md:pt-0 md:pb-0">
        <div className="hidden md:block absolute top-0 right-0 w-[45%] h-full bg-[url('/branding/hero-background.png')] bg-cover bg-center z-0"></div>

        <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 w-full h-full md:h-auto z-10 flex flex-col md:flex-row justify-start md:justify-center">
          <div className="w-full h-full md:h-auto md:max-w-[93%] md:mx-auto px-0 flex flex-col md:block">
            <div className="flex flex-col md:grid md:grid-cols-2 items-center md:pr-[3%] lg:pr-[8%] gap-0 md:gap-10 lg:gap-12 flex-1 md:flex-none h-full md:h-auto">
              
              <div className="flex flex-col items-center text-center md:items-start md:text-left animate-fadeIn w-full px-6 md:px-0 pb-6 md:pb-0 flex-shrink-0">
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,3rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  Get Your Custom Package
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  Tailored Solutions for Your Vision
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.25rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
                  Ready to bring your digital aspirations to life? Every great online presence begins with a clear plan. Here, you can easily select the precise services your brand needs to thrive. Let's build a customized solution that perfectly aligns with your vision and budget, ensuring you get exactly what's required to make an impact.
                </p>
                
                <div className="mt-4 ml-0 md:ml-[5px]">
                  <Link href="#quote" className="inline-block text-[14px] px-[15px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold">
                    Build Your Custom Quote Now!
                  </Link>
                </div>
              </div>

              {/* flex-1 makes this pin to the bottom and fill whatever space is left,
                  regardless of how tall the text block above ends up being — this is
                  the key difference from the previous two attempts. */}
              <div className="relative w-full bg-td-purple md:bg-transparent flex-1 md:flex-none flex flex-col items-center justify-center md:block overflow-hidden">
                <div className="relative flex justify-center md:justify-end animate-fadeIn">
                <div className="w-[190px] xs:w-[220px] sm:w-[260px] md:w-[280px] lg:w-[340px] xl:w-[400px] 2xl:w-[460px]">
                  {/* Ensure quote-landing.png is in your public/branding/ folder */}
                  <Image src="/branding/quote-landing.png" alt="Quote Builder" width={500} height={400} className="w-full h-auto object-contain drop-shadow-2xl" priority />
                </div>
              </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Form Section ── */}
      <section id="quote" className="section-wrapper">
        <h2 className="text-td-purple uppercase font-[800] text-[2.2rem] text-center w-full">Your Custom Quote</h2>
        <h3 className="heading-text text-td-accent font-bold uppercase text-[1.4rem] text-center">Tailored Solutions for Your Digital Vision</h3>
        <p className="intro text-gray-700 text-center max-w-4xl mx-auto px-4 mb-8">
            Select the precise services your brand needs to thrive. Let's build a customized solution that perfectly 
            aligns with your vision and budget.
        </p>

        <p className="text-center text-td-accent text-[13px] font-[600] uppercase tracking-wide max-w-2xl mx-auto px-4 mb-8">
            No "contact us for pricing" games — see your real, itemized estimate update live as you build it below.
        </p>

        <div className="intro-container max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-gray-100">
            <form id="quoteForm" onSubmit={handleSubmit}>
                
                {/* Web Design Section */}
                <h4 className="text-xl font-bold text-td-purple mt-6">Web Design</h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">This section covers the core elements needed to get your website online and looking great.</p>
                
                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <FieldLabel  htmlFor="q-website-type" text="Website Type" tooltip="The kind of site that best fits your business — this shapes the layout and features included." className="text-td-purple" />
                        <select id="q-website-type" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Website Type')} value={selections['Website Type'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Informational">Informational</option>
                            <option value="E-commerce Store">E-commerce Store</option>
                            <option value="Portfolio/Personal">Portfolio/Personal</option>
                            <option value="Blog/Content Hub">Blog/Content Hub</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-number-of-pages" text="Number of Pages" tooltip="How many distinct pages you need, not counting individual blog posts or products." className="text-td-purple"  />
                        <select id="q-number-of-pages" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Number of Pages')} value={selections['Number of Pages'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Up to 5 Pages">Up to 5 Pages</option>
                            <option value="6-10 Pages">6-10 Pages</option>
                            <option value="11-20 Pages">11-20 Pages</option>
                            <option value="20+ Pages">20+ Pages</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-copy-writing" text="Copy Writing" tooltip="Whether you'll supply your own website text, or want our team to write it for you." className="text-td-purple" />
                        <select id="q-copy-writing" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Copy Writing')} value={selections['Copy Writing'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-stock-images" text="Stock Images" tooltip="Professional stock photography for your site, if you don't have your own images ready." className="text-td-purple" />
                        <select id="q-stock-images" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Stock Images')} value={selections['Stock Images'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Yes, I need stock images">Yes, I need stock images</option>
                            <option value="No">No, I have my own images</option>
                        </select>
                    </div>
                </div>

                <h5 className="font-semibold text-td-purple mb-2">Web Features</h5>
                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                    {['Website Security', 'On-Page Optimization', 'Advanced SEO', 'Payment Gateway', 'Booking System', 'User Account Functionality', 'Custom Functionality', 'CRM System'].map(feat => (
                        <div className="form-check" key={feat}>
                            <input className="form-check-input mr-2" type="checkbox" value={feat} id={feat.replace(/\s+/g, '')} onChange={handleCheckboxChange} checked={features.includes(feat)} />
                            <label className="form-check-label text-sm" htmlFor={feat.replace(/\s+/g, '')}>{feat}</label>
                        </div>
                    ))}
                </div>

                {/* Brand Identity Section */}
                <h4 className="text-xl font-bold text-td-purple mt-10">Brand Identity</h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">This section covers the foundational elements that define your brand's unique visual identity.</p>

                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <FieldLabel htmlFor="q-primary-logo" text="Primary Logo" tooltip="Your main brand mark — the logo used across your website, signage, and marketing." className="text-td-purple" />
                        <select id="q-primary-logo" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Primary Logo')} value={selections['Primary Logo'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="2 Initial Concepts">2 Initial Concepts</option>
                            <option value="3 Initial Concepts">3 Initial Concepts</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-social-media-pack" text="Social Media Profile Pack" tooltip="Correctly-sized profile and cover images, ready for your social accounts." className="text-td-purple" />
                        <select id="q-social-media-pack" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Social Media Pack')} value={selections['Social Media Pack'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="2 Platforms">2 Platforms</option>
                            <option value="4 Platforms">4 Platforms</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-iconography" text="Custom Iconography" tooltip="A matching set of icons designed for your brand, not generic stock icons." className="text-td-purple" />
                        <select id="q-iconography" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Iconography')} value={selections['Iconography'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="5 Custom Icons">5 Custom Icons</option>
                            <option value="10 Custom Icons">10 Custom Icons</option>
                            <option value="15 Custom Icons">15 Custom Icons</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-marketing-template" text="Digital Marketing Template" tooltip="A reusable template for social posts or digital ads, matching your brand." className="text-td-purple" />
                        <select id="q-marketing-template" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Marketing Template')} value={selections['Marketing Template'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Social Post Template">Social Post Template</option>
                            <option value="Digital Ad Banner Template">Digital Ad Banner Template</option>
                            <option value="Email Marketing Template">Email Marketing Template</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-presentation-template" text="Presentation Template" tooltip="A branded slide deck template for client or internal presentations." className="text-td-purple" />
                        <select id="q-presentation-template" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Presentation Template')} value={selections['Presentation Template'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="No Presentation Template">No Presentation Template</option>
                            <option value="Master Slide Template">Master Slide Template</option>
                            <option value="5-10 Slide Template">5-10 Slide Template</option>
                            <option value="10-20 Slide Template">10-20 Slide Template</option>
                        </select>
                    </div>
                </div>

                <h5 className="font-semibold text-td-purple mb-2">Brand Identity Features</h5>
                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                    {['Logo Variations', 'Color Palette Definition', 'Typography Selection', 'Basic Brand Board', 'Letterhead Design', 'Brand Voice', 'Graphic Patterns', 'Email Signature Design'].map(feat => (
                        <div className="form-check" key={feat}>
                            <input className="form-check-input mr-2" type="checkbox" value={feat} id={feat.replace(/\s+/g, '')} onChange={handleCheckboxChange} checked={features.includes(feat)} />
                            <label className="form-check-label text-sm" htmlFor={feat.replace(/\s+/g, '')}>{feat}</label>
                        </div>
                    ))}
                </div>

                {/* Digital Content Section */}
                <h4 className="text-xl font-bold text-td-purple mt-10">Digital Content</h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">This section lays the groundwork for impactful digital content, ensuring every piece serves a purpose.</p>

                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <FieldLabel htmlFor="q-static-graphics" text="Custom Static Graphic Pack" tooltip="A set of branded graphics for social media or marketing use." className="text-td-purple" />
                        <select id="q-static-graphics" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Static Graphics')} value={selections['Static Graphics'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="5 Custom Designs">5 Custom Designs</option>
                            <option value="10 Custom Designs">10 Custom Designs</option>
                            <option value="20 Custom Designs">20 Custom Designs</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-gif-pack" text="Animated GIF Pack" tooltip="Short, looping animated graphics for social media or web use." className="text-td-purple" />
                        <select id="q-gif-pack" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'GIF Pack')} value={selections['GIF Pack'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="2 Short-Form GIFs">2 Short-Form GIFs</option>
                            <option value="5 Short-Form GIFs">5 Short-Form GIFs</option>
                            <option value="10 Short-Form GIFs">10 Short-Form GIFs</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-social-video" text="Short-Form Social Video" tooltip="Brief, platform-ready video content for social media." className="text-td-purple" />
                        <select id="q-social-video" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Social Video')} value={selections['Social Video'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="1 Video (up to 30 seconds)">1 Video (up to 30 seconds)</option>
                            <option value="3 Videos (up to 30 seconds each)">3 Videos (up to 30 seconds each)</option>
                            <option value="5 Videos (up to 30 seconds each)">5 Videos (up to 30 seconds each)</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-infographic" text="Infographic Design" tooltip="Visual breakdowns of information, data, or a process, in your brand style." className="text-td-purple" />
                        <select id="q-infographic" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Infographic')} value={selections['Infographic'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Basic Infographic (Single-page)">Basic</option>
                            <option value="Complex Infographic (Multi-section/Interactive)">Complex</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-captions" text="Caption Writing" tooltip="Written captions to accompany your social media posts." className="text-td-purple" />
                        <select id="q-captions" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Captions')} value={selections['Captions'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Captions for 5 Posts">5 Posts</option>
                            <option value="Captions for 10 Posts">10 Posts</option>
                            <option value="Captions for 20 Posts">20 Posts</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-ad-banners" text="Digital Ad Banner" tooltip="Sized ad creative ready for online advertising platforms." className="text-td-purple" />
                        <select id="q-ad-banners" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Ad Banners')} value={selections['Ad Banners'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="3 Ad Banner Sizes/Variations">3 Variations</option>
                            <option value="5 Ad Banner Sizes/Variations">5 Variations</option>
                            <option value="Custom Ad Banner Set">Custom Set</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-explainer-video" text="Explainer Video" tooltip="A short video walking viewers through what you offer and why it matters." className="text-td-purple" />
                        <select id="q-explainer-video" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Explainer Video')} value={selections['Explainer Video'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Up to 60 Seconds">Up to 60 Seconds</option>
                            <option value="60-90 Seconds">60-90 Seconds</option>
                            <option value="90-120 Seconds">90-120 Seconds</option>
                        </select>
                    </div>
                    <div>
                        <FieldLabel htmlFor="q-motion-graphics" text="Motion Graphics" tooltip="Animated visual elements for video or web use." className="text-td-purple" />
                        <select id="q-motion-graphics" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'Motion Graphics')} value={selections['Motion Graphics'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Up to 30 Seconds Animation">Up to 30 Seconds</option>
                            <option value="30-60 Seconds Animation">30-60 Seconds</option>
                            <option value="Custom Animation">Custom</option>
                        </select>
                    </div>
                </div>

                <h5 className="font-semibold text-td-purple mb-2">Digital Content Features</h5>
                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
                    {['Profile Image Optimization', 'Newsletter Header Design', 'Animated Logo Reveal'].map(feat => (
                        <div className="form-check" key={feat}>
                            <input className="form-check-input mr-2" type="checkbox" value={feat} id={feat.replace(/\s+/g, '')} onChange={handleCheckboxChange} checked={features.includes(feat)} />
                            <label className="form-check-label text-sm" htmlFor={feat.replace(/\s+/g, '')}>{feat}</label>
                        </div>
                    ))}
                </div>

                {/* App Development Section */}
                <h4 className="text-xl font-bold text-td-purple mt-10">App Development <span className="text-sm font-normal text-gray-500">(Optional)</span></h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">From an installable, offline-ready web app to a fully custom platform with real business logic behind it. Quoted &ldquo;from&rdquo; and shown on its own line below, since real app scope varies too widely for a firm number here.</p>

                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                    <div>
                        <FieldLabel htmlFor="q-app-development" text="App Tier" tooltip="Which level of app development fits your project — from an installable web app to a fully custom platform." className="text-td-purple" />
                        <select id="q-app-development" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" onChange={(e) => handleSelectChange(e, 'App Development')} value={selections['App Development'] || ''}>
                            <option value="">No app needed</option>
                            <option value="App Essentials">App Essentials — from R14,500 (installable PWA)</option>
                            <option value="App Growth">App Growth — from R32,000 (custom web app)</option>
                            <option value="App Priority">App Priority — from R55,000 (advanced/multi-user)</option>
                        </select>
                    </div>
                </div>

                {/* Website Hosting Section — recurring, so it's kept out of the
                    once-off total above and grouped with Email below, which
                    shares its billing rhythm. */}
                <h4 className="text-xl font-bold text-td-purple mt-10">Website Hosting <span className="text-sm font-normal text-gray-500">(Optional)</span></h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">Built and hosted by the same team, so there's one person to call, not three. Billed monthly, separate from the once-off total, cancel any time.</p>

                <div className="grid grid-cols-1 phone-lg:grid-cols-2 gap-4 mb-10">
                    <div>
                        <label htmlFor="hostingTierSelect" className="block text-sm font-semibold text-td-purple mb-2">
                          Full Hosting <span className="text-xs font-normal text-gray-500">(pick one)</span>
                        </label>
                        <select
                          id="hostingTierSelect"
                          className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors"
                          onChange={handleHostingChange}
                          value={HOSTING_TIERS.find(t => retainerFeatures.includes(t)) || ''}
                        >
                          <option value="">No hosting needed</option>
                          <option value="Hosting — Foundation">Foundation — R89/month (2GB, 5 email accounts)</option>
                          <option value="Hosting — Growth">Growth — R159/month (5GB, 15 email accounts)</option>
                          <option value="Hosting — Priority">Priority — R249/month (10GB, 25 email accounts, priority support)</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="emailTierSelect" className="block text-sm font-semibold text-td-purple mb-2">
                          Just Need Email? <span className="text-xs font-normal text-gray-500">(no website hosting needed)</span>
                        </label>
                        <select
                          id="emailTierSelect"
                          className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors"
                          onChange={handleEmailChange}
                          value={EMAIL_TIERS.find(t => retainerFeatures.includes(t)) || ''}
                        >
                          <option value="">No email plan needed</option>
                          <option value="Email — Starter">Email Starter — R35/month (5 mailboxes)</option>
                          <option value="Email — Team">Email Team — R65/month (15 mailboxes)</option>
                          <option value="Email — Business">Email Business — R99/month (30 mailboxes)</option>
                        </select>
                    </div>
                </div>
                <p className="text-xs text-gray-400 -mt-6 mb-10">Already hosted elsewhere and just want a professional inbox? Email is a standalone alternative to full hosting, not an add-on to it.</p>

                {/* Ongoing Support Section */}
                <h4 className="text-xl font-bold text-td-purple mt-10">Ongoing Support <span className="text-sm font-normal text-gray-500">(Optional)</span></h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">
                  Most projects don't end at launch. Add a monthly care plan or content/SEO retainer to keep things running, growing, and up to date — billed separately from the once-off project cost below.
                </p>

                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { name: 'Care Plan — Basic', tooltip: 'Site oversight, security updates, and minor content edits each month.' },
                    { name: 'Care Plan — Growth', tooltip: 'Everything in Basic, plus regular social content support (roughly 2 posts a week).' },
                    { name: 'Care Plan — Scale', tooltip: 'Everything in Growth, plus an ongoing SEO retainer and monthly performance reporting.' },
                    { name: 'Monthly Content Retainer', tooltip: 'A recurring batch of social graphics and captions delivered every month.' },
                    { name: 'Monthly SEO Retainer', tooltip: 'Ongoing on-page and technical SEO work to keep improving search visibility.' },
                  ].map(item => {
                    const isBundled = bundledRetainers.includes(item.name);
                    const planName = activeCarePlan?.replace('Care Plan — ', '');
                    return (
                    <div className={`form-check ${isBundled ? 'opacity-50' : ''}`} key={item.name}>
                      <input
                        className="form-check-input mr-2"
                        type="checkbox"
                        value={item.name}
                        id={item.name.replace(/\s+/g, '')}
                        onChange={handleRetainerChange}
                        checked={retainerFeatures.includes(item.name)}
                        disabled={isBundled}
                      />
                      <label className="form-check-label text-sm" htmlFor={item.name.replace(/\s+/g, '')} title={isBundled ? `Already included in the ${planName} care plan` : item.tooltip}>
                        {item.name}
                        {isBundled && <span className="block text-[11px] text-gray-400 font-normal">included in the {planName} plan</span>}
                      </label>
                    </div>
                    );
                  })}
                </div>

                {monthlyTotal > 0 && (
                  <div className="bg-td-purple/5 border border-td-accent/30 rounded-lg p-4 mb-8 flex justify-between items-center">
                    <span className="text-sm font-semibold text-td-purple">Estimated Monthly Total</span>
                    <span className="text-xl font-bold text-td-purple">R {monthlyTotal.toLocaleString('en-ZA')} <span className="text-sm font-normal text-gray-500">/ month</span></span>
                  </div>
                )}

                <FAQCta message="Not sure what's included in a plan or retainer? Check our FAQ." className="max-w-none mx-0 !py-3 !px-4 !gap-3 text-[13px]" />

                <hr className="my-8 border-gray-300" />

                {/* Checkout / Client Details */}
                <div id="price" className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="est-total text-center mb-6">
                        {total === 0 && appTotal > 0 ? (
                          <>
                            <h4 className="text-lg font-semibold text-gray-600">Your Estimated App Build <span className="text-sm font-normal">(From, Once-Off)</span></h4>
                            <p className="est-price text-4xl font-bold text-td-purple">R {appTotal.toLocaleString('en-ZA')}</p>
                          </>
                        ) : (
                          <>
                            <h4 className="text-lg font-semibold text-gray-600">Your Estimated Project Total <span className="text-sm font-normal">(Once-Off)</span></h4>
                            <p className="est-price text-4xl font-bold text-td-purple">R {total.toLocaleString('en-ZA')}</p>
                            {appTotal > 0 && (
                              <p className="text-sm text-td-accent font-semibold mt-2">+ R {appTotal.toLocaleString('en-ZA')} for the app build (quoted from)</p>
                            )}
                          </>
                        )}
                        {monthlyTotal > 0 && (
                          <p className="text-sm text-td-accent font-semibold mt-2">+ R {monthlyTotal.toLocaleString('en-ZA')} / month</p>
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">Ready To Get Started?</h3>
                    <p className="text-sm text-gray-600 mb-6">
                        This quotation is an estimation based on your initial selections. The final price may vary based on your specific requirements. 
                        Our team will contact you shortly to schedule a session to finalize your needs, and a comprehensive, official quotation will be formulated thereafter.
                    </p>

                    <div className="client-details grid grid-cols-1 phone-lg:grid-cols-2 gap-4 mb-6">
                        <div className="form-floating col-span-2 md:col-span-1">
                            <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
                            <input type="text" className="form-control w-full p-3 border rounded" id="clientNameInput" placeholder="Your full name" required />
                        </div>
                        <div className="form-floating col-span-2 md:col-span-1">
                            <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
                            <input type="email" className="form-control w-full p-3 border rounded" id="clientEmailInput" placeholder="name@example.com" required />
                        </div>
                        <div className="form-floating col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">Contact Number</label>
                            <input type="tel" className="form-control w-full p-3 border rounded" id="phoneNumberInput" placeholder="Contact number" required />
                        </div>
                        <div className="form-floating col-span-2">
                            <label className="text-xs text-gray-500 mb-1 block">Message</label>
                            <textarea className="form-control w-full p-3 border rounded h-24" placeholder="Type your message here" id="messageTextarea"></textarea>
                        </div>
                    </div>

                    {/* Honeypot — visually and structurally hidden from real users/assistive tech */}
                    <div className="sr-only" aria-hidden="true">
                        <label htmlFor="quoteWebsiteInput">Company Website</label>
                        <input type="text" id="quoteWebsiteInput" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    {status.message && (
                        <div className="mb-4">
                            <FormStatus type={status.type} message={status.message} />
                        </div>
                    )}

                    <div id="submitBtnWrapper" className="submit-btn-wrapper">
                        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto cta-primary inline-block text-[16px] px-[30px] py-[12px] bg-td-purple text-white rounded-[30px] font-semibold disabled:opacity-50 transition-all hover:bg-td-accent">
                            {isSubmitting ? 'Preparing your quote...' : 'Submit Quote Request'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </section>
    </main>
  );
}