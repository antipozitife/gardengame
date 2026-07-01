import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import ProfileInfo from '../components/ProfileInfo/ProfileInfo';
import FlowerShop from '../components/FlowerShop/FlowerShop';
import MyGarden from '../components/MyGarden/MyGarden';
import WalletModal from '../components/WalletModal/WalletModal';
import './GamePage.css';

const GamePage: React.FC = () => {
  const { publicKey } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setShowWalletModal(true);
    }
  }, [publicKey]);

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
        onConnect={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default GamePage;
