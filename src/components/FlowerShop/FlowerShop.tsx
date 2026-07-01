import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { buyFlower, getXLMBalance } from '../../services/stellar';
import { gardenDB } from '../../services/gardenDB';
import { FLOWERS, Flower } from '../../data/flowers';
import { getErrorMessage } from '../../utils/getErrorMessage';
import './FlowerShop.css';
import WalletModal from '../WalletModal/WalletModal';

const FlowerShop: React.FC = () => {
  const { publicKey } = useWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  const walletConnected = Boolean(publicKey);

  const fetchBalance = async (key: string) => {
    setBalanceError('');
    try {
      const balance = await getXLMBalance(key);
      setUserBalance(balance);
    } catch (error) {
      setUserBalance(null);
      setBalanceError(getErrorMessage(error, 'Не удалось загрузить баланс'));
    }
  };

  useEffect(() => {
    void gardenDB.init();
  }, []);

  useEffect(() => {
    if (publicKey) {
      void fetchBalance(publicKey);
    } else {
      setUserBalance(null);
      setBalanceError('');
    }
  }, [publicKey]);

  const handleBuy = async (flower: Flower) => {
    if (!publicKey) {
      setPurchaseMessage('❌ Подключите кошелек!');
      setTimeout(() => setPurchaseMessage(''), 3000);
      return;
    }

    if (userBalance !== null && userBalance < flower.price) {
      setPurchaseMessage('❌ Недостаточно XLM!');
      setTimeout(() => setPurchaseMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    setPurchaseMessage(`⏳ Покупка ${flower.name}...`);

    try {
      const txHash = await buyFlower(publicKey, flower.id, flower.price, flower.name);
      setPurchaseMessage(`✅ Вы купили ${flower.name}! TX: ${txHash.substring(0, 8)}...`);

      await fetchBalance(publicKey);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: unknown) {
      setPurchaseMessage(`❌ ${getErrorMessage(error, 'Не удалось купить цветок')}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setPurchaseMessage(''), 5000);
    }
  };

  return (
    <div className="flower-shop">
      <h2 className="shop-title">🛒 Магазин цветов</h2>

      {walletConnected && userBalance !== null && (
        <div className="balance-display">
          <span>Ваш баланс:</span>
          <strong>{userBalance.toFixed(2)} XLM</strong>
        </div>
      )}

      {balanceError && <div className="purchase-message">{balanceError}</div>}

      {purchaseMessage && <div className="purchase-message">{purchaseMessage}</div>}

      {!walletConnected && (
        <div className="connect-wallet-section">
          <button
            className="connect-wallet-btn"
            onClick={() => setShowWalletModal(true)}
          >
            🔗 Подключить кошелек
          </button>
        </div>
      )}

      {!walletConnected && (
        <div className="warning-message">⚠️ Подключите кошелек для покупки цветов</div>
      )}

      <div className="flowers-grid">
        {FLOWERS.map((flower) => (
          <div key={flower.id} className="flower-card">
            <div className="rarity-badge" style={{ backgroundColor: flower.rarityColor }}>
              {flower.rarity}
            </div>
            <img src={flower.image} alt={flower.name} className="flower-image" />
            <h3 className="flower-name">{flower.name}</h3>

            <div className="flower-price">
              <span className="price-value">{flower.price}</span>
              <span className="price-currency">XLM</span>
            </div>
            <button
              className="buy-button"
              onClick={() => handleBuy(flower)}
              disabled={
                isLoading ||
                !walletConnected ||
                (userBalance !== null && userBalance < flower.price)
              }
            >
              {isLoading ? '⏳' : 'Купить'}
            </button>
          </div>
        ))}
      </div>

      {showWalletModal && (
        <WalletModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onConnect={() => setShowWalletModal(false)}
        />
      )}
    </div>
  );
};

export default FlowerShop;
