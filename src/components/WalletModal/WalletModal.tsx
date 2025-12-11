// src/components/WalletModal/WalletModal.tsx
import React, { useState } from 'react';
import { connectAlbedo } from '../../services/stellar';
import './WalletModal.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    setError('');
    
    try {
      const publicKey = await connectAlbedo();
      onConnect(publicKey);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ошибка подключения к Albedo');
      console.error('Ошибка:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-modal-overlay" onClick={onClose}>
      <div className="wallet-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="wallet-modal-title">Подключить кошелек</h2>
        <p className="wallet-modal-description">
          Используйте Albedo для безопасного взаимодействия с Stellar
        </p>

        {error && <div className="wallet-error">{error}</div>}

        <button
          className="wallet-option"
          onClick={handleConnect}
          disabled={loading}
        >
          <span className="wallet-icon">⭐</span>
          <span className="wallet-name">
            {loading ? 'Подключение...' : 'Albedo'}
          </span>
        </button>

        <p className="wallet-info">
          Albedo — это безопасный способ использования вашего Stellar аккаунта без передачи приватных ключей
        </p>

        <button className="wallet-close" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default WalletModal;
