import React from 'react';
import './XLMToken.css';
import { getTokenStats, TokenStats } from '../../services/priceService';

const XLMToken: React.FC = () => {
  const [tokenStats, setTokenStats] = React.useState<TokenStats | null>(null);

  React.useEffect(() => {
    getTokenStats().then(setTokenStats);
  }, []);

  return (
    <section className="xlm-token" id="xlm-token-section">
      <div className="xlm-container">
        <div className="xlm-content">
          <div className="xlm-left">
            <h2 className="xlm-title">
              <span className="xlm-icon">💰</span>
              XLM
            </h2>

            <div className="xlm-description">
              <h3 className="xlm-subtitle">Что такое XLM?</h3>
              <p className="xlm-text">
                XLM (Stellar Lumens) — нативная криптовалюта сети Stellar. В игре она используется
                для покупки цветов, полива и других действий в testnet.
              </p>
            </div>

            <div className="xlm-features">
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
                  <h4>Безопасность</h4>
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

          <div className="xlm-right">
            <div className="xlm-stats-card">
              <div className="stat-row">
                <span className="stat-label">Общее предложение</span>
                <span className="stat-value">{tokenStats?.totalSupply ?? '—'} XLM</span>
              </div>

              <div className="stat-row">
                <span className="stat-label">В обращении</span>
                <span className="stat-value">{tokenStats?.circulatingSupply ?? '—'} XLM</span>
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

export default XLMToken;
