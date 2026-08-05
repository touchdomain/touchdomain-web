'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ContactSnippet from './../../components/ContactSnippet';
import ConsultationModal from './../../components/ConsultationModal';
import HalfCircleTopRight from '../../components/HalfcircleTopRight';
import HalfCircleBottomLeft from '../../components/HalfcircleBottomLeft';


export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* ── Static Hero Section ── */}
      <section className="relative block h-screen overflow-x-hidden bg-white w-full pt-[100px] pb-0 md:pt-0 md:pb-0">
        {/* Right 45% Background Image Overlay — desktop/tablet only */}
        <div className="hidden md:block absolute top-0 right-0 w-[45%] h-full bg-[url('/branding/hero-background.png')] bg-cover bg-center z-0"></div>

        <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 w-full h-full md:h-auto z-10 flex flex-col md:flex-row justify-start md:justify-center">
          <div className="w-full h-full md:h-auto md:max-w-[93%] md:mx-auto px-0 flex flex-col md:block">
            <div className="flex flex-col md:grid md:grid-cols-2 items-center md:pr-[3%] lg:pr-[8%] gap-0 md:gap-10 lg:gap-12 flex-1 md:flex-none h-full md:h-auto">
              
              <div className="flex flex-col items-center text-center md:items-start md:text-left animate-fadeIn w-full px-6 md:px-0 pb-6 md:pb-0 flex-shrink-0">
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,4rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  We Are About You
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  Here Is Our Story
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.0625rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
                  Just as we craft visually striking websites that captivate from the start, our story at Touch Domain began with a vision to revolutionize online engagement. We specialize in bringing brands to life digitally through expert web design, development, and compelling graphic design — then we host it, keep it running, and stick around long after launch. We partner closely with you to create custom solutions that not only meet your unique needs but also tell your distinct brand story in a captivating online experience.
                </p>
                
                <div className="mt-4 ml-0 md:ml-[5px]">
                  <button onClick={() => setIsModalOpen(true)} className="inline-block text-[14px] px-[15px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold">
                    Let's Talk
                  </button>
                </div>
              </div>

              <div className="relative w-full bg-td-purple md:bg-transparent flex-1 md:flex-none flex flex-col items-center justify-center md:block overflow-hidden">
                <div className="relative flex justify-center md:justify-end animate-fadeIn">
                <div className="w-[190px] xs:w-[220px] sm:w-[260px] md:w-[280px] lg:w-[340px] xl:w-[400px] 2xl:w-[460px]">
                  <Image 
                    src="/branding/about-landing.png" 
                    alt="About page landing page" 
                    width={500} 
                    height={400} 
                    className="w-full h-auto object-contain drop-shadow-2xl" 
                    priority 
                  />
                </div>
              </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <main className="relative py-[2rem] my-[1.5rem]">
        
        {/* ── About Section ── */}
        <section id="about-page" className="section-wrapper overflow-hidden">
          <h2>Our Blueprint for Digital Excellence</h2>
          <h3 className="heading-text mb-[10px]">Our Foundation & Your Advantage</h3>
          <p className="intro">
            Most agencies do one thing — a logo, or a website, or your social content. We do all four under one roof — brand, build, content, and hosting — as one coherent identity, with a real plan for what comes after launch, not just a handshake and an invoice.
          </p>
          <HalfCircleTopRight />
          <div className="flex flex-col md:flex-row justify-around items-center mt-20 sm:mt-28 md:mt-[13rem] mx-4 sm:mx-8 mb-16 md:mb-[7rem] relative z-10 max-w-7xl md:mx-auto">
            
            <div className="w-full md:w-[60%]">
              <nav className="w-full border-b-[2px] border-td-accent mb-[14px] text-[18px]">
                <div className="flex">
                  <button onClick={() => setActiveTab('mission')} className={`px-4 pb-[8px] -mb-[2.1px] font-[500] bg-transparent outline-none ${activeTab === 'mission' ? 'text-td-purple border-[2px] border-b-0 border-td-accent text-[22px]' : 'text-td-accent border-b-[2px] border-transparent hover:text-td-purple'}`}>Mission</button>
                  <button onClick={() => setActiveTab('vision')} className={`px-4 pb-[8px] -mb-[2.1px] font-[500] bg-transparent outline-none ${activeTab === 'vision' ? 'text-td-purple border-[2px] border-b-0 border-td-accent text-[22px]' : 'text-td-accent border-b-[2px] border-transparent hover:text-td-purple'}`}>Vision</button>
                  <button onClick={() => setActiveTab('values')} className={`px-4 pb-[8px] -mb-[2.1px] font-[500] bg-transparent outline-none ${activeTab === 'values' ? 'text-td-purple border-[2px] border-b-0 border-td-accent text-[22px]' : 'text-td-accent border-b-[2px] border-transparent hover:text-td-purple'}`}>Values</button>
                </div>
              </nav>
              
              <div className="ml-[5px]">
                {activeTab === 'mission' && (
                  <>
                    <p className="mb-[12px]">We strive to be recognized for delivering exceptionally user-friendly, secure, and highly effective digital ecosystems. Through meticulous technical engineering and innovative design, we build impactful experiences that forge lasting brand connections and drive measurable success for our clients. We are guided by our core values of innovation, technical excellence, integrity, and client-centric collaboration.</p>
                    <p className="mb-[12px]">We firmly believe that in today's digital landscape, every business, regardless of size or industry, deserves the opportunity to not just exist online, but to operate flawlessly and truly thrive. Too often, we see a vast chasm between a business's untapped potential and their current digital and technical reality.</p>
                  </>
                )}
                {activeTab === 'vision' && (
                  <>
                    <p className="mb-[12px]">To empower businesses with comprehensive digital engineering and creative solutions that unlock their full potential, elevate their brand presence, and drive sustained, unprecedented growth, enabling them to lead in their industries and thrive in the dynamic digital landscape.</p>
                    <p className="mb-[12px]">Our vision extends far beyond simply building websites; we aim to be the catalyst that propels businesses into new realms of digital achievement. We see a future where our clients are not just participants in the online world, but confident leaders setting benchmarks for engagement and innovation.</p>
                  </>
                )}
                {activeTab === 'values' && (
                  <div className="text-[15px]">
                    <div className="flex justify-center flex-col md:flex-row">
                      <div className="flex-1">
                        <h5 className="flex items-center text-[16px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">1</span></div> Client-Centric Collaboration</h5>
                        <p className="ml-[30px] mb-[12px]">At the heart of our approach lies a commitment to Client-Centric Collaboration. We don't just work for you; we work with you, forging strong partnerships built on open communication and shared goals. Your vision is paramount, and by working hand-in-hand, we ensure the final digital experience truly reflects your unique identity and objectives, leading to impactful and resonant results.</p>
                      </div>
                      <div className="flex-1">
                        <h5 className="flex items-center text-[16px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">2</span></div> Innovation</h5>
                        <p className="ml-[30px] mb-[12px]">Fueling our creative process is a deep-seated culture of Innovation. We're not content with the status quo; instead, we actively embrace new technologies and explore imaginative solutions to overcome challenges and elevate the digital experiences we craft. This constant drive to evolve ensures that your brand benefits from the most cutting-edge and effective online strategies, keeping you ahead of the curve.</p>
                      </div>
                    </div>
                    <div className="flex justify-center flex-col md:flex-row">
                      <div className="flex-1">
                        <h5 className="flex items-center text-[16px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">3</span></div> Integrity</h5>
                        <p className="ml-[30px] mb-[12px]">Integrity is the bedrock of our operations at Touch Domain. We believe in conducting every aspect of our business with unwavering ethical standards, ensuring complete honesty, transparency, and fairness in all our interactions. This commitment to strong moral principles fosters trust and reliability, building a solid foundation for lasting partnerships and the delivery of dependable digital solutions.</p>
                      </div>
                      <div className="flex-1">
                        <h5 className="flex items-center text-[16px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">4</span></div> Continuous Learning</h5>
                        <p className="ml-[30px] mb-[12px]">In the ever-evolving digital landscape, our commitment to Continuous Learning is paramount. We recognize that staying ahead means actively pursuing knowledge and mastering the latest trends and technologies. This dedication to growth ensures that we consistently deliver cutting-edge solutions and strategic insights that empower your brand to not just adapt, but to thrive in the dynamic online world.</p>
                      </div>
                    </div>
                    <h5 className="flex items-center text-[16px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">5</span></div> Accountability</h5>
                    <p className="ml-[30px] mb-[12px]">At Touch Domain, Accountability is a cornerstone of our service. We embrace complete ownership of every project we undertake, standing firmly behind our work and taking full responsibility for our actions. This commitment ensures that we are dedicated to delivering exceptional results and fostering a relationship of trust and reliability with our clients, knowing that we are always answerable for our performance.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full max-w-[350px] min-h-[290px] bg-td-purple rounded-[19px] text-white p-[13px] mx-auto md:ml-[2rem] md:mr-0 mt-8 md:mt-0">
              <h3 className="text-[18px] text-white font-bold text-left mb-4 uppercase">Our Designs Are</h3>
              
              <div className="flex flex-row mb-3">
                <div className="ml-[5px] mr-[4px]">
                  <i className="fa fa-street-view !w-[31px] !h-[31px] text-[16px] !bg-td-accent rounded-full !p-[6px] text-center inline-block"></i>
                </div>
                <div>
                  <span className="text-[14px] font-[700] block">Brand Conscious</span>
                  <p className="text-[12px] mb-[10px] leading-tight">Our website designs are based on your brand strategy to ensure that your target audience can easily identify with you.</p>
                </div>
              </div>

              <div className="flex flex-row mb-3">
                <div className="ml-[5px] mr-[4px]">
                  <i className="fa fa-lightbulb-o !w-[31px] !h-[31px] text-[16px] !bg-td-accent rounded-full !p-[6px] text-center inline-block"></i>
                </div>
                <div>
                  <span className="text-[14px] font-[700] block">Intuitive</span>
                  <p className="text-[12px] mb-[10px] leading-tight">We customise the user experience on your website based on findings from our target audience research. Giving you more conversions.</p>
                </div>
              </div>

              <div className="flex flex-row mb-3">
                <div className="ml-[5px] mr-[4px]">
                  <i className="fa fa-laptop !w-[31px] !h-[31px] text-[16px] !bg-td-accent rounded-full !p-[6px] text-center inline-block"></i>
                </div>
                <div>
                  <span className="text-[14px] font-[700] block">Responsive</span>
                  <p className="text-[12px] mb-[10px] leading-tight">Your site works properly on the phone it's actually viewed on first, not just the desktop it was designed on.</p>
                </div>
              </div>

              <div className="flex flex-row">
                <div className="ml-[5px] mr-[4px]">
                  <i className="fa fa-cogs !w-[31px] !h-[31px] text-[16px] !bg-td-accent rounded-full !p-[6px] text-center inline-block"></i>
                </div>
                <div>
                  <span className="text-[14px] font-[700] block">Engineered, Not Templated</span>
                  <p className="text-[12px] mb-[10px] leading-tight">We build on modern web technology instead of recycling another WordPress template — faster to load, easier to maintain, harder to break.</p>
                </div>
              </div>
            </div>

          </div>
          
          <HalfCircleBottomLeft />
        </section>

        {/* ── Services Section ── */}
        <section id="services-intro" className="section-wrapper overflow-hidden">
          <h2>From an Idea to Online Creation</h2>
          <h3 className="heading-text mb-[10px]">Choose a Package or Fully Customize Your Solution</h3>
          <p className="intro">
            Our expert team turns your innovative concepts into impactful online realities. Choose a package for efficiency, or let us build a custom solution for exceptional results.
          </p>
          <HalfCircleTopRight />
          <div className="relative w-full">
            
            <div className="flex flex-row overflow-x-auto md:flex-row md:flex-wrap justify-start md:justify-evenly items-stretch md:items-center snap-x snap-mandatory md:snap-none [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden [scrollbar-width:none] gap-5 md:gap-8 relative z-10 max-w-7xl mx-auto px-4 pb-2 md:pb-0">
            
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
      
      {/* ── Contact Snippet ── */}
      <ContactSnippet />

      {/* ── Consultation Modal ── */}
      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}