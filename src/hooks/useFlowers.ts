import { useCallback, useEffect, useRef, useState } from 'react';
import { FLOWERS } from '../data/flowers';
import { buyFlower, getXLMBalance } from '../services/stellar';
import { gardenDB } from '../services/gardenDB';
import { getErrorMessage } from '../utils/getErrorMessage';
import { PURCHASE_STEP_LABELS, PurchaseStep } from '../constants/purchase';
import { GARDEN_UPDATED_EVENT } from '../constants/events';
import { useWallet } from './useWallet';
import { useToast } from './useToast';
import type { Flower } from '../types';
import { getDemoBalance, spendDemoBalance } from '../services/demoGame';

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
  const { publicKey, isConnected, isDemo } = useWallet();
  const { showToast } = useToast();
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>('idle');
  const resetStepTimer = useRef<number>();

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setUserBalance(null);
      setBalanceError('');
      return;
    }

    setBalanceError('');
    if (isDemo) {
      setUserBalance(getDemoBalance());
      return;
    }

    try {
      const balance = await getXLMBalance(publicKey);
      setUserBalance(typeof balance === 'number' ? balance : 0);
    } catch (error) {
      setUserBalance(null);
      setBalanceError(getErrorMessage(error, 'Не удалось загрузить баланс'));
    }
  }, [publicKey, isDemo]);

  useEffect(() => {
    void gardenDB.init();
  }, []);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);

  useEffect(
    () => () => {
      if (resetStepTimer.current) {
        window.clearTimeout(resetStepTimer.current);
      }
    },
    []
  );

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

        const txHash = isDemo
          ? `demo-${Date.now()}`
          : await buyFlower(publicKey, flower.id, flower.price, flower.name);

        if (isDemo) {
          await gardenDB.addFlower(flower.id, flower.name, publicKey, flower.price, txHash);
          spendDemoBalance(flower.price);
        }

        setPurchaseStep('done');
        showToast(
          isDemo
            ? `Готово! ${flower.name} добавлен в демо-сад`
            : `Готово! ${flower.name} куплен. TX: ${txHash.substring(0, 8)}...`,
          'success'
        );
        await refreshBalance();
        window.dispatchEvent(new Event(GARDEN_UPDATED_EVENT));
      } catch (error: unknown) {
        setPurchaseStep('idle');
        showToast(getErrorMessage(error, 'Не удалось купить цветок'), 'error');
      } finally {
        setIsLoading(false);
        resetStepTimer.current = window.setTimeout(() => setPurchaseStep('idle'), 2000);
      }
    },
    [publicKey, userBalance, showToast, refreshBalance, isDemo]
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
