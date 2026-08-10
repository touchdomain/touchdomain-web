import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  // Dynamically update the copyright year so you never have to change it manually
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-td-purple grid grid-cols-1 phone-lg:grid-cols-2 md:flex md:flex-row justify-evenly pt-[1.5rem] pb-[0.8rem] -mt-[63px] relative z-20 px-4 md:px-0 gap-x-6 gap-y-8 md:gap-0">
      
      {/* ── Brand Column — always full width, even in the 2-col phone layout ── */}
      <div className="phone-lg:col-span-2 flex flex-col items-start w-full md:w-auto">
        <Link href="/" className="block w-[80%] md:w-[200px]">
          <div className="relative w-full h-[40px]">
            {/* Ensure brand.png is in your public/branding/ folder */}
            <Image 
              src="/branding/brand.png" 
              alt="Touch Domain" 
              fill 
              className="object-contain object-left" 
            />
          </div>
        </Link>
        <p className="text-white mt-[15px] text-[14px]">
          &copy; {currentYear}. Touch Domain, All Rights Reserved.
        </p>
      </div>

      {/* ── Links Column ── */}
      {/* text-left explicitly overrides the global h3 base rule (text-center) —
          without it, these column headings render centered while the links
          below stay left-aligned, which is the "footer looks broken" bug.
          Centered together on mobile now (heading + links match), reset to
          left-aligned from md: up where the wider multi-column layout reads
          better left-aligned. */}
      <div className="flex flex-col items-center md:items-start w-full md:w-auto">
        <h3 className="text-white text-[1.17em] font-bold mb-3 capitalize text-center md:text-left">Links</h3>
        <Link href="/about" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">About</Link>
        <Link href="/services" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">Services</Link>
        <Link href="/work" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">Portfolio</Link>
        <Link href="/contact" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">Reach Us</Link>
        <Link href="/review" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">Leave a Review</Link>
        <Link href="/sitemap" className="block text-white hover:text-td-accent transition-colors text-[14px] w-fit">Sitemap</Link>
      </div>

      {/* ── Information Column ── */}
      <div className="flex flex-col items-center md:items-start w-full md:w-auto">
        <h3 className="text-white text-[1.17em] font-bold mb-3 capitalize text-center md:text-left">Information</h3>
        <Link href="/terms" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">Terms & conditions</Link>
        <Link href="/privacy" className="block text-white hover:text-td-accent transition-colors text-[14px] w-fit">Privacy policy</Link>
      </div>

      {/* ── Social Media Column ── */}
      <div className="flex flex-col items-center md:items-start w-full md:w-auto">
        <h3 className="text-white text-[1.17em] font-bold mb-3 capitalize text-center md:text-left">Social Media</h3>
        {/* We use !bg-transparent and !p-[5px] to override the global icon styles in globals.css */}
        <a href="https://web.facebook.com/profile.php?id=61592261381746" target="_blank" rel="noopener noreferrer" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit flex items-center group">
          <i className="fab fa-facebook-square !bg-transparent !p-[5px] !text-white group-hover:!text-td-accent w-[25px] transition-colors"></i> Touch Domain
        </a>
        <a href="https://www.instagram.com/touchdomain/" target="_blank" rel="noopener noreferrer" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit flex items-center group">
          <i className="fab fa-instagram !bg-transparent !p-[5px] !text-white group-hover:!text-td-accent w-[25px] transition-colors"></i> Touch domain
        </a>
        <a href="https://www.linkedin.com/company/touchdomain/?viewAsMember=true" target="_blank" rel="noopener noreferrer" className="block text-white hover:text-td-accent transition-colors text-[14px] w-fit flex items-center group">
          <i className="fab fa-linkedin-in !bg-transparent !p-[5px] !text-white group-hover:!text-td-accent w-[25px] transition-colors"></i> Touch domain
        </a>
      </div>

      {/* ── Reach Us Column ── */}
      <div className="flex flex-col items-center md:items-start w-full md:w-auto">
        <h3 className="text-white text-[1.17em] font-bold mb-3 capitalize text-center md:text-left">Reach Us</h3>
        <a href="mailto:info@touchdomain.co.za" className="block text-white hover:text-td-accent transition-colors text-[14px] mb-1 w-fit">info@touchdomain.co.za</a>
        <a href="tel:+27813276153" className="block text-white hover:text-td-accent transition-colors text-[14px] w-fit">081 327 6153</a>
      </div>

    </footer>
  );
}