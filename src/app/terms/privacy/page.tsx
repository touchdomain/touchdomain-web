export const metadata = {
  title: 'Privacy Policy | Touch Domain',
  description: 'How Touch Domain collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <main className="relative py-[2rem] my-[1.5rem]">
      <section id="privacy-page" className="section-wrapper overflow-hidden pt-24">
        <h2>Privacy Policy</h2>
        <h3 className="heading-text mb-[10px]">How We Handle Your Information</h3>
        <p className="intro">
          Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 mt-4 flex flex-col gap-6 text-gray-700 text-[14.5px] leading-relaxed">

          <p className="bg-td-purple/5 border border-td-accent/20 rounded-lg p-4 text-[13px] text-gray-600 italic">
            This policy is written in plain language so it's actually useful to read, in line with South Africa's
            Protection of Personal Information Act (POPIA). It has not been drafted or reviewed by a lawyer —
            if you need this to meet a specific compliance obligation, please have it reviewed professionally.
          </p>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Who We Are</h4>
            <p>Touch Domain ("we," "us," "our") is a South African digital studio providing branding, web design, and digital content services. This policy explains what personal information we collect through touchdomain.co.za, why we collect it, and what we do with it.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">What We Collect</h4>
            <p className="mb-2">We only collect information you choose to give us, through forms on this site:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li><strong>Contact form:</strong> name, email address, subject, and your message.</li>
              <li><strong>Consultation booking:</strong> name, email, phone number, and your preferred date/time.</li>
              <li><strong>Order requests:</strong> name, email, phone number, and the package/features you selected.</li>
              <li><strong>Custom quote builder:</strong> name, email, phone number, and the services you configured.</li>
              <li><strong>Reviews:</strong> name, email, business name, project type, rating, and your testimonial.</li>
            </ul>
            <p className="mt-2">We do not use cookies, analytics trackers, or advertising pixels on this site at this time. If that changes, this policy will be updated to reflect it.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Why We Collect It</h4>
            <p>We use your information only to respond to your enquiry, prepare quotes or order confirmations, schedule consultations, and — with your explicit consent, collected separately on our review form — to publish testimonials or case studies. We do not sell, rent, or trade your information to any third party.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">How It's Stored &amp; Who Sees It</h4>
            <p>Form submissions are sent by email to our team and are not stored in a public-facing database. Your information is only seen by Touch Domain staff directly involved in responding to your enquiry or delivering your project.</p>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Your Rights Under POPIA</h4>
            <p className="mb-2">As a data subject under South African law, you have the right to:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>Ask what personal information we hold about you.</li>
              <li>Ask us to correct or delete information that is inaccurate or no longer needed.</li>
              <li>Withdraw consent for us to use your testimonial or case study at any time.</li>
              <li>Object to how your information is being processed.</li>
              <li>Lodge a complaint with the Information Regulator of South Africa if you believe your rights have been infringed.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-td-purple font-[700] text-[16px] mb-2">Contact Us About Your Information</h4>
            <p>For any request relating to your personal information, email us at <a href="mailto:info@touchdomain.co.za" className="text-td-accent hover:underline">info@touchdomain.co.za</a>.</p>
          </div>

        </div>
      </section>
    </main>
  );
}
