import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFlowers } from '../../hooks/useFlowers';
import ErrorState from '../ui/ErrorState/ErrorState';
import Spinner from '../ui/Spinner/Spinner';
import WalletModal from '../WalletModal/WalletModal';
import './FlowerShop.css';

const FlowerShop: React.FC = () => {
  const {
    flowers,
    userBalance,
    balanceError,
    isLoading,
    purchaseLabel,
    isConnected,
    buy,
    refreshBalance,
  } = useFlowers();
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <motion.section
      className="flower-shop glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="shop-title">Магазин цветов</h2>

      {isConnected && typeof userBalance === 'number' && (
        <div className="balance-display">
          <span>Ваш баланс</span>
          <strong>{userBalance.toFixed(2)} XLM</strong>
        </div>
      )}

      {balanceError && (
        <ErrorState
          title="Ошибка баланса"
          message={balanceError}
          actionLabel="Повторить"
          onAction={() => void refreshBalance()}
        />
      )}

      {isLoading && purchaseLabel && (
        <div className="purchase-progress">
          <Spinner label={purchaseLabel} />
        </div>
      )}

      {!isConnected && (
        <div className="connect-wallet-section">
          <button className="btn btn-primary" onClick={() => setShowWalletModal(true)}>
            Подключить кошелёк
          </button>
          <p className="warning-message">Подключите кошелёк для покупки цветов</p>
        </div>
      )}

      <div className="flowers-grid">
        {flowers.map((flower, index) => (
          <motion.article
            key={flower.id}
            className="flower-card"
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 320, damping: 20 }}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <div className="rarity-badge" style={{ backgroundColor: flower.rarityColor }}>
              {flower.rarity}
            </div>
            <img src={flower.image} alt={flower.name} className="flower-image" loading="lazy" />
            <h3 className="flower-name">{flower.name}</h3>
            <div className="flower-price">
              <span className="price-value">{flower.price}</span>
              <span className="price-currency">XLM</span>
            </div>
            <button
              className="buy-button"
              onClick={() => void buy(flower)}
              disabled={
                isLoading || !isConnected || (userBalance !== null && userBalance < flower.price)
              }
            >
              {isLoading ? <Spinner size="sm" label="Покупка..." /> : 'Купить'}
            </button>
          </motion.article>
        ))}
      </div>

      {showWalletModal && (
        <WalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={() => setShowWalletModal(false)}
        />
      )}
    </motion.section>
  );
};

export default FlowerShop;
