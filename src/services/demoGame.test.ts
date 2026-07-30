import {
  DEMO_INITIAL_BALANCE,
  getDemoBalance,
  getDemoLastWatering,
  spendDemoBalance,
  waterDemoFlower,
} from './demoGame';

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
});
