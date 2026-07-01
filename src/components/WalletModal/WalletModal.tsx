import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useWallet } from '../../context/WalletContext';
import { getErrorMessage } from '../../utils/getErrorMessage';
import './WalletModal.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const { connectWallet } = useWallet();
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnect = async () => {
    setErrorMessage('');
    setIsConnecting(true);

    try {
      const publicKey = await connectWallet();
      onConnect(publicKey);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Не удалось подключить кошелек'));
    } finally {
      setIsConnecting(false);
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <h2 className="modal-title">Подключить кошелек</h2>
        <p className="modal-description">
          Используйте Albedo для безопасного взаимодействия с Stellar
        </p>

        {errorMessage && <p className="modal-error">{errorMessage}</p>}

        <button className="wallet-button" onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? '⏳ Подключение...' : '🔗 Albedo'}
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WalletModal;
