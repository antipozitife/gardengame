import {
  DEMO_BALANCE_STORAGE_KEY,
  DEMO_WATERING_STORAGE_KEY,
} from '../constants/storage';

export const DEMO_PUBLIC_KEY = 'DEMO-GARDEN-PORTFOLIO';
export const DEMO_INITIAL_BALANCE = 1000;

type WateringHistory = Record<string, number>;

export const getDemoBalance = (): number => {
  const storedBalance = localStorage.getItem(DEMO_BALANCE_STORAGE_KEY);
  if (storedBalance === null) return DEMO_INITIAL_BALANCE;

  const saved = Number(storedBalance);
  return Number.isFinite(saved) && saved >= 0 ? saved : DEMO_INITIAL_BALANCE;
};

export const spendDemoBalance = (amount: number): number => {
  const nextBalance = Math.max(0, getDemoBalance() - amount);
  localStorage.setItem(DEMO_BALANCE_STORAGE_KEY, String(nextBalance));
  return nextBalance;
};

const getWateringHistory = (): WateringHistory => {
  try {
    return JSON.parse(localStorage.getItem(DEMO_WATERING_STORAGE_KEY) ?? '{}') as WateringHistory;
  } catch {
    return {};
  }
};

export const getDemoLastWatering = (flowerId: number): number =>
  Number(getWateringHistory()[flowerId]) || 0;

export const waterDemoFlower = (flowerId: number, cost: number): number => {
  const history = getWateringHistory();
  history[flowerId] = Math.floor(Date.now() / 1000);
  localStorage.setItem(DEMO_WATERING_STORAGE_KEY, JSON.stringify(history));
  return spendDemoBalance(cost);
};
