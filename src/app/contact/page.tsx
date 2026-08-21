import Image from 'next/image';
import Link from 'next/link';
import ContactSnippet from './../../components/ContactSnippet';

export const metadata = {
  title: 'Contact Us | Touch Domain',
  description: 'Get in touch with Touch Domain — ask a question, start a project, or book a free consultation with our team.',
};

export default function ContactPage() {
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
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,3rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  Reach Out
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  Your Direct Line to Our Team
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.25rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
                  We're always eager to hear from you. Whether you have a question about our services, need support with a project, or just want to explore possibilities, reaching out is the first step towards transforming your digital vision into reality. We're ready to listen and assist.
                </p>
                
                <div className="mt-4 ml-0 md:ml-[5px]">
                  {/* Anchors directly to the contact snippet below */}
                  <Link href="#contact-snippet" className="inline-block text-[14px] px-[15px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold">
                    Let's Connect Today!
                  </Link>
                </div>
              </div>

              <div className="relative w-full bg-td-purple md:bg-transparent flex-1 md:flex-none flex flex-col items-center justify-center md:block overflow-hidden">
                <div className="relative flex justify-center md:justify-end animate-fadeIn">
                <div className="w-[190px] xs:w-[220px] sm:w-[260px] md:w-[280px] lg:w-[340px] xl:w-[400px] 2xl:w-[460px]">
                  {/* Ensure contact-landing.png is in your public/branding/ folder */}
                  <Image 
                    src="/branding/contact-landing.png" 
                    alt="Contact Touch Domain" 
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

      {/* ── Main Content ── */}
      <main className="relative py-[2rem] my-[1.5rem]">
        {/* Because the Contact Snippet already contains the exact #contact-snippet section, 
            the <h2> heading, the SVG half-circles, and the form grid, we just render it here! */}
        <ContactSnippet />
      </main>
    </>
  );
}