'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FormStatus from './../../components/FormStatus';

// Configure your base prices here (in ZAR)
const PRICING_MAP: Record<string, number> = {
  // Web Selects
  'Informational': 2500, 'E-commerce Store': 8500, 'Portfolio/Personal': 2000, 'Blog/Content Hub': 3500, 'Custom Web Application': 12000,
  'Up to 5 Pages': 1000, '6-10 Pages': 2000, '11-20 Pages': 3500, '20+ Pages': 5000,
  'Yes': 1500, // Copywriting
  'Yes, I need stock images': 800,
  
  // Web Checkboxes
  'Website Security': 500, 'On-Page Optimization': 1200, 'Advanced SEO': 2500, 'Payment Gateway': 1500, 'Booking System': 1800, 
  'User Account Functionality': 2500, 'Custom Functionality': 3000, 'CRM System': 4000,

  // Brand Selects
  '2 Initial Concepts': 1500, '3 Initial Concepts': 2200,
  '2 Platforms': 800, '4 Platforms': 1400,
  '5 Custom Icons': 600, '10 Custom Icons': 1000, '15 Custom Icons': 1400,
  'Social Post Template': 500, 'Digital Ad Banner Template': 600, 'Email Marketing Template': 800,
  'Master Slide Template': 800, '5-10 Slide Template': 1500, '10-20 Slide Template': 2500,
  
  // Brand Checkboxes
  'Logo Variations': 500, 'Color Palette Definition': 400, 'Typography Selection': 400, 'Basic Brand Board': 800, 
  'Letterhead Design': 400, 'Brand Voice': 1200, 'Graphic Patterns': 600, 'Email Signature Design': 300,

  // Digital Selects
  '5 Custom Designs': 1200, '10 Custom Designs': 2200, '20 Custom Designs': 4000,
  '2 Short-Form GIFs': 800, '5 Short-Form GIFs': 1800, '10 Short-Form GIFs': 3200,
  '1 Video (up to 30 seconds)': 1500, '3 Videos (up to 30 seconds each)': 4000, '5 Videos (up to 30 seconds each)': 6000,
  'Basic Infographic (Single-page)': 1200, 'Complex Infographic (Multi-section/Interactive)': 2500,
  'Captions for 5 Posts': 500, 'Captions for 10 Posts': 900, 'Captions for 20 Posts': 1600,
  '3 Ad Banner Sizes/Variations': 900, '5 Ad Banner Sizes/Variations': 1400, 'Custom Ad Banner Set': 2000,
  'Up to 60 Seconds': 3500, '60-90 Seconds': 4500, '90-120 Seconds': 5500,
  'Up to 30 Seconds Animation': 2000, '30-60 Seconds Animation': 3500, 'Custom Animation': 5000,

  // Digital Checkboxes
  'Profile Image Optimization': 300, 'Newsletter Header Design': 500, 'Animated Logo Reveal': 1500,

  // Ongoing Support (billed monthly, kept separate from the once-off project total)
  'Care Plan — Basic': 1800, 'Care Plan — Growth': 3500, 'Care Plan — Scale': 6500,
  // Website Hosting — mutually exclusive tiers, selected via dropdown further down.
  'Hosting — Foundation': 89, 'Hosting — Growth': 159, 'Hosting — Priority': 249,
  'Monthly Content Retainer': 2800, 'Monthly SEO Retainer': 3200,
};


export default function QuotePage() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [features, setFeatures] = useState<string[]>([]);
  const [retainerFeatures, setRetainerFeatures] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Calculator
  useEffect(() => {
    let currentTotal = 0;
    // Add dropdown selections
    Object.values(selections).forEach(val => {
      if (PRICING_MAP[val]) currentTotal += PRICING_MAP[val];
    });
    // Add checked features
    features.forEach(feature => {
      if (PRICING_MAP[feature]) currentTotal += PRICING_MAP[feature];
    });
    setTotal(currentTotal);
  }, [selections, features]);

  // Ongoing Support total — calculated separately since it's a recurring
  // monthly cost, not part of the once-off project estimate above.
  useEffect(() => {
    let currentMonthly = 0;
    retainerFeatures.forEach(item => {
      if (PRICING_MAP[item]) currentMonthly += PRICING_MAP[item];
    });
    setMonthlyTotal(currentMonthly);
  }, [retainerFeatures]);

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
    setRetainerFeatures(prev =>
      checked ? [...prev, value] : prev.filter(f => f !== value)
    );
  };

  // Hosting tiers are mutually exclusive (you're on one plan, not several at
  // once) unlike the Care Plan/retainer checkboxes above, which can stack —
  // so this strips out any previously-selected hosting tier before adding
  // the new one, while still feeding into the same retainerFeatures array
  // (and therefore the same monthly total) as everything else in this section.
  const HOSTING_TIERS = ['Hosting — Foundation', 'Hosting — Growth', 'Hosting — Priority'];
  const handleHostingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setRetainerFeatures(prev => {
      const withoutHosting = prev.filter(f => !HOSTING_TIERS.includes(f));
      return value ? [...withoutHosting, value] : withoutHosting;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const form = e.target as HTMLFormElement;
    
    // Combine selects and checkboxes for the PDF payload
    const combinedSelections = {
        ...selections,
        'Additional Features': features.length > 0 ? features.join(', ') : 'None',
        'Ongoing Support': retainerFeatures.length > 0 ? retainerFeatures.join(', ') : 'None'
    };

    const quoteData = {
      selections: combinedSelections,
      estimatedTotal: total.toLocaleString('en-ZA'),
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
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,4rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  Get Your Custom Package
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  Tailored Solutions for Your Vision
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.0625rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
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

        <div className="intro-container max-w-5xl mx-auto bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-gray-100">
            <form id="quoteForm" onSubmit={handleSubmit}>
                
                {/* Web Design Section */}
                <h4 className="text-xl font-bold text-td-purple mt-6">Web Design</h4>
                <hr className="my-3 border-gray-200" />
                <p className="text-sm text-gray-600 mb-4">This section covers the core elements needed to get your website online and looking great.</p>
                
                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="form-label text-sm font-semibold">Website Type</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Website Type')} value={selections['Website Type'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Informational">Informational</option>
                            <option value="E-commerce Store">E-commerce Store</option>
                            <option value="Portfolio/Personal">Portfolio/Personal</option>
                            <option value="Blog/Content Hub">Blog/Content Hub</option>
                            <option value="Custom Web Application">Custom Web Application</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Number of Pages</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Number of Pages')} value={selections['Number of Pages'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Up to 5 Pages">Up to 5 Pages</option>
                            <option value="6-10 Pages">6-10 Pages</option>
                            <option value="11-20 Pages">11-20 Pages</option>
                            <option value="20+ Pages">20+ Pages</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Copy Writing</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Copy Writing')} value={selections['Copy Writing'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Stock Images</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Stock Images')} value={selections['Stock Images'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Yes, I need stock images">Yes, I need stock images</option>
                            <option value="No">No, I have my own images</option>
                        </select>
                    </div>
                </div>

                <h5 className="font-semibold text-gray-800 mb-2">Web Features</h5>
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
                        <label className="form-label text-sm font-semibold">Primary Logo</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Primary Logo')} value={selections['Primary Logo'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="2 Initial Concepts">2 Initial Concepts</option>
                            <option value="3 Initial Concepts">3 Initial Concepts</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Social Media Profile Pack</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Social Media Pack')} value={selections['Social Media Pack'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="2 Platforms">2 Platforms</option>
                            <option value="4 Platforms">4 Platforms</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Custom Iconography</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Iconography')} value={selections['Iconography'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="5 Custom Icons">5 Custom Icons</option>
                            <option value="10 Custom Icons">10 Custom Icons</option>
                            <option value="15 Custom Icons">15 Custom Icons</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Digital Marketing Template</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Marketing Template')} value={selections['Marketing Template'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Social Post Template">Social Post Template</option>
                            <option value="Digital Ad Banner Template">Digital Ad Banner Template</option>
                            <option value="Email Marketing Template">Email Marketing Template</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Presentation Template</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Presentation Template')} value={selections['Presentation Template'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="No Presentation Template">No Presentation Template</option>
                            <option value="Master Slide Template">Master Slide Template</option>
                            <option value="5-10 Slide Template">5-10 Slide Template</option>
                            <option value="10-20 Slide Template">10-20 Slide Template</option>
                        </select>
                    </div>
                </div>

                <h5 className="font-semibold text-gray-800 mb-2">Brand Identity Features</h5>
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
                        <label className="form-label text-sm font-semibold">Custom Static Graphic Pack</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Static Graphics')} value={selections['Static Graphics'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="5 Custom Designs">5 Custom Designs</option>
                            <option value="10 Custom Designs">10 Custom Designs</option>
                            <option value="20 Custom Designs">20 Custom Designs</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Animated GIF Pack</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'GIF Pack')} value={selections['GIF Pack'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="2 Short-Form GIFs">2 Short-Form GIFs</option>
                            <option value="5 Short-Form GIFs">5 Short-Form GIFs</option>
                            <option value="10 Short-Form GIFs">10 Short-Form GIFs</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Short-Form Social Video</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Social Video')} value={selections['Social Video'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="1 Video (up to 30 seconds)">1 Video (up to 30 seconds)</option>
                            <option value="3 Videos (up to 30 seconds each)">3 Videos (up to 30 seconds each)</option>
                            <option value="5 Videos (up to 30 seconds each)">5 Videos (up to 30 seconds each)</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Infographic Design</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Infographic')} value={selections['Infographic'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Basic Infographic (Single-page)">Basic</option>
                            <option value="Complex Infographic (Multi-section/Interactive)">Complex</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Caption Writing</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Captions')} value={selections['Captions'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Captions for 5 Posts">5 Posts</option>
                            <option value="Captions for 10 Posts">10 Posts</option>
                            <option value="Captions for 20 Posts">20 Posts</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Digital Ad Banner</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Ad Banners')} value={selections['Ad Banners'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="3 Ad Banner Sizes/Variations">3 Variations</option>
                            <option value="5 Ad Banner Sizes/Variations">5 Variations</option>
                            <option value="Custom Ad Banner Set">Custom Set</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Explainer Video</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Explainer Video')} value={selections['Explainer Video'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Up to 60 Seconds">Up to 60 Seconds</option>
                            <option value="60-90 Seconds">60-90 Seconds</option>
                            <option value="90-120 Seconds">90-120 Seconds</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label text-sm font-semibold">Motion Graphics</label>
                        <select className="form-select w-full p-2 border rounded" onChange={(e) => handleSelectChange(e, 'Motion Graphics')} value={selections['Motion Graphics'] || ''}>
                            <option value="">Choose an option</option>
                            <option value="Up to 30 Seconds Animation">Up to 30 Seconds</option>
                            <option value="30-60 Seconds Animation">30-60 Seconds</option>
                            <option value="Custom Animation">Custom</option>
                        </select>
                    </div>
                </div>

                <h5 className="font-semibold text-gray-800 mb-2">Digital Content Features</h5>
                <div className="grid grid-cols-1 phone-lg:grid-cols-2 md:grid-cols-3 gap-3 mb-10">
                    {['Profile Image Optimization', 'Newsletter Header Design', 'Animated Logo Reveal'].map(feat => (
                        <div className="form-check" key={feat}>
                            <input className="form-check-input mr-2" type="checkbox" value={feat} id={feat.replace(/\s+/g, '')} onChange={handleCheckboxChange} checked={features.includes(feat)} />
                            <label className="form-check-label text-sm" htmlFor={feat.replace(/\s+/g, '')}>{feat}</label>
                        </div>
                    ))}
                </div>

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
                  ].map(item => (
                    <div className="form-check" key={item.name}>
                      <input
                        className="form-check-input mr-2"
                        type="checkbox"
                        value={item.name}
                        id={item.name.replace(/\s+/g, '')}
                        onChange={handleRetainerChange}
                        checked={retainerFeatures.includes(item.name)}
                      />
                      <label className="form-check-label text-sm" htmlFor={item.name.replace(/\s+/g, '')} title={item.tooltip}>
                        {item.name}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label htmlFor="hostingTierSelect" className="block text-sm font-semibold text-td-purple mb-2">
                    Website Hosting <span className="text-xs font-normal text-gray-500">(optional — pick one)</span>
                  </label>
                  <select
                    id="hostingTierSelect"
                    className="form-select w-full md:w-auto md:min-w-[320px] text-sm border-gray-300 rounded-md"
                    onChange={handleHostingChange}
                    value={HOSTING_TIERS.find(t => retainerFeatures.includes(t)) || ''}
                  >
                    <option value="">No hosting needed</option>
                    <option value="Hosting — Foundation">Foundation — R89/month (2GB, 5 email accounts)</option>
                    <option value="Hosting — Growth">Growth — R159/month (5GB, 15 email accounts)</option>
                    <option value="Hosting — Priority">Priority — R249/month (10GB, 25 email accounts, priority support)</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Built and hosted by the same team — one invoice, one person to call.</p>
                </div>

                {monthlyTotal > 0 && (
                  <div className="bg-td-purple/5 border border-td-accent/30 rounded-lg p-4 mb-8 flex justify-between items-center">
                    <span className="text-sm font-semibold text-td-purple">Estimated Monthly Retainer</span>
                    <span className="text-xl font-bold text-td-purple">R {monthlyTotal.toLocaleString('en-ZA')} <span className="text-sm font-normal text-gray-500">/ month</span></span>
                  </div>
                )}

                <hr className="my-8 border-gray-300" />

                {/* Checkout / Client Details */}
                <div id="price" className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <div className="est-total text-center mb-6">
                        <h4 className="text-lg font-semibold text-gray-600">Your Estimated Project Total <span className="text-sm font-normal">(Once-Off)</span></h4>
                        <p className="est-price text-4xl font-bold text-td-purple">R {total.toLocaleString('en-ZA')}</p>
                        {monthlyTotal > 0 && (
                          <p className="text-sm text-td-accent font-semibold mt-2">+ R {monthlyTotal.toLocaleString('en-ZA')} / month ongoing support</p>
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