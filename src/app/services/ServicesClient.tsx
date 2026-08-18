'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Icon from '../../components/Icon';
import OrderModal from './../../components/OrderModal';
import PricingCard from './../../components/PricingCard';
import ContactSnippet from './../../components/ContactSnippet';
import { features } from 'process';
import HalfCircleTopRight from './../../components/HalfcircleTopRight';
import HalfCircleBottomLeft from './../../components/HalfcircleBottomLeft';


export default function ServicesClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState('');

    const handleOrderClick = (serviceName: string, features: string[], price: string) => {
        setSelectedService(serviceName);
        setSelectedFeatures(features);
        setSelectedPrice(price);
        setIsModalOpen(true);
    };
  return (
    <>
      {/* ── Static Hero Section ── */}
      <section className="relative block h-screen overflow-x-hidden bg-white w-full pt-[100px] pb-0 md:pt-0 md:pb-0">
        {/* Right 45% Background Image Overlay — desktop/tablet only, competes with text at narrow widths */}
        <div className="hidden md:block absolute top-0 right-0 w-[45%] h-full bg-[url('/branding/hero-background.png')] bg-cover bg-center z-0"></div>

        <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 w-full h-full md:h-auto z-10 flex flex-col md:flex-row justify-start md:justify-center">
          <div className="w-full h-full md:h-auto md:max-w-[93%] md:mx-auto px-0 flex flex-col md:block">
            <div className="flex flex-col md:grid md:grid-cols-2 items-center md:pr-[3%] lg:pr-[8%] gap-0 md:gap-10 lg:gap-12 flex-1 md:flex-none h-full md:h-auto">
              
              <div className="flex flex-col items-center text-center md:items-start md:text-left animate-fadeIn w-full px-6 md:px-0 pb-6 md:pb-0 flex-shrink-0">
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,4rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  Your Audience Is Online
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  Let's Elevate Your Digital Visibility
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.0625rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
                  In today's interconnected world, your potential customers are actively searching for what you offer, right now. It's not enough to simply have an online presence; you need to be seen, remembered, and chosen. We're here to ensure your brand cuts through the noise, connecting powerfully with your ideal audience and transforming passive browsers into engaged clients.
                </p>
                
                <div className="mt-4 ml-0 md:ml-[5px]">
                  <Link href="/quote" className="inline-block text-[14px] px-[15px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold">
                    Get a Custom Quote
                  </Link>
                </div>
              </div>

              <div className="relative w-full bg-td-purple md:bg-transparent flex-1 md:flex-none flex flex-col items-center justify-center md:block overflow-hidden">
                <div className="relative flex justify-center md:justify-end animate-fadeIn">
                <div className="w-[190px] xs:w-[220px] sm:w-[260px] md:w-[280px] lg:w-[340px] xl:w-[400px] 2xl:w-[460px]">
                  <Image src="/branding/services-landing.png" alt="Services" width={500} height={400} className="w-full h-auto object-contain drop-shadow-2xl" priority />
                </div>
              </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <main className="relative py-[2rem] my-[1.5rem]">
        
        {/* ── Services Packages Section ── */}
        <section id="services-page" className="section-wrapper overflow-hidden">
          <h2>Crafting Your Digital Presence</h2>
          <h3 className="heading-text mb-[10px]">Our Core Services in Detail</h3>
          <p className="intro">
            Your vision deserves an extraordinary online home. From brand identity to web design, custom apps, content, and the hosting that keeps it all live — explore the full suite of services designed to take your idea from concept to something real, and keep it running.
          </p>
          <HalfCircleTopRight />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 md:mt-[8rem] relative z-10 flex flex-col gap-16 md:gap-24">
            
    
            
  {/* Brand Identity Packages */}
  <div className="w-full">
    <h4 className="text-center text-[24px] font-[700] text-td-purple mb-10 uppercase">Brand Identity Packages</h4>
    <p className="text-center text-gray-500 text-[14px] max-w-xl mx-auto -mt-6 mb-10">
      Your visual identity, built to earn trust before you've said a word — logo, colour, typography, and the guidelines to keep it all consistent.
    </p>
    <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-4 md:gap-6 items-stretch md:items-center pb-2 md:pb-0 px-1 md:px-0">
      <PricingCard 
        title="Launchpad" price="3,500" description="Igniting Your Brand's Digital Journey"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick} 
        features={[
          { name: "Primary Logo Design", tooltip: "Crafting a unique and versatile logo that encapsulates your brand's essence." },
          { name: "Logo Variations", tooltip: "Including secondary marks and favicons for diverse applications." },
          { name: "Color Palette Definition", tooltip: "A curated set of primary and secondary colors with precise codes." },
          { name: "Typography Selection", tooltip: "Recommendation of primary and secondary fonts for headlines and body text." },
          { name: "Basic Brand Board", tooltip: "A concise one-page guide showcasing your logo, colors, and fonts." },
          { name: "Essential Digital Assets", tooltip: "Profile images for 2-3 key social media platforms." }
        ]}
      />
      <PricingCard 
        title="Elevate & Expand" price="7,500" description="Amplify your Brand Reach" isPopular={true}
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "The Launchpad Package", tooltip: "Everything in The Launchpad Package." },
          { name: "Comprehensive Brand Style Guide", tooltip: "A multi-page document detailing logo usage, hierarchy, and tone." },
          { name: "Full Stationery Suite", tooltip: "Professional designs for business cards, letterheads, and email signatures." },
          { name: "Social Media Kit", tooltip: "Optimized profile pictures, covers, and 3-5 custom post templates." },
          { name: "Basic Iconography Set", tooltip: "A small collection of custom icons to enhance your digital presence." },
          { name: "Marketing Collateral Design", tooltip: "Choose from a flyer, brochure, or presentation template design." }
        ]}
      />
      <PricingCard 
        title="Pinnacle Identity" price="14,000" description="Forging an Unforgettable Brand Legacy"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "Elevate & Expand Package", tooltip: "Everything in The Elevate & Expand Package." },
          { name: "In-depth Brand Strategy Workshop", tooltip: "Session delving into market positioning and messaging framework." },
          { name: "Extensive Imagery Guidelines", tooltip: "Recommendations for photography style or illustration direction." },
          { name: "Custom Graphic Elements", tooltip: "Unique visual elements to enrich your brand's aesthetic." },
          { name: "Corporate Presentation Template", tooltip: "A professional, on-brand template for pitches and communications." },
          { name: "Brand Voice Guidelines", tooltip: "Detailed instructions on how your brand communicates." }
        ]}
      />
    </div>
    <p className="md:hidden text-center text-gray-400 text-[12px] mt-3">
      <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
      Swipe to see more
      <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
    </p>
  </div>

  {/* Web Design Packages */}
  <div className="w-full">
    <h4 className="text-center text-[24px] font-[700] text-td-purple mb-10 uppercase">Web Design Packages</h4>
    <p className="text-center text-gray-500 text-[14px] max-w-xl mx-auto -mt-6 mb-10">
      A site engineered to load fast, work on any device, and actually turn visitors into enquiries — not just look good in a screenshot.
    </p>
    <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-4 md:gap-6 items-stretch md:items-center pb-2 md:pb-0 px-1 md:px-0">
      <PricingCard 
        title="Digital Launchpad" price="6,500" description="Building Your Online Foundation with Impact"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "Custom Website Design", tooltip: "Up to 5 Pages tailored to reflect your brand's unique identity." },
          { name: "Responsive Web Development", tooltip: "Functions flawlessly across all devices (desktop, tablet, mobile)." },
          { name: "Basic Content Integration", tooltip: "Placement of your provided text and images." },
          { name: "Initial SEO Setup", tooltip: "Fundamental search engine optimization to help discoverability." },
          { name: "Contact Form Integration", tooltip: "A simple way for visitors to get in touch." }
        ]}
      />
      <PricingCard 
        title="Online Accelerator" price="14,500" description="Amplify Presence, Cultivate Engagement" isPopular={true}
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "The Digital Launchpad", tooltip: "Everything in The Digital Launchpad package." },
          { name: "Custom Website Design (10 Pages)", tooltip: "More robust design to accommodate broader content." },
          { name: "Advanced UI/UX Enhancements", tooltip: "Implementing intuitive navigation and engaging interfaces." },
          { name: "E-commerce Integration (Basic)", tooltip: "Setup of a foundational online store with essential listings." },
          { name: "CMS Setup", tooltip: "Empowering you to easily update and manage content." },
          { name: "Blog Section Integration", tooltip: "A dynamic area to share updates and engage your audience." }
        ]}
      />
      <PricingCard 
        title="Digital Dominator" price="28,000+" description="Elevate Online Experiences, Drive Growth"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "The Online Accelerator", tooltip: "Everything in The Online Accelerator package." },
          { name: "Custom Website Design (15+ Pages)", tooltip: "Complex architecture and design for large-scale content flows." },
          { name: "Advanced E-commerce Solutions", tooltip: "Full-scale online store setup with inventory management." },
          { name: "API Integrations", tooltip: "Connecting your website seamlessly with third-party tools (CRM, ERP)." },
          { name: "Performance Optimization", tooltip: "Rigorous measures for speed, stability, and threat protection." },
          { name: "Advanced SEO & Support", tooltip: "Comprehensive plan for organic visibility and post-launch support." }
        ]}
      />
    </div>
    <p className="md:hidden text-center text-gray-400 text-[12px] mt-3">
      <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
      Swipe to see more
      <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
    </p>
  </div>

  {/* Digital Content Packages */}
  <div className="w-full">
    <h4 className="text-center text-[24px] font-[700] text-td-purple mb-10 uppercase">Digital Content Packages</h4>
    <p className="text-center text-gray-500 text-[14px] max-w-xl mx-auto -mt-6 mb-10">
      The graphics, video, and copy that keep your brand alive between projects — because a great website still needs something to say.
    </p>
    <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-4 md:gap-6 items-stretch md:items-center pb-2 md:pb-0 px-1 md:px-0">
      <PricingCard 
        title="Storyteller Starter" price="4,000" description="Engagement Through Compelling Visuals"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "Social Media Graphics", tooltip: "5 visually striking static designs optimized for social platforms." },
          { name: "Responsive Web Development", tooltip: "Your site will look and function flawlessly across all devices." },
          { name: "Animated GIFs", tooltip: "2 short-form, engaging, looping animations perfect for social or email." },
          { name: "Basic Digital Ad Banners", tooltip: "3 eye-catching variations for online advertising campaigns." },
          { name: "Image Curation & Optimization", tooltip: "Selection of high-quality stock images or optimization of your photos." }
        ]}
      />
      <PricingCard 
        title="Impact Maximizer" price="8,500" description="Dynamic Content, Clear Message" isPopular={true}
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "The Storyteller Starter", tooltip: "Everything in The Storyteller Starter package." },
          { name: "In-depth Content Calendar", tooltip: "Collaborative development of a schedule aligned with your objectives." },
          { name: "Social Media Video", tooltip: "A professionally edited video (up to 30s) optimized for platforms." },
          { name: "Infographic Design", tooltip: "Transforming complex data into an engaging, shareable visual story." },
          { name: "Custom Iconography Set", tooltip: "5-7 bespoke icons to enhance your website or content." },
          { name: "Newsletter Header Design", tooltip: "A custom header that visually elevates your email communications." }
        ]}
      />
      <PricingCard 
        title="Narrative Designer" price="15,000" description="Crafting Cross-Platform Experiences"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "The Impact Maximizer", tooltip: "Everything in The Impact Maximizer package." },
          { name: "Full Digital Content Strategy", tooltip: "Holistic plan covering themes, formats, and distribution channels." },
          { name: "Explainer Video", tooltip: "Detailed video (up to 90s) to articulate your brand or product." },
          { name: "Interactive Content Element", tooltip: "Design for a quiz, poll, or interactive infographic to boost engagement." },
          { name: "Motion Graphics", tooltip: "Dynamic visual elements for intros, outros, or brand animations." },
          { name: "Custom Branded Templates", tooltip: "Ensuring visual consistency for internal and external communications." }
        ]}
      />
    </div>
    <p className="md:hidden text-center text-gray-400 text-[12px] mt-3">
      <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
      Swipe to see more
      <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
    </p>
  </div>

  {/* Website Hosting Packages */}
  <div className="w-full">
    <h4 className="text-center text-[24px] font-[700] text-td-purple mb-10 uppercase">Website Hosting</h4>
    <p className="text-center text-gray-500 text-[14px] max-w-xl mx-auto -mt-6 mb-10">
      Built and hosted by the same team, so there's one person to call, not three. Billed monthly, cancel any time.
    </p>
    <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-4 md:gap-6 items-stretch md:items-center pb-2 md:pb-0 px-1 md:px-0">
      <PricingCard 
        title="Foundation" price="89" period="/month" description="Reliable Hosting For Your Launch"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        buttonText="Get Hosted"
        features={[
          { name: "2GB SSD Storage", tooltip: "Ample room for a focused brochure or informational website." },
          { name: "5 Email Accounts", tooltip: "Professional @yourdomain addresses for you and your team." },
          { name: "Free SSL Certificate", tooltip: "Every visitor connects securely, automatically — no extra cost." },
          { name: "Free Daily Backups", tooltip: "Your site is backed up every day, so nothing is ever truly lost." },
          { name: "Standard Support", tooltip: "Email support with a response time you can rely on." }
        ]}
      />
      <PricingCard 
        title="Growth" price="159" period="/month" description="Room To Scale, Built For Business" isPopular={true}
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        buttonText="Get Hosted"
        features={[
          { name: "5GB SSD Storage", tooltip: "Comfortable headroom for e-commerce, blogs, and growing content." },
          { name: "15 Email Accounts", tooltip: "Enough professional addresses for a full small team." },
          { name: "Free SSL Certificate", tooltip: "Every visitor connects securely, automatically — no extra cost." },
          { name: "Free Daily Backups", tooltip: "Your site is backed up every day, so nothing is ever truly lost." },
          { name: "Standard Support", tooltip: "Email support with a response time you can rely on." }
        ]}
      />
      <PricingCard 
        title="Priority" price="249" period="/month" description="Priority Performance For Serious Sites"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        buttonText="Get Hosted"
        features={[
          { name: "10GB SSD Storage", tooltip: "Generous space for content-heavy or higher-traffic sites." },
          { name: "25 Email Accounts", tooltip: "Room for your whole team, with space left to grow." },
          { name: "Free SSL Certificate", tooltip: "Every visitor connects securely, automatically — no extra cost." },
          { name: "Free Daily Backups", tooltip: "Your site is backed up every day, so nothing is ever truly lost." },
          { name: "Priority Support Response", tooltip: "Jump the queue when something needs our attention fast." }
        ]}
      />
    </div>
    <p className="md:hidden text-center text-gray-400 text-[12px] mt-3">
      <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
      Swipe to see more
      <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
    </p>

    {/* Email — for anyone who just wants a professional inbox, no website required */}
    <h5 className="text-center text-[17px] font-[700] text-td-purple mt-16 mb-2 uppercase tracking-wide">Just Need Email?</h5>
    <p className="text-center text-gray-500 text-[13.5px] max-w-xl mx-auto mb-8">
      No website yet, or already hosted elsewhere? Get a professional @yourdomain inbox on its own.
    </p>
    <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-4 md:gap-6 items-stretch md:items-center pb-2 md:pb-0 px-1 md:px-0">
      <PricingCard 
        title="Email Starter" price="35" period="/month" description="A Professional Inbox, Simply"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        buttonText="Get Email"
        features={[
          { name: "5 Mailboxes", tooltip: "Room for you and a small team, each with their own @yourdomain address." },
          { name: "2GB Storage Per Mailbox", tooltip: "Enough for years of everyday business email." },
          { name: "Webmail & Mobile Access", tooltip: "Check your inbox from any device, anywhere." },
          { name: "Standard Support", tooltip: "Email support with a response time you can rely on." }
        ]}
      />
      <PricingCard 
        title="Email Team" price="65" period="/month" description="For A Growing Team" isPopular={true}
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        buttonText="Get Email"
        features={[
          { name: "15 Mailboxes", tooltip: "Enough professional addresses for a full small team." },
          { name: "5GB Storage Per Mailbox", tooltip: "Comfortable headroom for attachments and archives." },
          { name: "Webmail & Mobile Access", tooltip: "Check your inbox from any device, anywhere." },
          { name: "Standard Support", tooltip: "Email support with a response time you can rely on." }
        ]}
      />
      <PricingCard 
        title="Email Business" price="99" period="/month" description="For Established Teams"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        buttonText="Get Email"
        features={[
          { name: "30 Mailboxes", tooltip: "Room for your whole team, with space left to grow." },
          { name: "10GB Storage Per Mailbox", tooltip: "Generous space for even the heaviest email users." },
          { name: "Webmail & Mobile Access", tooltip: "Check your inbox from any device, anywhere." },
          { name: "Priority Support Response", tooltip: "Jump the queue when something needs our attention fast." }
        ]}
      />
    </div>
    <p className="md:hidden text-center text-gray-400 text-[12px] mt-3">
      <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
      Swipe to see more
      <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
    </p>
  </div>

  {/* App Development Packages */}
  <div className="w-full">
    <h4 className="text-center text-[24px] font-[700] text-td-purple mb-10 uppercase">App Development</h4>
    <p className="text-center text-gray-500 text-[14px] max-w-xl mx-auto -mt-6 mb-10">
      From an installable, offline-ready web app to a fully custom platform with real business logic behind it.
    </p>
    <div className="flex flex-row overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-4 md:gap-6 items-stretch md:items-center pb-2 md:pb-0 px-1 md:px-0">
      <PricingCard 
        title="App Essentials" price="14,500" description="Installable, Offline-Ready, Yours"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "Progressive Web App Build", tooltip: "Your site becomes installable straight from the browser, no app store needed." },
          { name: "Offline Capability", tooltip: "Core pages stay accessible even with a patchy connection." },
          { name: "Add-to-Home-Screen", tooltip: "Visitors get a real app icon on their phone, launching like a native app." },
          { name: "Push Notification Ready", tooltip: "The technical foundation for re-engaging visitors is in place from day one." }
        ]}
      />
      <PricingCard 
        title="App Growth" price="32,000" description="Real Functionality, Built For You" isPopular={true}
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "User Accounts & Authentication", tooltip: "Visitors can sign up, log in, and have their own space." },
          { name: "Database-Backed Dashboard", tooltip: "A real, working dashboard your users actually interact with." },
          { name: "One Core Workflow", tooltip: "A booking system, client portal, or scheduling tool — built around what your business actually needs." },
          { name: "Mobile-Responsive Throughout", tooltip: "Every screen works properly, on every device." }
        ]}
      />
      <PricingCard 
        title="App Priority" price="55,000" description="Complex Logic, Built To Scale"
        className="shrink-0 snap-center w-[82vw] xs:w-[345px] md:w-auto"
        onOrder={handleOrderClick}
        features={[
          { name: "Multi-User Roles & Permissions", tooltip: "Different people see and can do different things, exactly as your business requires." },
          { name: "Payment Integration", tooltip: "Real transactions, handled securely through a trusted payment gateway." },
          { name: "Admin Dashboard", tooltip: "A control panel for managing the app without touching a line of code." },
          { name: "Third-Party API Integrations", tooltip: "Connecting your app to the other tools your business already relies on." }
        ]}
      />
    </div>
    <p className="md:hidden text-center text-gray-400 text-[12px] mt-3">
      <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
      Swipe to see more
      <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
    </p>
  </div>

  {/* Drop the modal right here at the bottom of the container */}
  <OrderModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
      serviceName={selectedService} 
      serviceFeatures={selectedFeatures}
      servicePrice={selectedPrice}
  />
</div>

          <HalfCircleBottomLeft />
        </section>

        {/* ── Testimonials Section ── */}
        <section id="testimonials" className="section-wrapper overflow-hidden">
          <h2>Our Clients' Experiences</h2>
          <h3 className="heading-text mb-[10px]">Genuine Reviews and Stories</h3>
          <p className="intro">
            See the impact we've made on businesses and individuals alike. Browse our customer reviews and discover their success stories.
          </p>
          <HalfCircleTopRight />
          <div className="relative w-full">
            
            <div className="flex flex-row md:flex-row overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] justify-start md:justify-evenly items-stretch md:items-center p-0 pb-2 md:pb-0 mt-24 sm:mt-32 md:mt-[18rem] relative z-10 md:flex-wrap gap-x-5 md:gap-x-8 gap-y-0 max-w-7xl mx-auto px-4 scroll-smooth">
            
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col w-[82vw] xs:w-[300px] md:w-full md:max-w-[330px] min-h-[397px] mx-auto shrink-0 snap-center">
                <div className="flex flex-col items-center bg-td-accent text-white rounded-t-[35px] py-[1.5rem] relative flex-1">
                  <div className="absolute -top-[62px]">
                    <Image src="/branding/DisplayPic.jpg" alt="Client" width={125} height={125} className="rounded-full border-[4px] border-td-purple w-[125px] h-[125px] object-cover" />
                  </div>
                  <div className="text-center mt-[70px]">
                    <span className="text-[19px] font-[500] block mb-[6px]">"Thabo Mtsweni"</span>
                    <span className="text-[14px] block mb-[6px]">White Lines, Co-founder</span>
                    <div className="mb-[12px] flex justify-center gap-1">
                      <Icon name="facebook" size={16} className="-facebook-square !text-td-purple !p-[3px] !text-[16px] hover:!text-white transition-colors" />
                      <Icon name="instagram" size={16} className="-instagram !text-td-purple !p-[3px] !text-[16px] hover:!text-white transition-colors" />
                      <Icon name="linkedin" size={16} className="-linkedin-in !text-td-purple !p-[3px] !text-[16px] hover:!text-white transition-colors" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center bg-td-purple text-white rounded-b-[35px] text-center py-[1.5rem] px-4 flex-1">
                  <q className="mb-[1rem] text-[14px] text-center block">
                    Not only did Touch Media deliver on what they promised but they exceeded my expectation. My friends are even asking who made the website for me.
                  </q>
                  <Link href="/work" className="inline-block text-[14px] px-[10px] py-[10px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-white hover:border-td-purple hover:text-td-accent font-semibold">
                    View Project
                  </Link>
                </div>
              </div>
            ))}
          </div>
          </div>

          <p className="md:hidden text-center text-gray-400 text-[12px] mt-3 relative z-10">
            <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
            Swipe to see more
            <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
          </p>

          <HalfCircleBottomLeft />
        </section>
      </main>

      {/* ── Globally Shared Contact Snippet ── */}
      <ContactSnippet />
      
    </>
  );
}