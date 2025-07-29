'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, User as UserIcon } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';

const navLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Features', href: '/features' },
  { label: 'Documentation', href: '/documentation' },
  { label: 'Tutorials', href: '/tutorials' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header({ forceWhiteBg = false }: { forceWhiteBg?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between
      ${forceWhiteBg ? "bg-white border-b border-gray-200 text-black" : "backdrop-blur-[2px] bg-transparent text-white"}
    `}>
      <Link href="/" className="flex items-center">
        <Image
          src="/images/theonelogo.png"
          alt="The One Algo logo"
          width={128}
          height={128}
          className="h-10 w-auto"
        />
      </Link>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="focus:outline-none"
        aria-label="Toggle menu"
      >
        {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      {menuOpen && (
        <div
          ref={mobileRef}
          className={`absolute top-full right-0 mt-2 ${forceWhiteBg ? 'bg-white text-black border' : 'bg-black/90 text-white'} backdrop-blur rounded shadow p-6 flex flex-col space-y-4 text-right z-50 max-w-xs`}
        >
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-lg font-medium hover:text-cyan-300 transition"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/pricing"
            className="bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 hover:brightness-110 text-black px-4 py-2 rounded-lg font-semibold transition text-center"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
          {user ? (
            <>
              <div className="text-gray-400 text-sm px-4 py-2">Signed in as: <span className="font-bold">{user.email}</span></div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  firebaseSignOut(auth);
                  window.location.href = '/';
                }}
                className="text-left mt-2 px-4 py-2 bg-gray-800 rounded text-sm"
              >
                <UserIcon className="inline-block w-4 h-4 mr-1" />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-left mt-2 px-4 py-2 bg-gray-800 rounded text-sm"
              onClick={() => setMenuOpen(false)}
            >
              <UserIcon className="inline-block w-4 h-4 mr-1" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
