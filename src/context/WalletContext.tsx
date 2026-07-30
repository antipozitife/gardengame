import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { connectAlbedo } from '../services/stellar';
import { WALLET_STORAGE_KEY, WALLET_TYPE_KEY } from '../constants/storage';
import type { WalletContextValue } from '../types';
import { DEMO_PUBLIC_KEY } from '../services/demoGame';
import { GAME_ACCESS_MODE } from '../constants/gameMode';

const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);
    const walletType = localStorage.getItem(WALLET_TYPE_KEY);
    if (saved && !(GAME_ACCESS_MODE === 'wallet' && walletType === 'demo')) {
      setPublicKey(saved);
      setIsDemo(walletType === 'demo');
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const key = await connectAlbedo();
    localStorage.setItem(WALLET_STORAGE_KEY, key);
    localStorage.setItem(WALLET_TYPE_KEY, 'albedo');
    setIsDemo(false);
    setPublicKey(key);
    return key;
  }, []);

  const startDemo = useCallback(() => {
    localStorage.setItem(WALLET_STORAGE_KEY, DEMO_PUBLIC_KEY);
    localStorage.setItem(WALLET_TYPE_KEY, 'demo');
    setPublicKey(DEMO_PUBLIC_KEY);
    setIsDemo(true);
    return DEMO_PUBLIC_KEY;
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(WALLET_TYPE_KEY);
    setPublicKey(null);
    setIsDemo(false);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        isConnected: Boolean(publicKey),
        isDemo,
        connectWallet,
        startDemo,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};
