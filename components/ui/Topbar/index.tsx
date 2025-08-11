'use client';

import { useWallet } from '@/contexts/WalletContext';
import coin from '@/app/logo.png';
import Modal from '../Modal/Modal';
import WalletInterface from '../AccountForms/Wallet';
import WalletConnect from '../WalletCtx/Wallet';

export default function Topbar() {
  const { user, token, walletData, disconnectWallet, balance } = useWallet();

  const handleDisconnect = () => {
    disconnectWallet();
  };

  return (
    <div className="w-full h-[46px] max-h-[46px] inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 p-1.5 px-6 grid grid-cols-[50%_25%_25%]">
      {/* Ascend bar */}
      <div className="flex h-full p-1 w-full gap-2">
        <div className="ascend-bar-container h-full max-w-1/2">
          {token?.progress && (
            <div
              className="ascend-bar flex justify-end items-center px-3 font-bold italic transition-all text-[9px]"
              style={{
                width: `${token?.progress ? token?.progress * 100 : 0}%`
              }}
            >
              Ascended: {(token?.progress * 100).toFixed(0)}%
            </div>
          )}
        </div>
        <p className="font-semibold text-[10px] 2xl:text-[10px]">
          🎁 Incredible rewards for top 6 holders!
        </p>
      </div>

      {/* Update */}
      <div className="h-full flex gap-2 items-center justify-center">
        <p className="font-semibold text-[10px] 2xl:text-[10px]">Next update:</p>
        <p className="bg-[#2cb1c3] p-1 rounded font-bold italic text-[10px] 2xl:text-[14px]">
          Coliseum - Soon!
        </p>{' '}
        /
        <a
          href="https://odin.fun/token/2k6r"
          className="bg-[#d65729] p-1 rounded font-bold text-[10px] 2xl:text-[14px]"
        >
          Buy Aurion
        </a>
      </div>

      {walletData ? (
        user ? (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={handleDisconnect}
              className="h-full w-auto text-left text-white hover:text-red-300 text-sm py-1 px-2 rounded cursor-pointer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.33333 5.33341V4.00008C9.33333 3.64646 9.19286 3.30732 8.94281 3.05727C8.69276 2.80722 8.35362 2.66675 8 2.66675H3.33333C2.97971 2.66675 2.64057 2.80722 2.39052 3.05727C2.14048 3.30732 2 3.64646 2 4.00008V12.0001C2 12.3537 2.14048 12.6928 2.39052 12.9429C2.64057 13.1929 2.97971 13.3334 3.33333 13.3334H8C8.35362 13.3334 8.69276 13.1929 8.94281 12.9429C9.19286 12.6928 9.33333 12.3537 9.33333 12.0001V10.6667"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M6 8H14L12 6"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M12 10L14 8"
                  stroke="currentColor"
                  strokeWidth="1.33333"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
            {/* Card */}
            <div className="bg-[#0e171e] flex items-center gap-2 px-2 rounded-sm h-full cursor-default">
              <img
                src={user?.avatar_url}
                className="w-5 h-5 rounded-lg max-h-full"
              />
              <div className="flex flex-col">
                <p className="text-[12px] font-bold text-white">
                  {user?.username}
                </p>
                {/* <span className="badge badge-sm badge-warning badge-outline font-bold">
                🏆 {user?.trophies}
              </span> */}
              </div>
            </div>

            {/* Card */}
            <div className="bg-[#0e171e] flex items-center gap-2 py-1 px-2 rounded-sm h-full cursor-default">
              <img src={coin.src} className="w-3 h-3 rounded-lg" />
              <div className="flex flex-col">
                {balance && <p className="text-[12px] font-bold text-white">{balance}</p>}
              </div>
            </div>
          </div>
        ) : (
          <></>
        )
      ) : (
        <Modal cta={{ text: 'Connect Wallet', type: 'primary' }}>
          <WalletConnect />
        </Modal>
      )}
    </div>
  );
}
