'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ContactSnippet from './../../components/ContactSnippet';
import CaseStudyModal from './../../components/CaseStudyModal';
import { caseStudies, CaseStudy } from './../../data/caseStudies';
import HalfCircleTopRight from './../../components/HalfcircleTopRight';
import HalfCircleBottomLeft from './../../components/HalfcircleBottomLeft';


export default function PortfolioPage() {
  const [selectedProject, setSelectedProject] = useState<CaseStudy | null>(null);

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
            <i className="fas fa-arrow-left !bg-transparent !p-0 !text-[10px] mr-1"></i>
            Swipe to see more
            <i className="fas fa-arrow-right !bg-transparent !p-0 !text-[10px] ml-1"></i>
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
          <div className="relative w-full">
            
            <div className="flex flex-row overflow-x-auto md:flex-row md:flex-wrap justify-start md:justify-evenly items-stretch md:items-center snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-5 md:gap-8 relative z-10 max-w-7xl mx-auto px-4 pb-2 md:pb-0 mt-16 sm:mt-24 md:mt-[8rem]">
            
            <div className="flex flex-col items-center justify-between text-white w-[82vw] xs:w-[330px] md:w-full md:max-w-[330px] min-h-[340px] mx-auto shrink-0 snap-center bg-td-purple shadow-[18px_18px_#9972ab] p-[17px] rounded-[6%]">
              <div className="text-center">
                <i className="fas fa-fingerprint text-[30px] !bg-transparent !p-0 mr-[12px]"></i>
                <span className="text-[23px] font-[600] mb-[2px]">Branding</span>
              </div>
              <p className="text-center mt-[25px] text-[16px]">
                In branding, we focus on breeding a solid, and positive perception of your company, and it's products in your customer's mind. Sharing your unique story and differentiating you from your competitors.
              </p>
              <div className="text-center w-full flex flex-col items-center mt-auto">
                <Link href="/services" className="inline-block text-[14px] px-[10px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all hover:bg-white hover:border-td-purple hover:text-td-accent font-[600] w-[60%] mb-[8px]">Packages</Link>
                <Link href="/quote" className="inline-block text-[14px] px-[10px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all hover:bg-white hover:border-td-purple hover:text-td-accent font-[600] w-[60%]">Customise Package</Link>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between text-white w-[82vw] xs:w-[330px] md:w-full md:max-w-[330px] min-h-[340px] mx-auto shrink-0 snap-center bg-td-purple shadow-[18px_18px_#9972ab] p-[17px] rounded-[6%]">
              <div className="text-center">
                <i className="fa fa-desktop text-[29px] !bg-transparent !p-0 mr-[12px]"></i>
                <span className="text-[23px] font-[600] mb-[2px]">Web Design</span>
              </div>
              <p className="text-center mt-[25px] text-[16px]">
                In web design, we focus on organising content layout in a cohesive manner that feeds your customer's attention. With our objective being: to control how your brand is perceived by your customers.
              </p>
              <div className="text-center w-full flex flex-col items-center mt-auto">
                <Link href="/services" className="inline-block text-[14px] px-[10px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all hover:bg-white hover:border-td-purple hover:text-td-accent font-[600] w-[60%] mb-[8px]">Packages</Link>
                <Link href="/quote" className="inline-block text-[14px] px-[10px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all hover:bg-white hover:border-td-purple hover:text-td-accent font-[600] w-[60%]">Customise Package</Link>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between text-white w-[82vw] xs:w-[330px] md:w-full md:max-w-[330px] min-h-[340px] mx-auto shrink-0 snap-center bg-td-purple shadow-[18px_18px_#9972ab] p-[17px] rounded-[6%]">
              <div className="text-center">
                <i className="fa fa-pencil-square-o text-[29px] !bg-transparent !p-0 mr-[12px]"></i>
                <span className="text-[23px] font-[600] mb-[2px]">Graphic Design</span>
              </div>
              <p className="text-center mt-[25px] text-[16px]">
                In graphic design, we focus on communicating and promoting your company's products or services in a visually appealing way that to your company's brand identity.
              </p>
              <div className="text-center w-full flex flex-col items-center mt-auto">
                <Link href="/services" className="inline-block text-[14px] px-[10px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all hover:bg-white hover:border-td-purple hover:text-td-accent font-[600] w-[60%] mb-[8px]">Packages</Link>
                <Link href="/quote" className="inline-block text-[14px] px-[10px] py-[8px] bg-td-accent text-white rounded-[20px] border-[1.7px] border-transparent transition-all hover:bg-white hover:border-td-purple hover:text-td-accent font-[600] w-[60%]">Customise Package</Link>
              </div>
            </div>

          </div>
          </div>

          <p className="md:hidden text-center text-gray-400 text-[12px] mt-3 relative z-10">
            <i className="fas fa-arrow-left !bg-transparent !p-0 !text-[10px] mr-1"></i>
            Swipe to see more
            <i className="fas fa-arrow-right !bg-transparent !p-0 !text-[10px] ml-1"></i>
          </p>

          <HalfCircleBottomLeft />
        </section>

      </main>

      {/* ── Globally Shared Contact Snippet ── */}
      <ContactSnippet />
      
    </>
  );
}