import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useTheme } from '../context/ThemeContext';
import ProfileInfo from '../components/ProfileInfo/ProfileInfo';
import FlowerShop from '../components/FlowerShop/FlowerShop';
import MyGarden from '../components/MyGarden/MyGarden';
import WalletModal from '../components/WalletModal/WalletModal';
import './GamePage.css';

const GamePage: React.FC = () => {
  const { publicKey } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setShowWalletModal(true);
    }
  }, [publicKey]);

  return (
    <div className="game-page">
      <div className="game-toolbar">
        <Link className="btn btn-ghost" to="/">
          На главную
        </Link>
        <button type="button" className="btn btn-ghost" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
      </div>
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
