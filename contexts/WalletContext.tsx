'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react';
import { checkWalletConnection } from '@/components/ui/WalletCtx/WalletsProviders/Unisat';
import { getUserByWallet } from '@/utils/supabase/queries';
import { fromSatoshis } from '@/utils/helpers';

export interface WalletData {
  address: string;
  signature?: string;
  odinData?: any;
}

export interface UserData {
  address: string;
  id: string;
  username: string;
  trophies: number;
  level: number;
  match: any;
  odinData: any;
  avatar_url: string;
}

interface WalletContextType {
  user: UserData | null;
  walletData: WalletData | null;
  token: any;
  balance: any;
  setWalletData: (data: WalletData | null) => void;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const WALLET_STORAGE_KEY = 'aurion_wallet_data';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [walletData, setWalletDataState] = useState<WalletData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadWalletFromStorage = async () => {
      try {
        const savedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
        if (savedWallet) {
          const parsedWallet = JSON.parse(savedWallet);

          const { address, isConnected } = await checkWalletConnection();

          if (isConnected && address === parsedWallet.address) {
            setWalletDataState(parsedWallet);
            console.log(
              '🔄 Wallet carregada do localStorage e validada:',
              parsedWallet.address
            );
          } else {
            // localStorage.removeItem(WALLET_STORAGE_KEY);
            console.log('Remove local storage');
          }
        }
      } catch (error) {
        console.error('erfro', error);
        // localStorage.removeItem(WALLET_STORAGE_KEY);
        console.log('Remove local storage');
      } finally {
        setIsInitialized(true);
      }
    };

    loadWalletFromStorage();

    setInterval(() => {
      getToken();
    }, 4000);
  }, []);

  useEffect(() => {
    console.log({ walletData, user });
    if (walletData && walletData != null && user == null) {
      getUserInfo(walletData);
    }
  }, [walletData]);

  const getToken = async () => {
    // https://api.odin.fun/v1/tokens
    try {
      const response = await fetch(`https://api.odin.fun/v1/token/2k6r`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      const btcPriceResponse = await fetch(
        `https://api.odin.fun/v1/currency/btc`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const btcPriceData = await btcPriceResponse.json();
      const btcUsd = btcPriceData.amount;
      const satsTokenPrice = result.price / 1000;
      const btcTokenPrice = fromSatoshis(satsTokenPrice);
      const dolarToken = btcTokenPrice * btcUsd;
      const priceDolar = Number(dolarToken.toFixed(5));
      const newToken = { ...result, priceDolar };
      console.log({ newToken });

      setToken(newToken);
      return result.data;
    } catch (error: any) {
      return error;
    }
  };

  const formatBalance = (balance: number, divisibility: number) => {
    return balance / Math.pow(10, divisibility);
  };

  const getBalance = async (principal: string) => {
    // https://api.odin.fun/v1/tokens
    try {
      const response = await fetch(
        `https://api.odin.fun/v1/user/${principal}/balances?lp=true&limit=999999`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      // @ts-ignore
      const tokenBalance = result.data.filter((t) => t.id == '2k6r')[0] || null;
      const balance = tokenBalance.balance;
      const divisibility = tokenBalance.divisibility;

      const humanReadable = balance / Math.pow(10, divisibility+3);
      console.log({ balance2: result, balance, divisibility, humanReadable });

      setBalance(humanReadable);
      return result.data;
    } catch (error: any) {
      return error;
    }
  };

  const getUserInfo = async (payload: WalletData) => {
    const userData = await getUserByWallet(payload);

    console.log({ user: userData });
    if (userData) {
      getBalance(userData.user.odinData.userPrincipal);
      setUser(userData.user);
    }
  };

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
        // localStorage.removeItem(WALLET_STORAGE_KEY);
        console.log('Remove local storage');
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
    <WalletContext.Provider
      value={{ walletData, setWalletData, disconnectWallet, user, token , balance}}
    >
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
