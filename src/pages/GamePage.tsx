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
  const { publicKey, isDemo } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setShowWalletModal(true);
    }
  }, [publicKey]);

  return (
    <div className="game-page">
      <a className="skip-link" href="#game-content">
        Перейти к игре
      </a>
      <header className="game-toolbar" aria-label="Панель игры">
        {isDemo && <span className="demo-badge">Демо · без кошелька</span>}
        <Link className="btn btn-ghost" to="/">
          На главную
        </Link>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={toggleTheme}
          aria-pressed={theme === 'dark'}
          aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          {theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </header>
      <main id="game-content" className="game-content">
        <ProfileInfo />
        <FlowerShop />
        <MyGarden />
      </main>
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={() => setShowWalletModal(false)}
      />
    </div>
  );
};

export default GamePage;
