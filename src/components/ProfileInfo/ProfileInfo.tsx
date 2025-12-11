// src/components/ProfileInfo/ProfileInfo.tsx
import React, { useState, useEffect } from 'react';
import './ProfileInfo.css';
import { getFLWBalance } from '../../services/stellar';

interface Balance {
  asset_type: string;
  asset_code?: string;
  balance: string;
}

interface AccountData {
  id: string;
  balances: Balance[];
  sequence: string;
  subentry_count: number;
}

const ProfileInfo: React.FC = () => {
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [flwBalance, setFlwBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('walletPublicKey');
    if (storedKey) {
      setPublicKey(storedKey);
      fetchAccountData(storedKey);
      fetchFLWBalance(storedKey);
    } else {
      setLoading(false);
      setError('Кошелек не подключен');
    }
  }, []);

  const fetchAccountData = async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${key}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные аккаунта');
      }
      const data = await response.json();
      setAccountData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const fetchFLWBalance = async (key: string) => {
    try {
      const balance = await getFLWBalance(key);
      setFlwBalance(balance);
    } catch (error) {
      console.error('Ошибка получения FLW баланса:', error);
    }
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(2);
  };

  const shortAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleDisconnect = () => {
    localStorage.removeItem('walletPublicKey');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="profile-info loading">
        <p>Загрузка данных аккаунта...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-info error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => (window.location.href = '/')}>Подключить кошелек</button>
      </div>
    );
  }

  return (
    <div className="profile-info">
      <div className="profile-header">
        <div>
          <h2>Мой профиль</h2>
          <p className="address">{shortAddress(publicKey)}</p>
        </div>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Отключить
        </button>
      </div>

      <div className="balance-section">
        <h3>💰 Балансы</h3>
        <div className="balance-grid">
          <div className="balance-card highlight">
            <span className="balance-label">FLW (Контракт)</span>
            <span className="balance-value">{flwBalance.toFixed(2)}</span>
          </div>
          {accountData?.balances.map((balance, index) => (
            <div key={index} className="balance-card">
              <span className="balance-label">
                {balance.asset_type === 'native' ? 'XLM' : balance.asset_code}
              </span>
              <span className="balance-value">{formatBalance(balance.balance)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="stats-section">
        <h3>📊 Статистика</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Sequence</span>
            <span className="stat-value">{accountData?.sequence}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Subentries</span>
            <span className="stat-value">{accountData?.subentry_count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Всего активов</span>
            <span className="stat-value">{accountData?.balances.length}</span>
          </div>
        </div>
      </div>

      <div className="address-section">
        <p>Публичный ключ:</p>
        <div className="address-box">
          <code>{publicKey}</code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(publicKey);
              alert('Адрес скопирован!');
            }}
          >
            📋 Копировать
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
