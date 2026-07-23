import { useCallback, useEffect, useMemo, useState } from 'react';
import { waterSingleFlower, getLastWatering, getXLMBalance } from '../services/stellar';
import { gardenDB } from '../services/gardenDB';
import { getFlowerById } from '../data/flowers';
import { getErrorMessage } from '../utils/getErrorMessage';
import {
  WATERING_COST,
  WATERING_COOLDOWN_SECONDS,
  WATER_DECREASE_RATE_PER_HOUR,
} from '../constants/garden';
import { useWallet } from './useWallet';
import { useToast } from './useToast';
import type { OwnedFlower } from '../types';

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

const calculateWaterLevel = (lastWatered: number): number => {
  if (lastWatered === 0) return 50;

  const now = Math.floor(Date.now() / 1000);
  const hoursPassed = (now - lastWatered) / 3600;
  const decrease = hoursPassed * WATER_DECREASE_RATE_PER_HOUR;

  return Math.round(Math.max(0, 100 - decrease));
};

export const useGarden = (): UseGardenResult => {
  const { publicKey, isConnected } = useWallet();
  const { showToast } = useToast();
  const [flowers, setFlowers] = useState<OwnedFlower[]>([]);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState('');
  const [loadError, setLoadError] = useState('');

  const canWaterFlower = useCallback((lastWatered: number): WaterCheck => {
    if (lastWatered === 0) return { canWater: true, hoursLeft: 0 };

    const now = Math.floor(Date.now() / 1000);
    const timeSinceWatering = now - lastWatered;

    if (timeSinceWatering >= WATERING_COOLDOWN_SECONDS) {
      return { canWater: true, hoursLeft: 0 };
    }

    const hoursLeft = Math.ceil((WATERING_COOLDOWN_SECONDS - timeSinceWatering) / 3600);
    return { canWater: false, hoursLeft };
  }, []);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return;
    setBalanceError('');
    try {
      const balance = await getXLMBalance(publicKey);
      setUserBalance(typeof balance === 'number' ? balance : 0);
    } catch (error) {
      setUserBalance(null);
      setBalanceError(getErrorMessage(error, 'Не удалось загрузить баланс'));
    }
  }, [publicKey]);

  const loadGardenData = useCallback(async () => {
    if (!publicKey) return;

    try {
      setLoading(true);
      setLoadError('');
      const purchases = await gardenDB.getAllFlowers();
      const userPurchases = purchases.filter((purchase) => purchase.publicKey === publicKey);
      const flowerMap = new Map<number, OwnedFlower>();

      for (const purchase of userPurchases) {
        const existing = flowerMap.get(purchase.flowerId);

        if (existing) {
          existing.quantity += 1;
          continue;
        }

        const data = getFlowerById(purchase.flowerId);
        let lastWatered = 0;

        try {
          lastWatered = Number(await getLastWatering(publicKey, purchase.flowerId));
        } catch {
          lastWatered = 0;
        }

        flowerMap.set(purchase.flowerId, {
          id: purchase.flowerId,
          name: data?.name ?? purchase.flowerName,
          quantity: 1,
          waterLevel: calculateWaterLevel(lastWatered),
          lastWatered,
          image: data?.image ?? '',
          rarity: data?.rarity ?? '',
          rarityColor: data?.rarityColor ?? '',
          incomeValue: data?.incomeValue ?? 0,
        });
      }

      setFlowers(Array.from(flowerMap.values()));
    } catch (error) {
      setFlowers([]);
      setLoadError(getErrorMessage(error, 'Не удалось загрузить сад'));
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

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
        await waterSingleFlower(publicKey, flowerId, WATERING_COST);
        showToast('Цветок полит', 'success');
        await reload();
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Не удалось полить цветок'), 'error');
      } finally {
        setLoading(false);
      }
    },
    [publicKey, canWaterFlower, userBalance, showToast, reload]
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
