import React from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../../hooks/useGarden';
import FlowerCardSkeleton from '../ui/Skeleton/FlowerCardSkeleton';
import ErrorState from '../ui/ErrorState/ErrorState';
import Spinner from '../ui/Spinner/Spinner';
import './MyGarden.css';

const MyGarden: React.FC = () => {
  const {
    flowers,
    loading,
    userBalance,
    balanceError,
    loadError,
    totalFlowers,
    isConnected,
    wateringCost,
    canWaterFlower,
    waterFlower,
    reload,
  } = useGarden();

  if (!isConnected) {
    return (
      <section className="my-garden glass-card">
        <h2 className="garden-title">Мой сад</h2>
        <div className="empty">Подключите кошелёк для просмотра сада</div>
      </section>
    );
  }

  return (
    <motion.section
      className="my-garden glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <h2 className="garden-title">Мой сад ({totalFlowers})</h2>

      {typeof userBalance === 'number' && (
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
          onAction={() => void reload()}
        />
      )}

      {loadError && (
        <ErrorState
          title="Сад недоступен"
          message={loadError}
          actionLabel="Повторить"
          onAction={() => void reload()}
        />
      )}

      {loading && flowers.length === 0 ? (
        <FlowerCardSkeleton count={3} />
      ) : flowers.length === 0 ? (
        <div className="empty">У вас пока нет цветов. Купите первый цветок в магазине!</div>
      ) : (
        <div className="flowers-grid">
          {flowers.map((flower) => {
            const waterCheck = canWaterFlower(flower.lastWatered);

            return (
              <motion.article
                key={flower.id}
                className="flower-card"
                whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              >
                <div className="rarity-badge" style={{ backgroundColor: flower.rarityColor }}>
                  {flower.rarity}
                </div>
                <div className="flower-image-wrapper">
                  <img
                    src={flower.image}
                    alt={flower.name}
                    className="flower-image"
                    loading="lazy"
                  />
                </div>
                <h3 className="flower-name">{flower.name}</h3>
                <div className="flower-income">
                  <span>Количество</span>
                  <span>{flower.quantity} шт.</span>
                </div>
                <div className="flower-income">
                  <span>Доход</span>
                  <span>+{flower.incomeValue} XLM/день</span>
                </div>
                <div className="moisture-level">
                  <div className="moisture-label">
                    <span>Влажность</span>
                    <strong>{flower.waterLevel}%</strong>
                  </div>
                  <div className="moisture-bar">
                    <div
                      className="moisture-fill"
                      style={{
                        width: `${flower.waterLevel}%`,
                        backgroundColor: flower.waterLevel > 50 ? 'var(--accent)' : 'var(--danger)',
                      }}
                    />
                  </div>
                </div>
                <button
                  className="water-button"
                  onClick={() => void waterFlower(flower.id, flower.lastWatered)}
                  disabled={loading || !waterCheck.canWater}
                >
                  {loading ? (
                    <Spinner size="sm" label="Полив..." />
                  ) : !waterCheck.canWater ? (
                    `Через ${waterCheck.hoursLeft} ч.`
                  ) : (
                    `Полить за ${wateringCost} XLM`
                  )}
                </button>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};

export default MyGarden;
