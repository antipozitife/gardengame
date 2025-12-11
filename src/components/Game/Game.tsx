import React, { useState, useEffect } from 'react';
import './Game.css';
import { buyFlower, getFLWBalance, waterFlowers } from '../../services/stellar';

interface Flower {
  id: number;
  name: string;
  price: number;
  income: number;
  rarity: string;
  image: string;
}

interface OwnedFlower extends Flower {
  quantity: number;
  waterLevel: number;
  lastWatered: number;
}

const FLOWERS: Flower[] = [
  { id: 1, name: 'Астра', price: 10, income: 0.5, rarity: 'Обычная', image: '/flowers/aster.png' },
  { id: 2, name: 'Ромашка', price: 25, income: 1.2, rarity: 'Обычная', image: '/flowers/daisy.png' },
  { id: 3, name: 'Гвоздика', price: 50, income: 3, rarity: 'Редкая', image: '/flowers/carnation.png' },
  { id: 4, name: 'Роза', price: 100, income: 7, rarity: 'Редкая', image: '/flowers/rose.png' },
  { id: 5, name: 'Эустома', price: 200, income: 15, rarity: 'Легендарная', image: '/flowers/eustoma.png' },
];

const WATERING_COST = 5; // FLW за полив

interface GameProps {
  publicKey: string | null;
}

const Game: React.FC<GameProps> = ({ publicKey }) => {
  const [balance, setBalance] = useState<number>(0);
  const [ownedFlowers, setOwnedFlowers] = useState<OwnedFlower[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (publicKey) {
      loadUserData();
      const interval = setInterval(() => {
        updateWaterLevels();
        calculateIncome();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  const loadUserData = async () => {
    if (!publicKey) return;
    
    try {
      const flwBalance = await getFLWBalance(publicKey);
      setBalance(flwBalance);
      
      // Загружаем цветы из localStorage (для демо)
      const savedFlowers = localStorage.getItem(`flowers_${publicKey}`);
      if (savedFlowers) {
        setOwnedFlowers(JSON.parse(savedFlowers));
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleBuyFlower = async (flower: Flower) => {
    if (!publicKey) {
      alert('Подключите кошелек!');
      return;
    }

    if (balance < flower.price) {
      alert('Недостаточно FLW токенов!');
      return;
    }

    setLoading(true);
    try {
      await buyFlower(publicKey, flower.id, flower.price, flower.name);
      
      // Обновляем локальное состояние
      const existing = ownedFlowers.find(f => f.id === flower.id);
      if (existing) {
        setOwnedFlowers(prev => prev.map(f => 
          f.id === flower.id 
            ? { ...f, quantity: f.quantity + 1 }
            : f
        ));
      } else {
        const newFlower: OwnedFlower = {
          ...flower,
          quantity: 1,
          waterLevel: 100,
          lastWatered: Date.now()
        };
        setOwnedFlowers(prev => [...prev, newFlower]);
      }

      // Обновляем баланс
      setBalance(prev => prev - flower.price);
      
      alert(`Вы купили ${flower.name}!`);
    } catch (error) {
      console.error('Ошибка покупки:', error);
      alert('Ошибка при покупке цветка');
    } finally {
      setLoading(false);
    }
  };

  const handleWaterFlowers = async () => {
    if (!publicKey) return;

    if (balance < WATERING_COST) {
      alert('Недостаточно FLW для полива!');
      return;
    }

    setLoading(true);
    try {
      await waterFlowers(publicKey, WATERING_COST);
      
      // Обновляем уровень воды
      setOwnedFlowers(prev => prev.map(f => ({
        ...f,
        waterLevel: 100,
        lastWatered: Date.now()
      })));
      
      setBalance(prev => prev - WATERING_COST);
      alert('Цветы политы! 💧');
    } catch (error) {
      console.error('Ошибка полива:', error);
      alert('Ошибка при поливе цветов');
    } finally {
      setLoading(false);
    }
  };

  const updateWaterLevels = () => {
    setOwnedFlowers(prev => prev.map(flower => {
      const timePassed = (Date.now() - flower.lastWatered) / 1000 / 60; // минуты
      const newLevel = Math.max(0, 100 - timePassed * 2); // -2% в минуту
      return { ...flower, waterLevel: newLevel };
    }));
  };

  const calculateIncome = () => {
    const income = ownedFlowers.reduce((sum, flower) => {
      const efficiency = flower.waterLevel / 100;
      return sum + (flower.income * flower.quantity * efficiency);
    }, 0);
    setTotalIncome(income);
  };

  // Сохраняем цветы в localStorage
  useEffect(() => {
    if (publicKey && ownedFlowers.length > 0) {
      localStorage.setItem(`flowers_${publicKey}`, JSON.stringify(ownedFlowers));
    }
  }, [ownedFlowers, publicKey]);

  if (!publicKey) {
    return (
      <div className="game-container">
        <div className="no-wallet">
          <h2>Подключите кошелек</h2>
          <p>Для игры необходимо подключить Stellar кошелек</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="wallet-info">
          <p>Кошелек: {publicKey.substring(0, 8)}...{publicKey.substring(publicKey.length - 8)}</p>
          <p className="balance">Баланс: {balance.toFixed(2)} FLW</p>
          <p className="income">Доход: {totalIncome.toFixed(4)} FLW/день
            {totalIncome > 0 && (
              <button onClick={handleWaterFlowers} disabled={loading} className="water-btn">
                💧 Полить ({WATERING_COST} FLW)
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="game-content">
        <div className="shop-section">
          <h2>🌸 Магазин цветов</h2>
          <div className="flowers-grid">
            {FLOWERS.map(flower => (
              <div key={flower.id} className={`flower-card ${flower.rarity.toLowerCase()}`}>
                <div className="flower-image">
                  <img src={flower.image} alt={flower.name} />
                </div>
                <h3>{flower.name}</h3>
                <p>Цена: {flower.price} FLW</p>
                <p>Доход: +{flower.income} FLW/день</p>
                <span className="rarity">{flower.rarity}</span>
                <button 
                  onClick={() => handleBuyFlower(flower)}
                  disabled={loading || balance < flower.price}
                  className="buy-btn"
                >
                  {loading ? 'Покупка...' : 'Купить'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="garden-section">
          <h2>🌺 Ваш сад</h2>
          {ownedFlowers.length === 0 ? (
            <p className="empty-garden">Купите свой первый цветок!</p>
          ) : (
            <div className="owned-flowers">
              {ownedFlowers.map(flower => (
                <div key={flower.id} className="owned-flower">
                  <img src={flower.image} alt={flower.name} />
                  <div className="flower-info">
                    <h4>{flower.name} x{flower.quantity}</h4>
                    <p>💧 Вода: {flower.waterLevel.toFixed(0)}%</p>
                    <p>💰 Доход: +{flower.income * flower.quantity} FLW/день</p>
                  </div>
                  <div className="water-bar">
                    <div 
                      className="water-level" 
                      style={{ width: `${flower.waterLevel}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Game;
