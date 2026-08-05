'use client';
import { useState, FormEvent } from 'react';
import HalfCircleTopRight from './HalfcircleTopRight';
import HalfCircleBottomLeft from './HalfcircleBottomLeft';
import FormStatus from './FormStatus';

export default function ContactSnippet() {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Honeypot — real visitors never see or fill this field.
  const [website, setWebsite] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    // 1. Gather the data from the form
    const form = e.target as HTMLFormElement;
    const formData = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      topic: (form.elements.namedItem('subject') as HTMLSelectElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      website, // honeypot — should always be empty for real submissions
    };

    try {
      // 2. Send the data to your new Next.js API route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      // 3. Handle the response
      if (response.ok) {
        setStatus({ type: 'success', message: result.message });
        form.reset();
        setWebsite('');
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-snippet" className="section-wrapper overflow-hidden bg-slate-50 pt-20">
      {/* Added bg-slate-50 to the section above to contrast against the white form card */}
      
      <h2>Let's Connect</h2>
      <h3 className="heading-text mb-[10px]">We're Here to Help</h3>
      <p className="intro">
        We're here to answer questions and provide support. Let us know how we can help, explore our contact options.
      </p>
      <HalfCircleTopRight />
      <div className="flex flex-col md:flex-row justify-around items-center mt-20 sm:mt-28 md:mt-[13rem] mx-4 sm:mx-8 mb-16 md:mb-[7rem] relative z-10 max-w-7xl md:mx-auto gap-12 lg:gap-0">
        

        {/* CRISP ELEVATION: rounded-2xl, shadow-xl, and border */}
        <form onSubmit={handleSubmit} className="w-full lg:w-[530px] bg-white p-[32px] rounded-2xl shadow-xl border border-gray-100 text-center h-fit">
          
          <div className="w-full mb-[25px]">
            <label htmlFor="name" className="block text-left text-td-purple text-[14px] mb-[8px] font-[600]">Your Name</label>
            <input type="text" id="name" placeholder="Enter your name" required className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" />
          </div>

          <div className="w-full mb-[25px]">
            <label htmlFor="subject" className="block text-left text-td-purple text-[14px] mb-[8px] font-[600]">Your Subject</label>
            <select id="subject" required defaultValue="" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors">
              <option value="" disabled>Select your subject</option>
              <option value="General enquiry">General enquiry</option>
              <option value="Feedback">Feedback</option>
              <option value="Reporting a bug">Reporting a bug</option>
            </select>
          </div>

          <div className="w-full mb-[25px]">
            <label htmlFor="email" className="block text-left text-td-purple text-[14px] mb-[8px] font-[600]">Email address</label>
            <input type="email" id="email" placeholder="name@example.com" required className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors" />
          </div>

          <div className="w-full mb-[30px]">
            <label htmlFor="message" className="block text-left text-td-purple text-[14px] mb-[8px] font-[600]">Your Message</label>
            <textarea id="message" rows={3} placeholder="Type your message" required className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors resize-none"></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="inline-block text-[15px] px-[24px] py-[12px] bg-td-purple text-white rounded-[25px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold disabled:opacity-50">
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>

          {/* Honeypot — visually and structurally hidden from real users/assistive tech */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="snippet-website">Company Website</label>
            <input
              type="text"
              id="snippet-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </div>
          
          {status.message && (
            <div className="w-[95%] mx-auto mt-4">
              <FormStatus type={status.type} message={status.message} />
            </div>
          )}
        </form>

        <div className="w-full lg:w-[35%]">
          <div className="mb-[24px]">
            <p className="text-[18px] font-[500] leading-relaxed text-left text-td-dark">
              Would you like a free consultation? If there is anything you would like to clarify, feel free to send us a message!
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <span className="group block text-[15px] font-[500] text-td-dark hover:text-gray-500 cursor-pointer transition-colors w-fit flex items-center">
              <i className="fa fa-whatsapp !text-[17px] !font-[500] !bg-td-purple !text-white !p-[10px] !mt-0 !mr-[12px] group-hover:!bg-td-accent transition-colors"></i> 081 327 6153
            </span>
            <span className="group block text-[15px] font-[500] text-td-dark hover:text-gray-500 cursor-pointer transition-colors w-fit flex items-center">
              <i className="fa fa-phone !text-[13px] !bg-td-purple !text-white !p-[10px] !mt-0 !mr-[12px] group-hover:!bg-td-accent transition-colors"></i> 081 327 6153
            </span>
            <span className="group block text-[15px] font-[500] text-td-dark hover:text-gray-500 cursor-pointer transition-colors w-fit flex items-center">
              <i className="fa fa-envelope !text-[13px] !bg-td-purple !text-white !p-[10px] !mt-0 !mr-[12px] group-hover:!bg-td-accent transition-colors"></i> info@touchdomain.co.za
            </span>
          </div>
        </div>

      </div>

      <HalfCircleBottomLeft />
    </section>
  );
}