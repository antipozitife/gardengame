import { useCallback, useEffect, useMemo, useState } from 'react';
import { waterSingleFlower, getLastWatering, getXLMBalance } from '../services/stellar';
import { gardenDB } from '../services/gardenDB';
import { getFlowerById } from '../data/flowers';
import { getErrorMessage } from '../utils/getErrorMessage';
import { WATERING_COST, WATERING_COOLDOWN_SECONDS } from '../constants/garden';
import { GARDEN_UPDATED_EVENT } from '../constants/events';
import { calculateWaterLevel, canWaterFlower as getWaterAvailability } from '../utils/gardenLogic';
import { useWallet } from './useWallet';
import { useToast } from './useToast';
import type { OwnedFlower } from '../types';
import {
  getDemoBalance,
  getDemoLastWatering,
  waterDemoFlower,
} from '../services/demoGame';

interface WaterCheck {
  canWater: boolean;
  hoursLeft: number;
}

interface UseGardenResult {
  flowers: OwnedFlower[];
  loading: boolean;
  userBalance: number | null;
  balanceError: string;
  loadError: string;
  totalFlowers: number;
  isConnected: boolean;
  wateringCost: number;
  canWaterFlower: (lastWatered: number) => WaterCheck;
  waterFlower: (flowerId: number, lastWatered: number) => Promise<void>;
  reload: () => Promise<void>;
}

export const useGarden = (): UseGardenResult => {
  const { publicKey, isConnected, isDemo } = useWallet();
  const { showToast } = useToast();
  const [flowers, setFlowers] = useState<OwnedFlower[]>([]);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [loadError, setLoadError] = useState('');

  const canWaterFlower = useCallback(
    (lastWatered: number): WaterCheck =>
      getWaterAvailability(lastWatered, WATERING_COOLDOWN_SECONDS),
    []
  );

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
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

  const loadGardenData = useCallback(async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setLoadError('');
      const purchases = await gardenDB.getFlowersByUser(publicKey);
      const purchasesByFlower = new Map<number, typeof purchases>();

      purchases.forEach((purchase) => {
        const group = purchasesByFlower.get(purchase.flowerId) ?? [];
        group.push(purchase);
        purchasesByFlower.set(purchase.flowerId, group);
      });

      const ownedFlowers = await Promise.all(
        Array.from(purchasesByFlower.entries()).map(async ([flowerId, flowerPurchases]) => {
          const [purchase] = flowerPurchases;
          const data = getFlowerById(flowerId);
          const lastWatered = isDemo
            ? getDemoLastWatering(flowerId)
            : Number(await getLastWatering(publicKey, flowerId)) || 0;

          return {
            id: flowerId,
            name: data?.name ?? purchase.flowerName,
            quantity: flowerPurchases.length,
            waterLevel: calculateWaterLevel(lastWatered),
            lastWatered,
            image: data?.image ?? '',
            rarity: data?.rarity ?? '',
            rarityColor: data?.rarityColor ?? '',
            incomeValue: data?.incomeValue ?? 0,
          };
        })
      );

      setFlowers(ownedFlowers);
    } catch (error) {
      setFlowers([]);
      setLoadError(getErrorMessage(error, 'Не удалось загрузить сад'));
    } finally {
      setLoading(false);
    }
  }, [publicKey, isDemo]);

  const reload = useCallback(async () => {
    await Promise.all([loadGardenData(), fetchBalance()]);
  }, [loadGardenData, fetchBalance]);

  useEffect(() => {
    if (!publicKey) {
      setFlowers([]);
      setUserBalance(null);
      setBalanceError('');
      setLoadError('');
      return;
    }

    void loadGardenData();
    void fetchBalance();
  }, [publicKey, loadGardenData, fetchBalance]);

  useEffect(() => {
    const handleGardenUpdate = () => {
      void reload();
    };

    window.addEventListener(GARDEN_UPDATED_EVENT, handleGardenUpdate);
    return () => window.removeEventListener(GARDEN_UPDATED_EVENT, handleGardenUpdate);
  }, [reload]);

  const waterFlower = useCallback(
    async (flowerId: number, lastWatered: number) => {
      if (!publicKey) {
        showToast('Кошелёк не подключён', 'error');
        return;
      }

      const waterCheck = canWaterFlower(lastWatered);
      if (!waterCheck.canWater) {
        showToast(`Этот цветок можно полить через ${waterCheck.hoursLeft} ч.`, 'info');
        return;
      }

      if (userBalance !== null && userBalance < WATERING_COST) {
        showToast('Недостаточно XLM', 'error');
        return;
      }

      setLoading(true);
      showToast('Поливаем цветок...', 'info');

      try {
        if (isDemo) {
          waterDemoFlower(flowerId, WATERING_COST);
        } else {
          await waterSingleFlower(publicKey, flowerId, WATERING_COST);
        }
        showToast('Цветок полит', 'success');
        await reload();
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Не удалось полить цветок'), 'error');
      } finally {
        setLoading(false);
      }
    },
    [publicKey, canWaterFlower, userBalance, showToast, reload, isDemo]
  );

  const totalFlowers = useMemo(
    () => flowers.reduce((sum, flower) => sum + flower.quantity, 0),
    [flowers]
  );

  return {
    flowers,
    loading,
    userBalance,
    balanceError,
    loadError,
    totalFlowers,
    isConnected,
    wateringCost: WATERING_COST,
    canWaterFlower,
    waterFlower,
    reload,
  };
};
