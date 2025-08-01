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
  const { walletData, disconnectWallet, user: userOdin } = useWallet();
  const [showDisconnectMenu, setShowDisconnectMenu] = useState(false);

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
        <p className='flex gap-2'>
          <span className="text-2xl font-bold gradient-text font-display text-white">
                AURION
              </span>
              <span className="hidden sm:inline-flex bg-accent/20 text-accent text-xs px-2 py-1 rounded border border-accent/30 whitespace-pre-line">
                Test Alpha
              </span>
        </p>
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="w-full flex flex-col gap-2">
          <Link href="/play" className="transition-all duration-150 py-1 font-semibold rounded px-2 text-md hover:bg-[#182127]">
            ▶️ Play
          </Link>
          <p className="linkDisable relative transition-all duration-150 py-1 font-semibold rounded px-2 opacity-30 cursor-default text-md">
            🏛 Coliseum
          </p>
          <p className="linkDisable relative transition-all duration-150 py-1 font-semibold rounded px-2 opacity-30 cursor-default text-md">
            📜 Missions
          </p>
          <p className="linkDisable relative transition-all duration-150 py-1 font-semibold rounded px-2 opacity-30 cursor-default text-md">
            🌎 Friends
          </p>
          <p className="linkDisable relative transition-all duration-150 py-1 font-semibold rounded px-2 opacity-30 cursor-default text-md">
            👑 Tournment of Lords
          </p>
          {user && (
            <Link href="/account" className="transition-all duration-150 py-1 font-semibold rounded px-2 opacity-30 cursor-default text-md">
              👤 Account
            </Link>
          )}
        </nav>
      </div>
      <div className="flex flex-col justify-end gap-2"> 
        {/* {user ? (
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
            {walletData ? (
              <div className="relative">
                <button
                  onClick={handleWalletClick}
                  className="w-full btn btn-primary text-xs font-mono rounded-lg p-4 overflow-hidden inset-0 bg-gradient-to-r from-primary/10 to-secondary/10"
                >
                  {userOdin ? userOdin.username : "..."} 
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
        )} */}
      </div>

      <div className='flex flex-col gap-2 mt-auto pt-2'>
        <a href='/ticket' className='text-gray-700'>Suport</a>
        <p className="text-gray-700 text-xs">© 2025 Aurion Runes Platform</p>
      </div>
    </div>
  );
}
