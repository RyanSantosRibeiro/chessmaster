'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  return (
    <div className="relative flex flex-col justify-between py-4 align-center md:py-6 h-full">
      <div className="flex flex-col items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="w-full flex flex-col gap-2">
          <Link href="/play" className={s.link}>
            ▶️ Play
          </Link>
          <Link href="/play" className={s.link}>
            🚀 Scoreboard
          </Link>
          <Link href="/play" className={s.link}>
            🏆 Tournaments
          </Link>
          <Link href="/play" className={s.link}>
            🌎 Friends
          </Link>
          {user && (
            <Link href="/account" className={s.link}>
              Account
            </Link>
          )}
        </nav>
      </div>
      <div className="flex flex-col justify-end gap-2"> 
        {user ? (
          <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
            <input type="hidden" name="pathName" value={usePathname()} />
            <button type="submit" className="text-gray-700">
              Sign out
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-2 my-4">
            <Link href="/signin" className={s.button}>
              Sign In
            </Link>
            <Link href="/signin" className={s.button_secondary}>
              Register
            </Link>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-2 mt-auto pt-2'>
        <a href='/' className='text-gray-700'>Suport</a>
        <a href='/' className='text-gray-700'>About Us</a>
        <p className="text-gray-700 text-white text-center text-xs">© 2023 Chess Platform</p>
      </div>
    </div>
  );
}
