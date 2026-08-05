'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ConsultationModal from './ConsultationModal';

const slides = [
  {
    title: "Captivate Your Audience",
    subtitle: "With Stunning Digital Experiences",
    desc: "Engage your audience with visually striking websites that reflect your brand and captivate visitors from the start. With our expert web design services, we combine creativity and functionality to create a unique online presence that stands out.",
    img: "/branding/slider-img1.png",
    buttons: [
      { text: "See Our Work", href: "/work", type: "secondary" },
      { text: "Get a Quote", href: "/quote", type: "primary" }
    ]
  },
  {
    title: "Engineering Digital Success",
    subtitle: "Robust & Scalable Solutions",
    desc: "We build secure, high-performance digital ecosystems using the latest technologies and best practices, tailored to your business goals and operational needs — then host and look after them long after launch, so your site stays fast, secure, and genuinely yours.",
    img: "/branding/slider-img2.png",
    buttons: [
      { text: "Book Free Consultation", isModal: true, type: "primary" }
    ]
  },
  {
    title: "Crafting Iconic Brands",
    subtitle: "Stand Out in the Digital Landscape",
    desc: "Make a lasting impression with impactful visuals. Our graphic design services create stunning logos, banners, and social media graphics. Whether you need a brand overhaul or design tweaks, we'll deliver designs that capture your brand's personality",
    img: "/branding/slider-img3.png",
    buttons: [
      { text: "Book Free Consultation", isModal: true, type: "primary" }
    ]
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <section className="relative block h-screen overflow-x-hidden bg-white w-full pt-[100px] pb-0 md:pt-0 md:pb-0">
        
        {/* Right 45% Background Image Overlay — desktop/tablet only, competes with text at narrow widths */}
        <div className="hidden md:block absolute top-0 right-0 w-[45%] h-full bg-[url('/branding/hero-background.png')] bg-cover bg-center z-0"></div>

        {/* Right Side Number Box Indicator */}
        <div className="hidden md:flex absolute right-0 top-[46%] -translate-y-1/2 w-[40px] flex-col items-center text-white z-10 text-[22px] font-medium">
          <span>0{currentSlide + 1}</span>
          <div className="w-[40px] h-[1px] bg-white my-2"></div>
          <span className="opacity-50">03</span>
        </div>

        {/* Slider Content Wrapper */}
        <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 w-full h-full md:h-auto z-10 flex flex-col md:flex-row justify-start md:justify-center">
          <div className="w-full h-full md:h-auto md:max-w-[93%] md:mx-auto px-0 flex flex-col md:block">
            <div className="flex flex-col md:grid md:grid-cols-2 items-center md:pr-[3%] lg:pr-[8%] gap-0 md:gap-10 lg:gap-12 flex-1 md:flex-none h-full md:h-auto">
              
              {/* Text Block */}
              <div key={`text-${currentSlide}`} className="flex flex-col items-center text-center md:items-start md:text-left animate-fadeIn w-full px-6 md:px-0 pb-6 md:pb-0 flex-shrink-0">
                <h1 className="text-td-purple uppercase font-[800] text-[clamp(1.9rem,7vw+0.3rem,4rem)] leading-[1.1] md:leading-[1] w-full mb-[1px] ml-0 md:ml-[5px] pr-0 md:pr-8">
                  {slides[currentSlide].title}
                </h1>
                <span className="text-td-accent font-bold uppercase text-[clamp(1.05rem,3vw+0.4rem,2rem)] block mb-[0.5rem] ml-0 md:ml-[5px] w-full pr-0 md:pr-8">
                  {slides[currentSlide].subtitle}
                </span>
                <p className="text-gray-700 text-[clamp(0.9rem,1vw+0.7rem,1.25rem)] mt-[4px] mb-[1.1rem] ml-0 md:ml-[5px] max-w-lg pr-0 md:pr-4">
                  {slides[currentSlide].desc}
                </p>
                
                <div className="mt-4 ml-0 md:ml-[5px] flex flex-wrap justify-center md:justify-start gap-4">
                  {slides[currentSlide].buttons.map((btn, idx) => {
                    if (btn.isModal) {
                      return (
                        <button key={idx} onClick={() => setIsModalOpen(true)} className="inline-block text-[14px] px-[15px] py-[10px] bg-td-purple text-white rounded-[20px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold">
                          {btn.text}
                        </button>
                      );
                    }
                    return (
                      <Link key={idx} href={btn.href!} className={`inline-block text-[14px] px-[10px] py-[10px] rounded-[20px] border-[1.7px] transition-all duration-300 font-semibold ${
                        btn.type === 'primary' 
                          ? 'bg-td-purple text-white border-transparent hover:bg-transparent hover:border-td-accent hover:text-td-accent' 
                          : 'bg-transparent border-td-accent text-td-accent hover:bg-white hover:border-td-purple hover:text-td-accent'
                      }`}>
                        {btn.text}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Image Block */}
              <div className="relative w-full bg-td-purple md:bg-transparent flex-1 md:flex-none flex flex-col items-center justify-center md:block overflow-hidden">
                <div key={`img-${currentSlide}`} className="relative flex justify-center md:justify-end animate-fadeIn">
                <div className="w-[190px] xs:w-[220px] sm:w-[260px] md:w-[280px] lg:w-[340px] xl:w-[400px] 2xl:w-[460px]">
                  <Image 
                    src={slides[currentSlide].img} 
                    alt={slides[currentSlide].title} 
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

        {/* Custom Carousel Indicators (Dots) */}
        <ul className="absolute bottom-[3%] md:bottom-[5%] left-0 right-0 flex justify-center items-center m-0 list-none z-20">
          {slides.map((_, idx) => (
            <li 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              className={`w-[15px] h-[15px] rounded-full mx-[3px] cursor-pointer transition-colors ${currentSlide === idx ? 'bg-td-accent' : 'bg-td-purple hover:bg-td-accent/70'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </ul>

      </section>

      <ConsultationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}