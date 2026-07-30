export interface WalletContextValue {
  publicKey: string | null;
  isConnected: boolean;
  isDemo: boolean;
  connectWallet: () => Promise<string>;
  startDemo: () => string;
  disconnectWallet: () => void;
}
