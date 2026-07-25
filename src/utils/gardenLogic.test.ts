import { calculateWaterLevel, canWaterFlower } from './gardenLogic';

describe('gardenLogic', () => {
  it('returns default moisture when never watered', () => {
    expect(calculateWaterLevel(0)).toBe(50);
  });

  it('decreases moisture over time', () => {
    const now = 1_000_000;
    const sixHoursAgo = now - 6 * 3600;
    expect(calculateWaterLevel(sixHoursAgo, now)).toBe(90);
  });

  it('allows watering when cooldown passed', () => {
    const now = 1_000_000;
    expect(canWaterFlower(now - 25 * 3600, 24 * 3600, now)).toEqual({
      canWater: true,
      hoursLeft: 0,
    });
  });

  it('blocks watering during cooldown', () => {
    const now = 1_000_000;
    expect(canWaterFlower(now - 2 * 3600, 24 * 3600, now)).toEqual({
      canWater: false,
      hoursLeft: 22,
    });
  });
});
