import { WATER_DECREASE_RATE_PER_HOUR } from '../constants/garden';

export const calculateWaterLevel = (
  lastWatered: number,
  nowSeconds = Math.floor(Date.now() / 1000)
): number => {
  if (lastWatered === 0) return 50;

  const hoursPassed = (nowSeconds - lastWatered) / 3600;
  const decrease = hoursPassed * WATER_DECREASE_RATE_PER_HOUR;

  return Math.round(Math.max(0, 100 - decrease));
};

export const canWaterFlower = (
  lastWatered: number,
  cooldownSeconds: number,
  nowSeconds = Math.floor(Date.now() / 1000)
): { canWater: boolean; hoursLeft: number } => {
  if (lastWatered === 0) return { canWater: true, hoursLeft: 0 };

  const timeSinceWatering = nowSeconds - lastWatered;
  if (timeSinceWatering >= cooldownSeconds) {
    return { canWater: true, hoursLeft: 0 };
  }

  return {
    canWater: false,
    hoursLeft: Math.ceil((cooldownSeconds - timeSinceWatering) / 3600),
  };
};
