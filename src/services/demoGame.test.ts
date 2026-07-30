import {
  DEMO_INITIAL_BALANCE,
  getDemoBalance,
  getDemoLastWatering,
  resetDemoGame,
  spendDemoBalance,
  waterDemoFlower,
} from './demoGame';
import { gardenDB } from './gardenDB';

describe('demoGame', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with a virtual balance and spends it locally', () => {
    expect(getDemoBalance()).toBe(DEMO_INITIAL_BALANCE);
    expect(spendDemoBalance(25)).toBe(DEMO_INITIAL_BALANCE - 25);
    expect(getDemoBalance()).toBe(DEMO_INITIAL_BALANCE - 25);
  });

  it('stores watering state without a blockchain transaction', () => {
    expect(getDemoLastWatering(1)).toBe(0);

    waterDemoFlower(1, 0.1);

    expect(getDemoLastWatering(1)).toBeGreaterThan(0);
  });

  it('clears local progress and demo purchases before a new session', async () => {
    spendDemoBalance(100);
    waterDemoFlower(1, 0.1);
    const deleteFlowers = jest
      .spyOn(gardenDB, 'deleteFlowersByUser')
      .mockResolvedValueOnce(undefined);

    await resetDemoGame();

    expect(getDemoBalance()).toBe(DEMO_INITIAL_BALANCE);
    expect(getDemoLastWatering(1)).toBe(0);
    expect(deleteFlowers).toHaveBeenCalledWith('DEMO-GARDEN-PORTFOLIO');
  });
});
