'use client';
import { useState, FormEvent } from 'react';
import FormStatus from './../../components/FormStatus';
import Icon from '../../components/Icon';

export default function ReviewClient() {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [website, setWebsite] = useState(''); // honeypot

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    const form = e.target as HTMLFormElement;
    const payload = {
      clientName: (form.elements.namedItem('clientName') as HTMLInputElement).value,
      clientEmail: (form.elements.namedItem('clientEmail') as HTMLInputElement).value,
      businessName: (form.elements.namedItem('businessName') as HTMLInputElement).value,
      projectType: (form.elements.namedItem('projectType') as HTMLSelectElement).value,
      rating,
      outcome: (form.elements.namedItem('outcome') as HTMLTextAreaElement).value,
      testimonial: (form.elements.namedItem('testimonial') as HTMLTextAreaElement).value,
      consentToPublish: (form.elements.namedItem('consentToPublish') as HTMLInputElement).checked,
      consentToCaseStudy: (form.elements.namedItem('consentToCaseStudy') as HTMLInputElement).checked,
      website,
    };

    try {
      const response = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: result.message });
        form.reset();
        setRating(5);
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
    <main className="relative py-[2rem] my-[1.5rem]">
      <section id="review-page" className="section-wrapper overflow-hidden pt-24">
        <h2>Tell Us How We Did</h2>
        <h3 className="heading-text mb-[10px]">Your Feedback Helps The Next Business Trust Us Too</h3>
        <p className="intro">
          If we worked on something together, we'd genuinely love to hear how it went — the good, and anything we could've done better. Two minutes of your time helps a lot.
        </p>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 relative z-10 mt-8">
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="clientName" className="block text-td-purple text-[14px] mb-[6px] font-[600]">Your Name</label>
                <input type="text" id="clientName" name="clientName" required className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[15px] bg-slate-50 text-gray-700 outline-none focus:border-td-accent focus:bg-white transition-colors" placeholder="Full name" />
              </div>
              <div>
                <label htmlFor="clientEmail" className="block text-td-purple text-[14px] mb-[6px] font-[600]">Email Address</label>
                <input type="email" id="clientEmail" name="clientEmail" required className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[15px] bg-slate-50 text-gray-700 outline-none focus:border-td-accent focus:bg-white transition-colors" placeholder="name@example.com" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-5">
              <div>
                <label htmlFor="businessName" className="block text-td-purple text-[14px] mb-[6px] font-[600]">Business Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" id="businessName" name="businessName" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[15px] bg-slate-50 text-gray-700 outline-none focus:border-td-accent focus:bg-white transition-colors" placeholder="Your business" />
              </div>
              <div>
                <label htmlFor="projectType" className="block text-td-purple text-[14px] mb-[6px] font-[600]">What Did We Work On?</label>
                <select id="projectType" name="projectType" defaultValue="" className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[16px] bg-slate-50 text-gray-700 outline-none focus:ring-0 focus:border-td-accent focus:bg-white hover:bg-slate-100 transition-colors">
                  <option value="" disabled>Select one</option>
                  <option value="Branding">Branding</option>
                  <option value="Web Design">Web Design</option>
                  <option value="Digital Content">Digital Content</option>
                  <option value="A mix of services">A mix of services</option>
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-td-purple text-[14px] mb-[8px] font-[600]">How Would You Rate The Experience?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-[32px] leading-none transition-colors"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Icon name="star" size={20} filled={star <= (hoverRating || rating)} className={`${star <= (hoverRating || rating) ? 'text-td-accent' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="outcome" className="block text-td-purple text-[14px] mb-[6px] font-[600]">What Actually Changed For Your Business?</label>
              <textarea id="outcome" name="outcome" rows={2} className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[15px] bg-slate-50 text-gray-700 outline-none focus:border-td-accent focus:bg-white transition-colors resize-none" placeholder="e.g. more enquiries, a site that finally looks credible, faster load times..."></textarea>
              <p className="text-xs text-gray-400 mt-1">Specifics like this help other visitors far more than general praise does.</p>
            </div>

            <div className="mb-6">
              <label htmlFor="testimonial" className="block text-td-purple text-[14px] mb-[6px] font-[600]">Your Testimonial</label>
              <textarea id="testimonial" name="testimonial" rows={4} required className="w-full border-none rounded-t-md border-b-[2px] border-td-purple px-4 py-3 text-[15px] bg-slate-50 text-gray-700 outline-none focus:border-td-accent focus:bg-white transition-colors resize-none" placeholder="Tell us — and future clients — how it went"></textarea>
            </div>

            <div className="mb-3 flex items-start gap-3">
              <input type="checkbox" id="consentToPublish" name="consentToPublish" className="mt-1" />
              <label htmlFor="consentToPublish" className="text-[14px] text-gray-600">
                I'm happy for Touch Domain to publish my name, business name, and the quote above on their website and marketing materials.
              </label>
            </div>

            <div className="mb-6 flex items-start gap-3">
              <input type="checkbox" id="consentToCaseStudy" name="consentToCaseStudy" className="mt-1" />
              <label htmlFor="consentToCaseStudy" className="text-[14px] text-gray-600">
                I'd also be open to this project being featured as a full case study (we'll always check the details with you first).
              </label>
            </div>

            {/* Honeypot — visually and structurally hidden from real users/assistive tech */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="review-website">Company Website</label>
              <input type="text" id="review-website" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
            </div>

            {status.message && (
              <div className="mb-4">
                <FormStatus type={status.type} message={status.message} />
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full inline-block text-[15px] px-[24px] py-[12px] bg-td-purple text-white rounded-[25px] border-[1.7px] border-transparent transition-all duration-300 hover:bg-transparent hover:border-td-accent hover:text-td-accent font-semibold disabled:opacity-50">
              {isSubmitting ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}