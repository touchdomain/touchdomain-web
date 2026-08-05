'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/services', label: 'Services' },
    { href: '/work', label: 'Portfolio' },
    { href: '/contact', label: 'Reach Us' },
  ];

  const isActive = (href: string) => pathname === href;
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="absolute top-0 left-0 w-full z-[99999] h-[55px] md:h-[65px] lg:h-[75px] xl:h-[85px] flex items-center bg-transparent">
      <div className="w-full max-w-[97%] 2xl:max-w-[98%] mx-auto px-[0px] relative flex items-center justify-between h-full gap-2 ml-0">
        
        <div className="flex items-center min-w-0">
          <Link href="/" className="mt-[5%] mr-[1%] flex items-center shrink-0">
            <div className="relative w-[110px] h-[53px] md:w-[125px] md:h-[60px] lg:w-[135px] lg:h-[70px] xl:w-[165px] xl:h-[79px]">
              <Image src="/branding/logo-nav.png" alt="Touch Domain Logo" fill className="object-contain" />
            </div>
          </Link>

          <nav className="hidden md:flex flex-row pt-[6.5%] m-0 items-center">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-[6px] lg:px-[7px] py-[10px] font-[600] text-[13px] lg:text-[14px] xl:text-[15px] transition-colors whitespace-nowrap ${
                  isActive(link.href) ? 'text-td-accent' : 'text-[#707070] hover:text-td-accent'
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/quote"
              className={`ml-[7px] px-[12px] lg:px-[13px] py-[8px] rounded-[20px] font-[600] text-[13px] lg:text-[14px] xl:text-[15px] border-[1.7px] transition-all duration-300 inline-block whitespace-nowrap ${
                isActive('/quote')
                  ? 'bg-transparent border-td-accent text-td-accent'
                  : 'bg-td-purple border-transparent text-white hover:bg-transparent hover:border-td-accent hover:text-td-accent'
              }`}
            >
              Get a Quote
            </Link>
          </nav>
        </div>

        {/* Icons — now a normal flex sibling instead of absolutely positioned,
            so it can never visually collide with nav links at tablet/small-laptop
            widths where there isn't much spare horizontal room. */}
        <div className="hidden md:flex items-center gap-[6px] lg:gap-[8px] xl:gap-[11px] text-white text-[13px] lg:text-[14px] xl:text-[16px] shrink-0">
          <a href="mailto:info@touchdomain.co.za"><i className="fas fa-envelope"></i></a>
          <a href="https://www.instagram.com/touchdomain/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i></a>
          <a href="https://web.facebook.com/profile.php?id=61592261381746" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-square"></i></a>
          <a href="https://www.linkedin.com/company/touchdomain/?viewAsMember=true" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in"></i></a>
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-td-purple z-50 shrink-0">
          <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} !bg-transparent !text-td-purple text-[24px]`}></i>
        </button>
      </div>

      {/* Mobile Menu Panel — now closes automatically on link tap */}
      {isMobileMenuOpen && (
        <div className="absolute top-[55px] left-0 w-full bg-white shadow-lg p-4 md:hidden flex flex-col z-40">
           {navLinks.map(link => (
             <Link
               key={link.href}
               href={link.href}
               onClick={closeMenu}
               className={`block py-2 text-center font-[600] ${isActive(link.href) ? 'text-td-accent' : 'text-[#707070]'}`}
             >
               {link.label}
             </Link>
           ))}
           <Link
             href="/quote"
             onClick={closeMenu}
             className={`block py-2 mt-2 text-center rounded-full font-semibold ${
               isActive('/quote') ? 'bg-transparent border-2 border-td-accent text-td-accent' : 'bg-td-purple text-white'
             }`}
           >
             Get a Quote
           </Link>
        </div>
      )}
    </header>
  );
}