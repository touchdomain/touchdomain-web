import Image from 'next/image';

export const metadata = { title: 'Sign in' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-[#f3eef6] px-4 py-12">
      <Image
        src="/branding/logo-nav.png"
        alt="Touch Domain"
        width={150}
        height={40}
        priority
        className="mb-8 h-9 w-auto object-contain"
      />
      {children}
      <p className="mt-8 text-xs text-gray-400">
        © {new Date().getFullYear()} TOUCHDOMAIN (Pty) Ltd
      </p>
    </div>
  );
}
