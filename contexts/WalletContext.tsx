'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { checkWalletConnection } from '@/components/ui/WalletCtx/WalletsProviders/Unisat';
import { getUserByWallet } from '@/utils/supabase/queries';

export interface WalletData {
  address: string;
  signature?: string;
}

export interface UserData {
  address: string;
  id: string;
  username: string;
  trophies: number;
  level: number;
}

interface WalletContextType {
  user: UserData | null;
  walletData: WalletData | null;
  setWalletData: (data: WalletData | null) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'aurion_wallet_data';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletData, setWalletDataState] = useState<WalletData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadWalletFromStorage = async () => {
      try {
        const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        if (savedWallet) {
          const parsedWallet = JSON.parse(savedWallet);
          
          const { address, isConnected } = await checkWalletConnection();
          
          if (isConnected && address === parsedWallet.address) {
            setWalletDataState(parsedWallet);
            console.log('🔄 Wallet carregada do localStorage e validada:', parsedWallet.address);
          } else {
            localStorage.removeItem(WALLET_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('erfro', error);
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } finally {
        setIsInitialized(true);
      }
    };

    loadWalletFromStorage();
  }, []);

  useEffect(() => {
    console.log({walletData, user})
    if(walletData && walletData != null && user == null) {
      getUserInfo(walletData)
    }
  }, [walletData]);

  const getUserInfo = async (payload: WalletData) => {
    const userData = await getUserByWallet(payload)

    console.log({userData})
      if(userData) {
        setUser(userData.user)
      }
  }

  const setWalletData = (data: WalletData | null) => {
    setWalletDataState(data);
    
    if (data) {
      try {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('erro', error);
      }
    } else {
      try {
        localStorage.removeItem(WALLET_STORAGE_KEY);
      } catch (error) {
        console.error('erro', error);
      }
    }
  };

  const disconnectWallet = () => {
    setWalletData(null);
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <WalletContext.Provider value={{ walletData, setWalletData, disconnectWallet, user }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 