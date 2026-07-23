import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../utils/getErrorMessage';
import Spinner from '../ui/Spinner/Spinner';
import './WalletModal.css';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (publicKey: string) => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect }) => {
  const { connectWallet } = useWallet();
  const { showToast } = useToast();
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setErrorMessage('');
    setIsConnecting(true);

    try {
      const publicKey = await connectWallet();
      showToast('Кошелёк подключён', 'success');
      onConnect(publicKey);
    } catch (error) {
      const message = getErrorMessage(error, 'Не удалось подключить кошелёк');
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-modal-title"
          >
            <button className="modal-close" onClick={onClose} aria-label="Закрыть">
              ×
            </button>
            <h2 id="wallet-modal-title" className="modal-title">
              Подключить кошелёк
            </h2>
            <p className="modal-description">
              Используйте Albedo для безопасного взаимодействия со Stellar
            </p>

            {errorMessage && <p className="modal-error">{errorMessage}</p>}

            <button
              className="wallet-button"
              onClick={() => void handleConnect()}
              disabled={isConnecting}
            >
              {isConnecting ? <Spinner size="sm" label="Подключение..." /> : 'Albedo'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default WalletModal;
