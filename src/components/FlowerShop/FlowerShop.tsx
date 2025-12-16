// src/components/FlowerShop/FlowerShop.tsx
import React, { useState, useEffect } from 'react';
import { buyFlower, getFLWBalance } from '../../services/stellar';
import { gardenDB } from '../../services/gardenDB';
import astra from '../../assets/astra.avif';
import romashka from '../../assets/romashka.png';
import gvozdika from '../../assets/gvozdika.png';
import roza from '../../assets/roza.png';
import eustoma from '../../assets/eustoma.png';
import './FlowerShop.css';
import WalletModal from '../WalletModal/WalletModal';

interface Flower {
  id: number;
  name: string;
  image: string;
  price: number;
  income: string;
  incomeValue: number;
  rarity: string;
  rarityColor: string;
}

const FlowerShop: React.FC = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  const flowers: Flower[] = [
    {
      id: 1,
      name: 'Астра',
      image: astra,
      price: 10,
      income: '+0.5 FLW/день',
      incomeValue: 0.5,
      rarity: 'Обычная',
      rarityColor: '#718096',
    },
    {
      id: 2,
      name: 'Ромашка',
      image: romashka,
      price: 25,
      income: '+1.2 FLW/день',
      incomeValue: 1.2,
      rarity: 'Необычная',
      rarityColor: '#48BB78',
    },
    {
      id: 3,
      name: 'Гвоздика',
      image: gvozdika,
      price: 50,
      income: '+3 FLW/день',
      incomeValue: 3,
      rarity: 'Редкая',
      rarityColor: '#4299E1',
    },
    {
      id: 4,
      name: 'Роза',
      image: roza,
      price: 100,
      income: '+7 FLW/день',
      incomeValue: 7,
      rarity: 'Эпическая',
      rarityColor: '#9F7AEA',
    },
    {
      id: 5,
      name: 'Эустома',
      image: eustoma,
      price: 200,
      income: '+15 FLW/день',
      incomeValue: 15,
      rarity: 'Легендарная',
      rarityColor: '#ED8936',
    },
  ];

  useEffect(() => {
    checkWalletConnection();
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      await gardenDB.init();
    } catch (error) {
      console.error('Ошибка инициализации базы данных:', error);
    }
  };

  const checkWalletConnection = async () => {
    const key = localStorage.getItem('walletPublicKey');
    if (key) {
      setPublicKey(key);
      setWalletConnected(true);
      await fetchBalance(key);
    }
  };

  const fetchBalance = async (key: string) => {
    try {
      // Получаем баланс FLW из контракта
      const balance = await getFLWBalance(key);
      setUserBalance(balance);
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
      setUserBalance(0);
    }
  };

  const handleBuy = async (flower: Flower) => {
  console.log('🛒 Начало покупки цветка:', flower);
  
  if (!publicKey) {
    console.error('❌ PublicKey отсутствует');
    setPurchaseMessage('❌ Подключите кошелек!');
    setTimeout(() => setPurchaseMessage(''), 3000);
    return;
  }

  console.log('👤 PublicKey:', publicKey);

  if (userBalance !== null && userBalance < flower.price) {
    console.error('❌ Недостаточно средств:', userBalance, '<', flower.price);
    setPurchaseMessage('❌ Недостаточно FLW токенов!');
    setTimeout(() => setPurchaseMessage(''), 3000);
    return;
  }

  setIsLoading(true);
  setPurchaseMessage(`⏳ Покупка ${flower.name}...`);
  
  try {
    console.log('🔄 Вызов buyFlower:', {
      publicKey,
      flowerId: flower.id,
      price: flower.price,
      name: flower.name
    });
    
    const txHash = await buyFlower(publicKey, flower.id, flower.price, flower.name);
    
    console.log('✅ Транзакция успешна, txHash:', txHash);
    setPurchaseMessage(`✅ Вы купили ${flower.name}! TX: ${txHash.substring(0, 8)}...`);
    
    await fetchBalance(publicKey);
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  } catch (error: any) {
    console.error('❌ Ошибка при покупке:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      error
    });
    setPurchaseMessage(`❌ Ошибка: ${error.message || 'Не удалось купить цветок'}`);
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
          <strong>{userBalance.toFixed(2)} FLW</strong>
        </div>
      )}

      {purchaseMessage && (
        <div className="purchase-message">
          {purchaseMessage}
        </div>
      )}

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
        <div className="warning-message">
          ⚠️ Подключите кошелек для покупки цветов
        </div>
      )}

      <div className="flowers-grid">
        {flowers.map((flower) => (
          <div key={flower.id} className="flower-card">
            <div className="rarity-badge" style={{ backgroundColor: flower.rarityColor }}>
              {flower.rarity}
            </div>
            <img src={flower.image} alt={flower.name} className="flower-image" />
            <h3 className="flower-name">{flower.name}</h3>

            <div className="flower-price">
              <span className="price-value">{flower.price}</span>
              <span className="price-currency">FLW</span>
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
        onConnect={(key) => {
          setPublicKey(key);
          setWalletConnected(true);
          fetchBalance(key);
          setShowWalletModal(false);
        }}
      />
    )}
    </div>
  );
};

export default FlowerShop;
