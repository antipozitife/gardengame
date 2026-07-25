import React, { useEffect, useRef, useState } from 'react';
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

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
            ref={modalRef}
            className="modal-content glass-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-modal-title"
            aria-describedby="wallet-modal-description"
          >
            <button
              ref={closeButtonRef}
              className="modal-close"
              onClick={onClose}
              aria-label="Закрыть"
              type="button"
            >
              ×
            </button>
            <h2 id="wallet-modal-title" className="modal-title">
              Подключить кошелёк
            </h2>
            <p id="wallet-modal-description" className="modal-description">
              Используйте Albedo для безопасного взаимодействия со Stellar
            </p>

            {errorMessage && (
              <p className="modal-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button
              className="wallet-button"
              onClick={() => void handleConnect()}
              disabled={isConnecting}
              type="button"
              aria-busy={isConnecting}
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
