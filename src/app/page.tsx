'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import HeroSlider from '../components/HeroSlider';
import ContactSnippet from '../components/ContactSnippet';
import HalfCircleTopRight from '../components/HalfcircleTopRight';
import HalfCircleBottomLeft from '../components/HalfcircleBottomLeft';


export default function Home() {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <>
      <HeroSlider />
      
      <main className="relative py-[2rem] my-[1.5rem]">
        
        {/* ── Reasons Section ── */}
        <section id="reasons" className="section-wrapper overflow-hidden">
          <h2>Join the WWW</h2>
          <h3 className="heading-text mb-[10px]">Here are three reasons why</h3>
          <p className="intro">
            The internet is more than just websites, it's a community. Here are three reasons why you should join us and become part of something bigger.
          </p>
          <HalfCircleTopRight />
          <div className="px-4 sm:px-6 md:px-[42px] flex flex-col w-full relative z-10 mx-auto">
            <div className="flex flex-row mb-[30px] items-center justify-start">
              <div className="flex flex-row mb-[30px] w-full md:w-[60%] lg:w-[43%]">
                <span className="text-td-purple text-[40px] font-[700] mr-[11px] leading-none">1</span>
                <blockquote className="border-l-[8px] border-td-accent pl-[25px] text-[16px]">
                  <span className="block text-td-purple text-[20px] font-[600] -ml-[9px] mb-1">Don't Just Look Credible, Be Credible</span>
                  A professional website is essential in today's digital world. It's your online storefront, instantly boosting credibility and showing clients you're the real deal. Clear, quality information builds trust and positions you as the expert.
                </blockquote>
              </div>
            </div>

            <div className="flex flex-row mb-[30px] items-center justify-center">
              <div className="flex flex-row mb-[30px] w-full md:w-[60%] lg:w-[43%]">
                <span className="text-td-purple text-[40px] font-[700] mr-[11px] leading-none">2</span>
                <blockquote className="border-l-[8px] border-td-accent pl-[25px] text-[16px]">
                  <span className="block text-td-purple text-[20px] font-[600] -ml-[9px] mb-1">Shout It From the Rooftops</span>
                  Your brand is your business's core, and your website is its perfect showcase. Tell your story, share your values, and highlight your unique qualities. A strong online presence solidifies your brand, differentiates you from competitors, and provides a crucial advantage.
                </blockquote>
              </div>
            </div>

            <div className="flex flex-row mb-[30px] items-center justify-end">
              <div className="flex flex-row mb-[30px] w-full md:w-[60%] lg:w-[43%]">
                <span className="text-td-purple text-[40px] font-[700] mr-[11px] leading-none">3</span>
                <blockquote className="border-l-[8px] border-td-accent pl-[25px] text-[16px]">
                  <span className="block text-td-purple text-[20px] font-[600] -ml-[9px] mb-1">Catch Those Leads While They're Hot!</span>
                  A website acts like a magnet for potential customers. Interested parties will visit your site, so make it easy for them to find contact info, location, and product/service details. A well-designed website converts interest into valuable, nurture-ready leads.
                </blockquote>
              </div>
            </div>
          </div>
          
          <HalfCircleBottomLeft />
        </section>

        {/* ── About Section ── */}
        <section id="about-intro" className="section-wrapper overflow-hidden">
          <h2>Elevate Your Brand with Touch Domain</h2>
          <h3 className="heading-text mb-[10px]">A Strategic Process for Lasting Impact</h3>
          <p className="intro">
            Touch Domain helps brands thrive — with a proven process spanning brand identity, web design, content, and the hosting that keeps it all running. We're passionate about client goals and committed to their success, long after launch day.
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
                  <p className="mb-[12px] text-[17px]">We strive to be recognized for delivering exceptionally user-friendly, secure, and highly effective digital ecosystems. Through meticulous technical engineering and innovative design, we build impactful experiences that forge lasting brand connections and drive measurable success for our clients. We are guided by our core values of innovation, technical excellence, integrity, and client-centric collaboration.</p>
                )}
                {activeTab === 'vision' && (
                  <p className="mb-[12px] text-[17px]">To empower businesses with comprehensive digital engineering and creative solutions that unlock their full potential, elevate their brand presence, and drive sustained, unprecedented growth, enabling them to lead in their industries and thrive in the dynamic digital landscape.</p>
                )}
                {activeTab === 'values' && (
                  <div className="text-[15px]">
                    <div className="flex justify-center flex-col md:flex-row">
                      <div className="flex-1">
                        <h5 className="flex items-center text-[17px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">1</span></div> Client-Centric Collaboration</h5>
                        <p className="ml-[30px] mb-[12px]">We believe in building strong, collaborative partnerships with our clients.</p>
                      </div>
                      <div className="flex-1">
                        <h5 className="flex items-center text-[17px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">2</span></div> Innovation</h5>
                        <p className="ml-[30px] mb-[12px]">We embrace a culture of continuous innovation, constantly seeking new and creative ways to solve problems and improve our services.</p>
                      </div>
                    </div>
                    <div className="flex justify-center flex-col md:flex-row">
                      <div className="flex-1">
                        <h5 className="flex items-center text-[17px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">3</span></div> Integrity</h5>
                        <p className="ml-[30px] mb-[12px]">We conduct our business with the highest ethical standards, demonstrating honesty, transparency, and fairness in all our interactions.</p>
                      </div>
                      <div className="flex-1">
                        <h5 className="flex items-center text-[17px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">4</span></div> Continuous Learning</h5>
                        <p className="ml-[30px] mb-[12px]">We are dedicated to ongoing learning and development, recognizing that the digital landscape is constantly evolving.</p>
                      </div>
                    </div>
                    <h5 className="flex items-center text-[17px] font-[600] mt-[15px] mb-0 text-td-accent"><div className="circle-indicator"><span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">5</span></div> Accountability</h5>
                    <p className="ml-[30px] mb-[12px]">We take ownership of our work and are accountable for our actions.</p>
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
                      <i className="fab fa-facebook-square !bg-transparent !text-td-purple !p-[3px] !text-[16px] hover:!text-white"></i>
                      <i className="fab fa-instagram !bg-transparent !text-td-purple !p-[3px] !text-[16px] hover:!text-white"></i>
                      <i className="fab fa-linkedin-in !bg-transparent !text-td-purple !p-[3px] !text-[16px] hover:!text-white"></i>
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
            <i className="fas fa-arrow-left !bg-transparent !p-0 !text-[10px] mr-1"></i>
            Swipe to see more
            <i className="fas fa-arrow-right !bg-transparent !p-0 !text-[10px] ml-1"></i>
          </p>

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

        {/* ── Contact Section ── */}
        <ContactSnippet />

      </main>
    </>
  );
}