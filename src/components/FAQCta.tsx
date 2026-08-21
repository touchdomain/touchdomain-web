import Link from 'next/link';
import Icon from './Icon';

interface FAQCtaProps {
  message?: string;
  className?: string;
}

// A contained prompt pointing toward the full FAQ page, meant for pages
// where a question is likely to come up mid-browsing (pricing, the contact
// form) - the visitor decides whether it's worth the click through, this
// is just making sure they know the option exists rather than only being
// reachable via the footer link. Styled as a tinted card (matching the
// bg-td-purple/5 + icon treatment used elsewhere on the site, e.g. the
// Mission/Vision/Values card) rather than bare text, so it reads as a
// deliberate part of the page instead of an afterthought bolted on.
export default function FAQCta({ message = "Have a question we haven't covered here?", className = '' }: FAQCtaProps) {
  return (
    <div className={`max-w-xl mx-auto my-6 bg-td-purple/5 border border-td-purple/10 rounded-[16px] px-6 py-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 ${className}`}>
      <div className="w-[42px] h-[42px] rounded-full bg-td-purple/10 flex items-center justify-center flex-shrink-0">
        <Icon name="message-circle" size={19} className="text-td-purple" />
      </div>
      <p className="text-td-purple text-[14.5px] font-[500] text-center sm:text-left flex-1">{message}</p>
      <Link
        href="/faq"
        className="inline-block text-[14px] px-5 py-2.5 bg-td-purple text-white rounded-[20px] font-[600] transition-all hover:bg-td-accent flex-shrink-0 whitespace-nowrap"
      >
        Browse FAQ
      </Link>
    </div>
  );
}