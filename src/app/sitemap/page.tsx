import Link from 'next/link';

export const metadata = {
  title: 'Sitemap | Touch Domain',
  description: 'A full overview of every page on the Touch Domain website.',
};

const sections = [
  {
    title: 'Main Pages',
    links: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
      { href: '/services', label: 'Services' },
      { href: '/work', label: 'Portfolio' },
      { href: '/contact', label: 'Reach Us' },
    ],
  },
  {
    title: 'Get Started',
    links: [
      { href: '/quote', label: 'Get a Quote' },
      { href: '/review', label: 'Leave a Review' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terms', label: 'Terms & Conditions' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <main className="relative py-[2rem] my-[1.5rem]">
      <section id="sitemap-page" className="section-wrapper overflow-hidden pt-24">
        <h2>Sitemap</h2>
        <h3 className="heading-text mb-[10px]">Every Page, In One Place</h3>
        <p className="intro">
          A quick overview of everything on touchdomain.co.za.
        </p>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 mt-8 grid sm:grid-cols-2 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-td-purple font-[700] text-[15px] uppercase tracking-wide mb-3 border-b border-gray-200 pb-2">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-gray-600 hover:text-td-accent transition-colors text-[14.5px]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
