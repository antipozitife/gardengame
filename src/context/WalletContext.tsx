import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { connectAlbedo } from '../services/stellar';

const WALLET_STORAGE_KEY = 'walletPublicKey';
const WALLET_TYPE_KEY = 'walletType';

interface WalletContextValue {
  publicKey: string | null;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(WALLET_STORAGE_KEY);
    if (saved) {
      setPublicKey(saved);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    const key = await connectAlbedo();
    localStorage.setItem(WALLET_STORAGE_KEY, key);
    localStorage.setItem(WALLET_TYPE_KEY, 'albedo');
    setPublicKey(key);
    return key;
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
    localStorage.removeItem(WALLET_TYPE_KEY);
    setPublicKey(null);
  }, []);

  return (
    <WalletContext.Provider value={{ publicKey, connectWallet, disconnectWallet }}>
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
