// app/auth/AuthHeader.tsx
import Link from 'next/link';
import Image from 'next/image';

export default function AuthHeader() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-3 bg-transparent">
      <Link href="/">
        <Image src="/images/theonelogo.png" alt="Logo" width={48} height={48} />
      </Link>
      {/* Hamburger can go here if you want it, or nothing */}
    </header>
  );
}
