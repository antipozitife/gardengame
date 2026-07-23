import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import { getXLMBalance } from '../../services/stellar';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { HORIZON_URL } from '../../constants/stellar';
import Skeleton from '../ui/Skeleton/Skeleton';
import ErrorState from '../ui/ErrorState/ErrorState';
import './ProfileInfo.css';

const ProfileInfo: React.FC = () => {
  const { publicKey, disconnectWallet } = useWallet();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [xlmBalance, setXlmBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const response = await fetch(`${HORIZON_URL}/accounts/${key}`);
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
    showToast('Кошелёк отключён', 'info');
    navigate('/');
  };

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      showToast('Адрес скопирован', 'success');
    } catch {
      showToast('Не удалось скопировать адрес', 'error');
    }
  };

  if (loading) {
    return (
      <div className="profile-info loading" aria-busy="true" aria-label="Загрузка профиля">
        <Skeleton width="60%" height={28} />
        <div style={{ height: 16 }} />
        <Skeleton width="100%" height={64} borderRadius={12} />
        <div style={{ height: 16 }} />
        <Skeleton width="40%" height={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-info">
        <ErrorState
          title="Профиль недоступен"
          message={error}
          actionLabel="На главную"
          onAction={() => navigate('/')}
        />
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
          <button onClick={() => void handleCopy()}>📋 Копировать</button>
        </div>
      </div>

      <div className="address-section">
        <p>Баланс:</p>
        <strong>{xlmBalance.toFixed(2)} XLM</strong>
      </div>
    </div>
  );
};

export default ProfileInfo;
