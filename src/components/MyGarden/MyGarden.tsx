import React, { useState, useEffect } from 'react';
import './MyGarden.css';
import { waterSingleFlower, getLastWatering, getFLWBalance } from '../../services/stellar';
import { gardenDB } from '../../services/gardenDB';
import astra from '../../assets/astra.avif';
import romashka from '../../assets/romashka.png';
import gvozdika from '../../assets/gvozdika.png';
import roza from '../../assets/roza.png';
import eustoma from '../../assets/eustoma.png';

interface Flower {
  id: number;
  name: string;
  image: string;
  quantity: number;
  waterLevel: number;
  rarity: string;
  rarityColor: string;
  incomeValue: number;
  lastWatered: number;
}

type TabType = 'flowers' | 'bouquets';

const MyGarden: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('flowers');
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [wateringMessage, setWateringMessage] = useState('');
  
  const publicKey = localStorage.getItem('walletPublicKey');
  const WATERING_COST = 1;
  const WATERING_COOLDOWN = 24 * 60 * 60; // 24 часа в секундах

  const flowerData: Record<number, { name: string; image: string; rarity: string; rarityColor: string; incomeValue: number }> = {
    1: { name: 'Астра', image: astra, rarity: 'Обычная', rarityColor: '#718096', incomeValue: 0.5 },
    2: { name: 'Ромашка', image: romashka, rarity: 'Необычная', rarityColor: '#48BB78', incomeValue: 1.2 },
    3: { name: 'Гвоздика', image: gvozdika, rarity: 'Редкая', rarityColor: '#4299E1', incomeValue: 3 },
    4: { name: 'Роза', image: roza, rarity: 'Эпическая', rarityColor: '#9F7AEA', incomeValue: 7 },
    5: { name: 'Эустома', image: eustoma, rarity: 'Легендарная', rarityColor: '#ED8936', incomeValue: 15 },
  };

  useEffect(() => {
    if (publicKey) {
      loadGardenData();
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  const calculateWaterLevel = (lastWatered: number): number => {
  if (lastWatered === 0) return 50; // Новый цветок
  
  const now = Math.floor(Date.now() / 1000); // текущее время в секундах
  const timePassed = now - lastWatered;
  const hoursPassed = timePassed / 3600;
  
  // Уменьшаем на 10% каждые 6 часов
  const decreaseRate = 10 / 6;
  const decrease = hoursPassed * decreaseRate;
  
  const waterLevel = Math.max(0, 100 - decrease);
  return Math.round(waterLevel);
};

  const loadGardenData = async () => {
  if (!publicKey) return;
  try {
    setLoading(true);
    const purchases = await gardenDB.getAllFlowers();
    const userPurchases = purchases.filter((p: any) => p.publicKey === publicKey);
    
    const flowerMap = new Map();
    
    for (const purchase of userPurchases) {
      const existing = flowerMap.get(purchase.flowerId);
      
      if (existing) {
        existing.quantity += 1;
      } else {
        const data = flowerData[purchase.flowerId];
        
        // Получаем время последнего полива из контракта
        let lastWatered = 0;
        try {
          const lastWateredBigInt = await getLastWatering(publicKey, purchase.flowerId);
          // Конвертируем BigInt в number
          lastWatered = Number(lastWateredBigInt);
        } catch (error) {
          console.error(`Ошибка получения времени полива для цветка ${purchase.flowerId}:`, error);
        }
        
        const currentWaterLevel = calculateWaterLevel(lastWatered);
        
        flowerMap.set(purchase.flowerId, {
          id: purchase.flowerId,
          name: purchase.flowerName,
          quantity: 1,
          waterLevel: currentWaterLevel,
          lastWatered: lastWatered,
          image: data?.image || '',
          rarity: data?.rarity || '',
          rarityColor: data?.rarityColor || '',
          incomeValue: data?.incomeValue || 0,
        });
      }
    }
    
    setFlowers(Array.from(flowerMap.values()));
  } catch (error) {
    console.error('Ошибка загрузки сада:', error);
  } finally {
    setLoading(false);
  }
};

  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const balance = await getFLWBalance(publicKey);
      setUserBalance(balance);
    } catch (error) {
      console.error('Ошибка получения баланса:', error);
    }
  };

  const canWaterFlower = (lastWatered: number): { canWater: boolean; hoursLeft: number } => {
    if (lastWatered === 0) return { canWater: true, hoursLeft: 0 };
    
    const now = Math.floor(Date.now() / 1000);
    const timeSinceWatering = now - lastWatered;
    
    if (timeSinceWatering >= WATERING_COOLDOWN) {
      return { canWater: true, hoursLeft: 0 };
    }
    
    const hoursLeft = Math.ceil((WATERING_COOLDOWN - timeSinceWatering) / 3600);
    return { canWater: false, hoursLeft };
  };

  const handleWaterFlower = async (flowerId: number, lastWatered: number) => {
    if (!publicKey) return;
    
    const waterCheck = canWaterFlower(lastWatered);
    if (!waterCheck.canWater) {
      setWateringMessage(`⏳ Этот цветок можно полить через ${waterCheck.hoursLeft} ч.`);
      setTimeout(() => setWateringMessage(''), 3000);
      return;
    }

    if (userBalance !== null && userBalance < WATERING_COST) {
      setWateringMessage('❌ Недостаточно FLW!');
      setTimeout(() => setWateringMessage(''), 3000);
      return;
    }

    setLoading(true);
    setWateringMessage('⏳ Поливаем цветок...');
    
    try {
      const txHash = await waterSingleFlower(publicKey, flowerId, WATERING_COST);
      console.log(`✅ Цветок полит: ${txHash}`);
      
      setWateringMessage('✅ Цветок полит! 💧');
      
      // Обновляем данные
      await loadGardenData();
      await fetchBalance();
      
      setTimeout(() => setWateringMessage(''), 3000);
    } catch (error: any) {
      setWateringMessage(`❌ Ошибка: ${error.message}`);
      setTimeout(() => setWateringMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="my-garden">
        <h2 className="garden-title">🌸 Мой сад</h2>
        <div className="empty">Подключите кошелек для просмотра сада</div>
      </div>
    );
  }

  const totalFlowers = flowers.reduce((sum, f) => sum + f.quantity, 0);

  return (
    <div className="my-garden">
      <h2 className="garden-title">🌸 Мой сад</h2>
      
      {userBalance !== null && (
        <div className="balance-display">
          <span>Ваш баланс:</span>
          <strong>{userBalance.toFixed(2)} FLW</strong>
        </div>
      )}

      {wateringMessage && (
        <div className="watering-message">{wateringMessage}</div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'flowers' ? 'active' : ''}
          onClick={() => setActiveTab('flowers')}
        >
          🌺 Мои цветы ({totalFlowers})
        </button>
        <button
          className={activeTab === 'bouquets' ? 'active' : ''}
          onClick={() => setActiveTab('bouquets')}
        >
          💐 Собранные букеты (0)
        </button>
      </div>

      {activeTab === 'flowers' && (
        <>
          {flowers.length === 0 ? (
            <div className="empty">
              У вас пока нет цветов. Купите первый цветок в магазине! 🛒
            </div>
          ) : (
            <div className="flowers-grid">
              {flowers.map((flower) => {
                const waterCheck = canWaterFlower(flower.lastWatered);
                
                return (
                  <div key={flower.id} className="flower-card">
                    <div className="rarity-badge" style={{ backgroundColor: flower.rarityColor }}>
                      {flower.rarity}
                    </div>
                    
                    <div className="flower-image-wrapper">
                      <img src={flower.image} alt={flower.name} className="flower-image" />
                    </div>
                    
                    <h3 className="flower-name">{flower.name}</h3>
                    
                    <div className="flower-income">
                      <span>Количество:</span>
                      <span>{flower.quantity} шт.</span>
                    </div>
                    
                    <div className="flower-income">
                      <span>Доход:</span>
                      <span>+{flower.incomeValue} FLW/день</span>
                    </div>

                    <div className="moisture-level">
                      <div className="moisture-label">
                        <span>💧 Влажность почвы</span>
                        <strong>{flower.waterLevel}%</strong>
                      </div>
                      <div className="moisture-bar">
                        <div 
                          className="moisture-fill" 
                          style={{ 
                            width: `${flower.waterLevel}%`,
                            backgroundColor: flower.waterLevel > 50 ? '#48bb78' : '#f56565'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      className="water-button"
                      onClick={() => handleWaterFlower(flower.id, flower.lastWatered)}
                      disabled={loading || !waterCheck.canWater}
                    >
                      {!waterCheck.canWater 
                        ? `⏳ Через ${waterCheck.hoursLeft} ч.`
                        : `💧 Полить за ${WATERING_COST} FLW`
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'bouquets' && (
        <div className="empty">
          Функция создания букетов скоро появится! 💐
        </div>
      )}
    </div>
  );
};

export default MyGarden;
