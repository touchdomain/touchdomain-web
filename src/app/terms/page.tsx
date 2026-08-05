export const metadata = {
  title: 'Terms & Conditions | Touch Domain',
  description: 'The terms governing use of the Touch Domain website and our services.',
};

export default function TermsPage() {
  return (
    <main className="relative py-[2rem] my-[1.5rem]">
      <section id="terms-page" className="section-wrapper overflow-hidden pt-24">
        <h2>Terms &amp; Conditions</h2>
        <h3 className="heading-text mb-[10px]">The Fine Print, Kept Honest</h3>
        <p className="intro">
          Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 mt-4 flex flex-col gap-6 text-gray-700 text-[14.5px] leading-relaxed">

          <p className="bg-td-purple/5 border border-td-accent/20 rounded-lg p-4 text-[13px] text-gray-600 italic">
            This is a general-purpose starting point, not a substitute for a contract reviewed by a lawyer.
            Any project-specific terms (payment schedule, scope, revisions, ownership) should be confirmed in writing
            for that project — this page covers the general use of our website and quoting tools.
          </p>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Using This Website</h4>
            <p>By using touchdomain.co.za, you agree to use it lawfully and not to attempt to disrupt, scrape, or interfere with its normal operation, including our contact forms and quote calculator.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Quotes &amp; Estimates</h4>
            <p>Any price shown on our quote calculator, package pages, or order confirmations is an estimate based on the options you selected — not a final invoice. Final scope and pricing are confirmed directly with you before any work begins, and may be adjusted once we've discussed your specific requirements in full.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Ordering a Package</h4>
            <p>Submitting an order or quote request through this site is an expression of interest, not a binding contract. A binding agreement is only formed once both parties confirm scope, pricing, and timeline in writing.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Intellectual Property</h4>
            <p>All content on this site — including our branding, copy, and design — belongs to Touch Domain unless otherwise stated. Deliverables from a completed, paid project belong to the client per the terms agreed for that specific project.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Testimonials &amp; Case Studies</h4>
            <p>We only publish a client's name, business name, or project details on this site with their explicit, separately-collected consent (via our review form). Consent can be withdrawn at any time by contacting us.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Limitation of Liability</h4>
            <p>We aim for accuracy across this site, but information (including package descriptions and estimated pricing) may change without notice. Touch Domain is not liable for decisions made solely on the basis of this website without direct confirmation from our team.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Governing Law</h4>
            <p>These terms are governed by the laws of the Republic of South Africa.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Questions</h4>
            <p>Reach us at <a href="mailto:info@touchdomain.co.za" className="text-td-accent hover:underline">info@touchdomain.co.za</a> for anything on this page.</p>
          </div>

        </div>
      </section>
    </main>
  );
}
