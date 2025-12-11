import React, { useState, useEffect } from 'react';
import ProfileInfo from '../components/ProfileInfo/ProfileInfo';
import FlowerShop from '../components/FlowerShop/FlowerShop';
import MyGarden from '../components/MyGarden/MyGarden';
import Footer from '../components/Footer/Footer';
import WalletModal from '../components/WalletModal/WalletModal';

const GamePage: React.FC = () => {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('walletPublicKey');
    if (savedKey) {
      setPublicKey(savedKey);
    } else {
      setIsWalletModalOpen(true);
    }
  }, []);

  const handleWalletConnect = (key: string) => {
    setPublicKey(key);
    localStorage.setItem('walletPublicKey', key);
    setIsWalletModalOpen(false);
  };

  return (
    <div className="game-page">
      <div className="game-content">
        <ProfileInfo />
        <FlowerShop />
        <MyGarden publicKey={publicKey} />
      </div>
      <Footer />
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  );
};

export default GamePage;
