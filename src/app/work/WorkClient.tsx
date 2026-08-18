'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ContactSnippet from './../../components/ContactSnippet';
import CaseStudyModal from './../../components/CaseStudyModal';
import ConsultationModal from './../../components/ConsultationModal';
import { caseStudies, CaseStudy } from './../../data/caseStudies';
import HalfCircleTopRight from './../../components/HalfcircleTopRight';
import HalfCircleBottomLeft from './../../components/HalfcircleBottomLeft';


export default function WorkClient() {
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* ── Static Hero Section ── */}
      <section className="relative block h-screen overflow-x-hidden bg-white w-full pt-[100px] pb-0 md:pt-0 md:pb-0">
        <div className="hidden md:block absolute top-0 right-0 w-[45%] h-full bg-[url('/branding/hero-background.png')] bg-cover bg-center z-0"></div>

        <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 w-full h-full md:h-auto z-10 flex flex-col md:flex-row justify-start md:justify-center">
          <div className="w-full h-full md:h-auto md:max-w-[93%] md:mx-auto px-0 flex flex-col md:block">
            <div className="flex flex-col md:grid md:grid-cols-2 items-center md:pr-[3%] lg:pr-[8%] gap-0 md:gap-10 lg:gap-12 flex-1 md:flex-none h-full md:h-auto">
              
              <div className="flex flex-col items-center text-center md:items-start md:text-left animate-fadeIn w-full px-6 md:px-0 pb-6 md:pb-0 flex-shrink-0">
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,4rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  From Idea to Impact
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  Discover Our Capabilities
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.0625rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
                  At Touch Domain, we believe a remarkable online presence begins with exceptional design. We transform your core ideas into captivating digital experiences, ensuring your brand truly stands out. Discover how our expert web design, development, and graphic design services can elevate your vision and connect powerfully with your audience.
                </p>
                
                <div className="mt-4 ml-0 md:ml-[5px]">
                  <Link href="/quote" className="inline-block text-[14px] px-[15px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold">
                    Tell Us About Your Project
                  </Link>
                </div>
              </div>

              <div className="relative w-full bg-td-purple md:bg-transparent flex-1 md:flex-none flex flex-col items-center justify-center md:block overflow-hidden">
                <div className="relative flex justify-center md:justify-end animate-fadeIn">
                <div className="w-[190px] xs:w-[220px] sm:w-[260px] md:w-[280px] lg:w-[340px] xl:w-[400px] 2xl:w-[460px]">
                  {/* Ensure portfolio-landing.png is in your public/branding/ folder */}
                  <Image src="/branding/portfolio-landing.png" alt="Portfolio" width={500} height={400} className="w-full h-auto object-contain drop-shadow-2xl" priority />
                </div>
              </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <main className="relative py-[2rem] my-[1.5rem]">
        
        {/* ── Portfolio Section ── */}
        <section id="work-page" className="section-wrapper overflow-hidden">
          <h2>Our Impactful Creations</h2>
          <h3 className="heading-text mb-[10px]">Explore Our Work and See the Results</h3>
          <p className="intro">
            Our portfolio showcases how we transform unique ideas into captivating online realities. Explore our work and discover the tangible impact we've delivered for our clients.
          </p>
          <HalfCircleTopRight />
          <div className="relative w-full">
            

            {/* Portfolio Grid — Challenge / Approach / Result structure.
                Add real projects in src/data/caseStudies.ts as you complete them. */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 md:mt-[10rem] mb-2 md:mb-[7rem] relative z-10 flex flex-row overflow-x-auto md:flex-row md:flex-wrap justify-start md:justify-center snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-6 md:gap-10 pb-2 md:pb-0">
            
            {caseStudies.map((project) => (
              <div key={project.slug} className="flex flex-col w-[85vw] xs:w-[350px] md:w-[350px] shrink-0 snap-center bg-white rounded-[20px] shadow-[0px_5px_15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transition-transform duration-300 hover:-translate-y-2">
                
                {/* Project Image */}
                <div className="relative w-full h-[200px] bg-slate-100">
                  <Image 
                    src={project.image} 
                    alt={project.clientName} 
                    fill 
                    className="object-cover" 
                  />
                  <span className="absolute top-3 left-3 bg-td-purple text-white text-[11px] font-[700] uppercase tracking-wide px-3 py-1 rounded-full">
                    {project.category}
                  </span>
                </div>

                {/* Condensed card — full Challenge/Approach/Result now lives in the modal,
                    triggered by "View Case Study", so a card is a quick glance rather than
                    a long scroll in its own right. */}
                <div className="p-5 flex flex-col gap-1">
                  <h4 className="text-td-purple font-[700] text-[17px] leading-tight">{project.clientName}</h4>
                  <p className="text-gray-500 text-[13px] leading-snug line-clamp-2">{project.challenge}</p>
                </div>
                
                <div className="flex flex-row justify-center gap-3 pb-[20px] px-[20px] mt-auto">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="inline-block text-[13.5px] px-[16px] py-[8px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-purple hover:text-td-purple font-semibold flex-1 text-center"
                  >
                    View Case Study
                  </button>
                  <a href={project.liveUrl || '#'} target="_blank" rel="noopener noreferrer" className="inline-block text-[13.5px] px-[16px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-white hover:border-td-purple hover:text-td-accent font-semibold flex-1 text-center">
                    Visit Website
                  </a>
                </div>
              </div>
            ))}

          </div>
          </div>

          <CaseStudyModal project={selectedProject} onClose={() => setSelectedProject(null)} />

          <p className="md:hidden text-center text-gray-400 text-[12px] mt-1 mb-8 relative z-10">
            <span className="inline-block mr-1 animate-swipeLeft" aria-hidden="true">&larr;</span>
            Swipe to see more
            <span className="inline-block ml-1 animate-swipeRight" aria-hidden="true">&rarr;</span>
          </p>

          <p className="text-center text-gray-400 text-[13px] max-w-2xl mx-auto mb-16 md:mb-[7rem] relative z-10">
            Have we worked together? We'd love to feature it here — <Link href="/review" className="text-td-accent underline hover:text-td-purple">leave us a review</Link> and let us know.
          </p>

          <HalfCircleBottomLeft />
        </section>

        {/* ── Services Shared Intro Section ── */}
        <section id="services-intro" className="section-wrapper overflow-hidden">
          <h2>From an Idea to Online Creation</h2>
          <h3 className="heading-text mb-[10px]">Choose a Package or Fully Customize Your Solution</h3>
          <p className="intro">
            Our expert team turns your innovative concepts into impactful online realities. Choose a package for efficiency, or let us build a custom solution for exceptional results.
          </p>
          <HalfCircleTopRight />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 relative z-10 max-w-7xl mx-auto px-4">

            <div className="flex flex-col text-white min-h-[300px] bg-td-purple p-5 rounded-[16px]">
              <div className="flex items-center justify-center gap-2 mb-3">
                {/* fa-fingerprint has no clean FontAwesome v4 equivalent and is a
                    meaningfully better fit for "Branding" than the site's other
                    v4-style icons — kept as a deliberate exception rather than
                    forced into a worse icon just for prefix consistency. */}
                <i className="fas fa-fingerprint text-[22px] !bg-transparent !p-0"></i>
                <span className="text-[19px] font-[600]">Branding</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[14px] leading-relaxed">
                  In branding, we focus on building a solid, positive perception of your company and its products in your customer's mind — sharing your story and differentiating you from competitors.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/services" className="flex-1 text-center text-[13px] px-3 py-2 bg-white text-td-purple rounded-[20px] font-[600] transition-all hover:bg-td-accent hover:text-white">Packages</Link>
                <Link href="/quote" className="flex-1 text-center text-[13px] px-3 py-2 border border-white/40 text-white rounded-[20px] font-[600] transition-all hover:bg-white/10">Customise</Link>
              </div>
            </div>

            <div className="flex flex-col text-white min-h-[300px] bg-td-purple p-5 rounded-[16px]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <i className="fa fa-desktop text-[22px] !bg-transparent !p-0"></i>
                <span className="text-[19px] font-[600]">Web design</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[14px] leading-relaxed">
                  In web design, we focus on organising content in a way that holds your customer's attention, controlling how your brand is perceived from the first click.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/services" className="flex-1 text-center text-[13px] px-3 py-2 bg-white text-td-purple rounded-[20px] font-[600] transition-all hover:bg-td-accent hover:text-white">Packages</Link>
                <Link href="/quote" className="flex-1 text-center text-[13px] px-3 py-2 border border-white/40 text-white rounded-[20px] font-[600] transition-all hover:bg-white/10">Customise</Link>
              </div>
            </div>

            <div className="flex flex-col text-white min-h-[300px] bg-td-purple p-5 rounded-[16px]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <i className="fa fa-pencil text-[22px] !bg-transparent !p-0"></i>
                <span className="text-[19px] font-[600]">Graphic design</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[14px] leading-relaxed">
                  In graphic design, we focus on communicating and promoting your products in a visually appealing way that stays true to your brand identity.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/services" className="flex-1 text-center text-[13px] px-3 py-2 bg-white text-td-purple rounded-[20px] font-[600] transition-all hover:bg-td-accent hover:text-white">Packages</Link>
                <Link href="/quote" className="flex-1 text-center text-[13px] px-3 py-2 border border-white/40 text-white rounded-[20px] font-[600] transition-all hover:bg-white/10">Customise</Link>
              </div>
            </div>

            <div className="flex flex-col text-white min-h-[300px] bg-td-purple p-5 rounded-[16px]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <i className="fa fa-server text-[22px] !bg-transparent !p-0"></i>
                <span className="text-[19px] font-[600]">Hosting</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[14px] leading-relaxed">
                  Built and hosted by the same team, so there's one person to call, not three — secure daily backups, real email under your own domain, billed monthly, cancel any time.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/services" className="flex-1 text-center text-[13px] px-3 py-2 bg-white text-td-purple rounded-[20px] font-[600] transition-all hover:bg-td-accent hover:text-white">Packages</Link>
                <Link href="/quote" className="flex-1 text-center text-[13px] px-3 py-2 border border-white/40 text-white rounded-[20px] font-[600] transition-all hover:bg-white/10">Customise</Link>
              </div>
            </div>

            <div className="flex flex-col text-white min-h-[300px] bg-td-purple p-5 rounded-[16px]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <i className="fa fa-mobile text-[22px] !bg-transparent !p-0"></i>
                <span className="text-[19px] font-[600]">App development</span>
              </div>
              <div className="flex-1 flex items-center">
                <p className="text-[14px] leading-relaxed">
                  From an installable, offline-ready web app to a fully custom platform with accounts, dashboards, and the workflows your business actually needs.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/services" className="flex-1 text-center text-[13px] px-3 py-2 bg-white text-td-purple rounded-[20px] font-[600] transition-all hover:bg-td-accent hover:text-white">Packages</Link>
                <Link href="/quote" className="flex-1 text-center text-[13px] px-3 py-2 border border-white/40 text-white rounded-[20px] font-[600] transition-all hover:bg-white/10">Customise</Link>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center min-h-[300px] !bg-td-purple/10 p-5 rounded-[16px]">
              <i className="fa fa-comments text-[26px] text-td-purple !bg-transparent !p-0 mb-2"></i>
              <p className="text-[15px] font-[600] text-td-purple mb-1">Not sure which you need?</p>
              <p className="text-[13px] text-td-purple/80 mb-4">Get a free consultation and we'll point you the right way.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-[13px] px-5 py-2 bg-td-purple text-white rounded-[20px] font-[600] transition-all hover:bg-td-accent">Talk to us</button>
            </div>

          </div>

          <HalfCircleBottomLeft />
        </section>

      </main>

      {/* ── Globally Shared Contact Snippet ── */}
      <ContactSnippet />

      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}