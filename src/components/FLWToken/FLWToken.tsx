import React from 'react';
import './FLWToken.css';
import { getXLMPrice, getTokenStats, TokenStats } from '../../services/priceService';

const FLWToken: React.FC = () => {
  const [xlmPrice, setXlmPrice] = React.useState<number>(0);
  const [tokenStats, setTokenStats] = React.useState<TokenStats | null>(null);

  React.useEffect(() => {
    getXLMPrice().then(setXlmPrice);
    getTokenStats().then(setTokenStats);
  }, []);

  return (
    <section className="flw-token" id="flw-token-section">
      <div className="flw-container">
        <div className="flw-content">
          {/* ЛЕВАЯ ЧАСТЬ */}
          <div className="flw-left">
            <h2 className="flw-title">
              <span className="flw-icon">💰</span>
              FLW Token
            </h2>
            
            <div className="flw-description">
              <h3 className="flw-subtitle">Что такое FLW?</h3>
              <p className="flw-text">
                FLW (Flower Token) - внутригровой токен на блокчейне Stellar. Используй его для покупки цветов, полива и торговли.
              </p>
            </div>

            {/* ПРЕИМУЩЕСТВА */}
            <div className="flw-features">
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <div className="feature-text">
                  <h4>Быстрые транзакции</h4>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">💵</div>
                <div className="feature-text">
                  <h4>Низкие комиссии</h4>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <div className="feature-text">
                  <h4>Безопасность </h4>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon">🌍</div>
                <div className="feature-text">
                  <h4>Децентрализованность</h4>
                </div>
              </div>
            </div>
          </div>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flw-right">
            <div className="flw-stats-card">
              <div className="stat-row">
                <span className="stat-label">Общее предложение</span>
                <span className="stat-value">{tokenStats?.totalSupply ?? '—'} FLW</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">В обращении</span>
                <span className="stat-value">{tokenStats?.circulatingSupply ?? '—'} FLW</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">Цена</span>
                <span className="stat-value">{tokenStats?.price ?? '—'} ₽</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FLWToken;
