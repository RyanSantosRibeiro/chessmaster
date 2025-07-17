'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import s from './Navbar.module.css';
import Modal from '../Modal/Modal';
import WalletInterface from '../AccountForms/Wallet';
import WalletConnect from '../WalletCtx/Wallet';
import { useAuth } from '@/contexts/AuthContext';
import ConnectXverse from '../ConnectWallet/Xverse';
import { useWallet } from '@/contexts/WalletContext';
import { useState } from 'react';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;
  const { profile } = useAuth();
  const { walletData, disconnectWallet } = useWallet();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);

  console.log({ profile });

  const handleWalletClick = () => {
    if (walletData) {
      setShowDisconnectMenu(!showDisconnectMenu);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDisconnectMenu(false);
  };

  return (
    <div className="relative flex flex-col justify-between py-4 align-center md:py-6 h-full">
      <div className="flex flex-col items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="w-full flex flex-col gap-2">
          <Link href="/play" className="transition-all duration-150 py-2 font-semibold rounded px-2">
            ▶️ Play
          </Link>
          <Link href="/play" className="transition-all duration-150 py-2 font-semibold rounded px-2">
            🚀 Scoreboard
          </Link>
          <p className="linkDisable relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-default">
            🏆 Tournaments
          </p>
          <p className="linkDisable relative transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-default">
            🌎 Friends
          </p>
          {user && (
            <Link href="/account" className="transition-all duration-150 py-2 font-semibold rounded px-2 opacity-30 cursor-default">
              👤 Account
            </Link>
          )}
        </nav>
      </div>
      <div className="flex flex-col justify-end gap-2"> 
        {user ? (
          <>
            <Modal cta={{text: `${profile?.cash || ""} Aurion`,type: "primary"}}>
                <WalletInterface/>
            </Modal>
            <form onSubmit={(e) => handleRequest(e, SignOut, router)}>
              <input type="hidden" name="pathName" value={usePathname()} />
              <button type="submit" className="text-gray-700">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col gap-2 my-4">
            <ConnectXverse />
            {/* <Link href="/signin" className={s.button_secondary}>
              Register
            </Link> */}
            {walletData ? (
              <div className="relative">
                <button
                  onClick={handleWalletClick}
                  className="w-full btn btn-primary text-xs font-mono rounded-lg p-4 overflow-hidden inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
                >
                  {walletData.address.slice(0, 6)}...{walletData.address.slice(-4)} 
                </button>
                {showDisconnectMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg p-2 z-50">
                    <button
                      onClick={handleDisconnect}
                      className="w-full text-left text-red-400 hover:text-red-300 text-sm py-1 px-2 rounded"
                    >
                      Disconnect Wallet
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Modal cta={{text: 'Connect Wallet', type: 'primary'}}>
                <WalletConnect />
              </Modal>
            )}
          </div>
        )}
      </div>

      <div className='flex flex-col gap-2 mt-auto pt-2'>
        <a href='/' className='text-gray-700'>Suport</a>
        <a href='/' className='text-gray-700'>About Us</a>
        <p className="text-gray-700 text-xs">© 2025 Aurion Runes Platform</p>
      </div>
    </div>
  );
}
