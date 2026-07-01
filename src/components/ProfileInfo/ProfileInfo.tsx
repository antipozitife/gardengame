import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../context/WalletContext';
import { getXLMBalance } from '../../services/stellar';
import { getErrorMessage } from '../../utils/getErrorMessage';
import './ProfileInfo.css';

const ProfileInfo: React.FC = () => {
  const { publicKey, disconnectWallet } = useWallet();
  const navigate = useNavigate();
  const [xlmBalance, setXlmBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  useEffect(() => {
    if (publicKey) {
      void loadProfile(publicKey);
    } else {
      setLoading(false);
      setError('Кошелек не подключен. Подключите Albedo, чтобы играть.');
    }
  }, [publicKey]);

  const loadProfile = async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${key}`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить данные аккаунта');
      }
      const balance = await getXLMBalance(key);
      setXlmBalance(balance);
    } catch (err) {
      setError(getErrorMessage(err, 'Не удалось загрузить профиль'));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    navigate('/');
  };

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopyMessage('Адрес скопирован!');
      setTimeout(() => setCopyMessage(''), 2000);
    } catch {
      setCopyMessage('Не удалось скопировать адрес');
      setTimeout(() => setCopyMessage(''), 2000);
    }
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
        <button onClick={() => navigate('/')}>На главную</button>
      </div>
    );
  }

  return (
    <div className="profile-info">
      <div className="profile-header">
        <div>
          <h2>Мой профиль</h2>
        </div>
        <button onClick={handleDisconnect} className="disconnect-btn">
          Отключить
        </button>
      </div>

      <div className="address-section">
        <p>Публичный ключ:</p>
        <div className="address-box">
          <code>{publicKey}</code>
          <button onClick={handleCopy}>📋 Копировать</button>
        </div>
        {copyMessage && <p className="copy-message">{copyMessage}</p>}
      </div>

      <div className="address-section">
        <p>Баланс:</p>
        <strong>{xlmBalance.toFixed(2)} XLM</strong>
      </div>
    </div>
  );
};

export default ProfileInfo;
