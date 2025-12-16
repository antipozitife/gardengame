// src/pages/GamePage.tsx
import React, { useState, useEffect } from 'react';
import ProfileInfo from '../components/ProfileInfo/ProfileInfo';
import FlowerShop from '../components/FlowerShop/FlowerShop';
import MyGarden from '../components/MyGarden/MyGarden';
import WalletModal from '../components/WalletModal/WalletModal';
import './GamePage.css';

const GamePage: React.FC = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('walletPublicKey');
    if (savedKey) {
      setPublicKey(savedKey);
    } else {
      setShowWalletModal(true);
    }
  }, []);

  const handleConnect = (key: string) => {
    setPublicKey(key);
    setShowWalletModal(false);
  };

  return (
    <div className="game-page">
      <div className="game-content">
        <ProfileInfo />
        <FlowerShop />
        <MyGarden />
      </div>
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleConnect}
      />
    </div>
  );
};

export default GamePage;
