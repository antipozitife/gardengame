import React, { useState, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import './MyGarden.css';
import { waterSingleFlower, getLastWatering, getXLMBalance } from '../../services/stellar';
import { gardenDB } from '../../services/gardenDB';
import { getFlowerById } from '../../data/flowers';
import { getErrorMessage } from '../../utils/getErrorMessage';

interface OwnedFlower {
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

const WATERING_COST = 1;
const WATERING_COOLDOWN = 24 * 60 * 60;

const MyGarden: React.FC = () => {
  const { publicKey } = useWallet();
  const [flowers, setFlowers] = useState<OwnedFlower[]>([]);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [wateringMessage, setWateringMessage] = useState('');

  const calculateWaterLevel = (lastWatered: number): number => {
    if (lastWatered === 0) return 50;

    const now = Math.floor(Date.now() / 1000);
    const timePassed = now - lastWatered;
    const hoursPassed = timePassed / 3600;
    const decreaseRate = 10 / 6;
    const decrease = hoursPassed * decreaseRate;

    return Math.round(Math.max(0, 100 - decrease));
  };

  const loadGardenData = async () => {
    if (!publicKey) return;
    try {
      setLoading(true);
      const purchases = await gardenDB.getAllFlowers();
      const userPurchases = purchases.filter((p) => p.publicKey === publicKey);

      const flowerMap = new Map<number, OwnedFlower>();

      for (const purchase of userPurchases) {
        const existing = flowerMap.get(purchase.flowerId);

        if (existing) {
          existing.quantity += 1;
        } else {
          const data = getFlowerById(purchase.flowerId);
          let lastWatered = 0;

          try {
            lastWatered = Number(await getLastWatering(publicKey, purchase.flowerId));
          } catch {
            lastWatered = 0;
          }

          flowerMap.set(purchase.flowerId, {
            id: purchase.flowerId,
            name: data?.name ?? purchase.flowerName,
            quantity: 1,
            waterLevel: calculateWaterLevel(lastWatered),
            lastWatered,
            image: data?.image ?? '',
            rarity: data?.rarity ?? '',
            rarityColor: data?.rarityColor ?? '',
            incomeValue: data?.incomeValue ?? 0,
          });
        }
      }

      setFlowers(Array.from(flowerMap.values()));
    } catch {
      setFlowers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    if (!publicKey) return;
    setBalanceError('');
    try {
      const balance = await getXLMBalance(publicKey);
      setUserBalance(balance);
    } catch (error) {
      setUserBalance(null);
      setBalanceError(getErrorMessage(error, 'Не удалось загрузить баланс'));
    }
  };

  useEffect(() => {
    if (publicKey) {
      void loadGardenData();
      void fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

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
      setWateringMessage('❌ Недостаточно XLM!');
      setTimeout(() => setWateringMessage(''), 3000);
      return;
    }

    setLoading(true);
    setWateringMessage('⏳ Поливаем цветок...');

    try {
      await waterSingleFlower(publicKey, flowerId, WATERING_COST);
      setWateringMessage('✅ Цветок полит! 💧');
      await loadGardenData();
      await fetchBalance();
      setTimeout(() => setWateringMessage(''), 3000);
    } catch (error: unknown) {
      setWateringMessage(`❌ ${getErrorMessage(error, 'Не удалось полить цветок')}`);
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
      <h2 className="garden-title">🌸 Мой сад ({totalFlowers})</h2>

      {userBalance !== null && (
        <div className="balance-display">
          <span>Ваш баланс:</span>
          <strong>{userBalance.toFixed(2)} XLM</strong>
        </div>
      )}

      {balanceError && <div className="watering-message">{balanceError}</div>}

      {wateringMessage && <div className="watering-message">{wateringMessage}</div>}

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
                  <span>+{flower.incomeValue} XLM/день</span>
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
                        backgroundColor: flower.waterLevel > 50 ? '#48bb78' : '#f56565',
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
                    : `💧 Полить за ${WATERING_COST} XLM`}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyGarden;
