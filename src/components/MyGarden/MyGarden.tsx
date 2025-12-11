// src/components/MyGarden/MyGarden.tsx
import React, { useState, useEffect } from 'react';
import './MyGarden.css';
import { getFLWBalance, getUserGarden, sellBouquet, waterFlowers } from '../../services/stellar';
import { gardenDB } from '../../services/gardenDB';

interface Flower {
  id: number;
  name: string;
  quantity: number;
  purchaseDate: number;
  totalIncome: number;
}

interface Bouquet {
  id: string;
  flowers: { id: number; name: string; count: number }[];
  price: number;
  createdAt: number;
}

interface MyGardenProps {
  publicKey: string | null;
}

const MyGarden: React.FC<MyGardenProps> = ({ publicKey }) => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'flowers' | 'bouquets' | 'history'>('flowers');

  const FLOWER_NAMES = ['Астра', 'Ромашка', 'Гвоздика', 'Роза', 'Эустома'];
  const FLOWER_PRICES = [10, 25, 50, 100, 200];
  const WATERING_COST = 5;

  useEffect(() => {
    if (publicKey) {
      loadGardenData();
      // Обновляем данные каждые 30 секунд
      const interval = setInterval(loadGardenData, 30000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  const loadGardenData = async () => {
    if (!publicKey) return;

    setLoading(true);
    try {
      // Получаем баланс FLW из контракта
      const flwBalance = await getFLWBalance(publicKey);
      setBalance(flwBalance);

      // Получаем данные о цветах из контракта
      const gardenData = await getUserGarden(publicKey);
      
      // Формируем массив цветов с количеством
      const loadedFlowers: Flower[] = gardenData
        .map((quantity, index) => ({
          id: index + 1,
          name: FLOWER_NAMES[index],
          quantity,
          purchaseDate: Date.now(),
          totalIncome: quantity * (index + 1) * 0.5,
        }))
        .filter((f) => f.quantity > 0);

      setFlowers(loadedFlowers);

      // Загружаем букеты из localStorage
      const savedBouquets = localStorage.getItem(`bouquets_${publicKey}`);
      if (savedBouquets) {
        setBouquets(JSON.parse(savedBouquets));
      }

      // Загружаем историю из IndexedDB
      await loadHistory();
    } catch (error) {
      console.error('Ошибка загрузки сада:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!publicKey) return;
    try {
      const history = await gardenDB.getFlowersByUser(publicKey);
      console.log('История покупок:', history);
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  };

  const handleWater = async () => {
    if (!publicKey) return;

    if (balance < WATERING_COST) {
      alert(`Недостаточно FLW для полива! Нужно ${WATERING_COST} FLW`);
      return;
    }

    setLoading(true);
    try {
      await waterFlowers(publicKey, WATERING_COST);
      alert('Цветы политы! 💧');
      await loadGardenData();
    } catch (error) {
      console.error('Ошибка полива:', error);
      alert('Ошибка при поливе цветов');
    } finally {
      setLoading(false);
    }
  };

  const createBouquet = () => {
    if (flowers.length === 0) {
      alert('У вас нет цветов для букета!');
      return;
    }

    const bouquetFlowers = flowers.map((f) => ({
      id: f.id,
      name: f.name,
      count: Math.min(f.quantity, 3),
    }));

    const price = bouquetFlowers.reduce((sum, f) => sum + f.count * FLOWER_PRICES[f.id - 1], 0);

    const newBouquet: Bouquet = {
      id: Date.now().toString(),
      flowers: bouquetFlowers,
      price,
      createdAt: Date.now(),
    };

    const updatedBouquets = [...bouquets, newBouquet];
    setBouquets(updatedBouquets);
    
    if (publicKey) {
      localStorage.setItem(`bouquets_${publicKey}`, JSON.stringify(updatedBouquets));
    }
    
    alert('Букет создан! 💐');
  };

  const handleSellBouquet = async (bouquet: Bouquet) => {
    if (!publicKey) return;

    setLoading(true);
    try {
      await sellBouquet(publicKey, bouquet.price);

      // Удаляем букет
      const updatedBouquets = bouquets.filter((b) => b.id !== bouquet.id);
      setBouquets(updatedBouquets);
      localStorage.setItem(`bouquets_${publicKey}`, JSON.stringify(updatedBouquets));

      alert(`Букет продан за ${bouquet.price} FLW! 💐`);
      await loadGardenData();
    } catch (error) {
      console.error('Ошибка продажи:', error);
      alert('Ошибка при продаже букета');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU');
  };

  if (!publicKey) {
    return (
      <div className="my-garden">
        <p>Подключите кошелек для просмотра сада</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="my-garden">
        <p>Загрузка вашего сада...</p>
      </div>
    );
  }

  return (
    <div className="my-garden">
      <div className="garden-header">
        <h2>🌻 Мой сад</h2>
        <div className="balance-info">
          <span>Баланс: {balance.toFixed(2)} FLW</span>
          <button onClick={handleWater} disabled={loading} className="water-all-btn">
            💧 Полить все ({WATERING_COST} FLW)
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'flowers' ? 'active' : ''}
          onClick={() => setActiveTab('flowers')}
        >
          Мои цветы ({flowers.length})
        </button>
        <button
          className={activeTab === 'bouquets' ? 'active' : ''}
          onClick={() => setActiveTab('bouquets')}
        >
          Букеты ({bouquets.length})
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          История
        </button>
      </div>

      {activeTab === 'flowers' && (
        <div className="flowers-list">
          {flowers.length === 0 ? (
            <p className="empty">Купите свои первые цветы в магазине!</p>
          ) : (
            <>
              {flowers.map((flower) => (
                <div key={flower.id} className="flower-item">
                  <h3>🌸 {flower.name}</h3>
                  <p>
                    <strong>Количество:</strong> {flower.quantity}
                  </p>
                  <p>
                    <strong>Заработано:</strong> {flower.totalIncome.toFixed(2)} FLW
                  </p>
                  <p className="date">Куплен: {formatDate(flower.purchaseDate)}</p>
                </div>
              ))}
              <button onClick={createBouquet} className="create-bouquet-btn" disabled={loading}>
                Создать букет
              </button>
            </>
          )}
        </div>
      )}

      {activeTab === 'bouquets' && (
        <div className="bouquets-list">
          {bouquets.length === 0 ? (
            <p className="empty">
              У вас пока нет букетов
              <br />
              Соберите букет из ваших цветов на вкладке "Мои цветы"
            </p>
          ) : (
            bouquets.map((bouquet) => (
              <div key={bouquet.id} className="bouquet-item">
                <h3>💐 Букет</h3>
                <div className="bouquet-flowers">
                  {bouquet.flowers.map((f) => (
                    <span key={f.id}>
                      {f.name} x{f.count}
                    </span>
                  ))}
                </div>
                <p>
                  <strong>Цена:</strong> {bouquet.price} FLW
                </p>
                <p className="date">Создан: {formatDate(bouquet.createdAt)}</p>
                <button
                  onClick={() => handleSellBouquet(bouquet)}
                  disabled={loading}
                  className="sell-btn"
                >
                  {loading ? 'Продажа...' : 'Продать'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-list">
          <p className="empty">История загружается из контракта...</p>
        </div>
      )}
    </div>
  );
};

export default MyGarden;
