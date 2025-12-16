import React from 'react';
import { createPortal } from 'react-dom';
import './WalletModal.css';
import { connectAlbedo } from '../../services/stellar';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      const publicKey = await connectAlbedo();
      onConnect(publicKey);
    } catch (error) {
      console.error('Ошибка подключения:', error);
      alert('Не удалось подключить кошелек');
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="modal-title">Подключить кошелек</h2>
        <p className="modal-description">
          Используйте Albedo для безопасного взаимодействия с Stellar
        </p>
        <button className="wallet-button" onClick={handleConnect}>
          🔗 Albedo
        </button>
      </div>
    </div>
  );

  // Рендерим модальное окно в корень document.body
  return createPortal(modalContent, document.body);
};

export default WalletModal;
