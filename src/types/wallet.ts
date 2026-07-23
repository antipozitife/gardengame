export interface WalletContextValue {
  publicKey: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
}
