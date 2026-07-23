import { useCallback, useEffect, useState } from 'react';
import { FLOWERS } from '../data/flowers';
import { buyFlower, getXLMBalance } from '../services/stellar';
import { gardenDB } from '../services/gardenDB';
import { getErrorMessage } from '../utils/getErrorMessage';
import { PURCHASE_STEP_LABELS, PurchaseStep } from '../constants/purchase';
import { useWallet } from './useWallet';
import { useToast } from './useToast';
import type { Flower } from '../types';

interface UseFlowersResult {
  flowers: Flower[];
  userBalance: number | null;
  balanceError: string;
  isLoading: boolean;
  purchaseStep: PurchaseStep;
  purchaseLabel: string;
  isConnected: boolean;
  buy: (flower: Flower) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export const useFlowers = (): UseFlowersResult => {
  const { publicKey, isConnected } = useWallet();
  const { showToast } = useToast();
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setUserBalance(null);
      setBalanceError('');
      return;
    }

    setBalanceError('');
    try {
      const balance = await getXLMBalance(publicKey);
      setUserBalance(typeof balance === 'number' ? balance : 0);
    } catch (error) {
      setUserBalance(null);
      setBalanceError(getErrorMessage(error, 'Не удалось загрузить баланс'));
    }
  }, [publicKey]);

  useEffect(() => {
    void gardenDB.init();
  }, []);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  const buy = useCallback(
    async (flower: Flower) => {
      if (!publicKey) {
        showToast('Кошелёк не подключён', 'error');
        return;
      }

      if (userBalance !== null && userBalance < flower.price) {
        showToast('Недостаточно XLM', 'error');
        return;
      }

      setIsLoading(true);
      setPurchaseStep('buying');
      showToast(PURCHASE_STEP_LABELS.buying, 'info');

      try {
        setPurchaseStep('confirming');
        showToast(PURCHASE_STEP_LABELS.confirming, 'info');

        setPurchaseStep('waiting');
        showToast(PURCHASE_STEP_LABELS.waiting, 'info');

        const txHash = await buyFlower(publicKey, flower.id, flower.price, flower.name);

        setPurchaseStep('done');
        showToast(`Готово! ${flower.name} куплен. TX: ${txHash.substring(0, 8)}...`, 'success');
        await refreshBalance();
        window.setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error: unknown) {
        setPurchaseStep('idle');
        showToast(getErrorMessage(error, 'Не удалось купить цветок'), 'error');
      } finally {
        setIsLoading(false);
        window.setTimeout(() => setPurchaseStep('idle'), 2000);
      }
    },
    [publicKey, userBalance, showToast, refreshBalance]
  );

  const purchaseLabel = purchaseStep === 'idle' ? '' : PURCHASE_STEP_LABELS[purchaseStep];

  return {
    flowers: FLOWERS,
    userBalance,
    balanceError,
    isLoading,
    purchaseStep,
    purchaseLabel,
    isConnected,
    buy,
    refreshBalance,
  };
};
