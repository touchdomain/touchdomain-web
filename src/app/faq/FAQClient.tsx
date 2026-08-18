'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from '../../components/Icon';
import HalfCircleTopRight from '../../components/HalfcircleTopRight';
import HalfCircleBottomLeft from '../../components/HalfcircleBottomLeft';
import { faqItems } from './faqData';


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
                  <Icon name="chevron-down" size={14} className={`text-td-accent transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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