import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFlowers } from './useFlowers';
import { WalletProvider } from '../context/WalletContext';
import { ThemeProvider } from '../context/ThemeContext';
import { buyFlower, getXLMBalance } from '../services/stellar';
import { WALLET_STORAGE_KEY } from '../constants/storage';

jest.mock('../services/stellar', () => ({
  buyFlower: jest.fn(),
  getXLMBalance: jest.fn().mockResolvedValue(100),
  connectAlbedo: jest.fn(),
}));

jest.mock('../services/gardenDB', () => ({
  gardenDB: {
    init: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockedBuyFlower = buyFlower as jest.MockedFunction<typeof buyFlower>;
const mockedGetXLMBalance = getXLMBalance as jest.MockedFunction<typeof getXLMBalance>;

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <WalletProvider>{children}</WalletProvider>
  </ThemeProvider>
);

describe('useFlowers', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedBuyFlower.mockReset();
    mockedGetXLMBalance.mockReset();
    mockedGetXLMBalance.mockResolvedValue(100);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: jest.fn() },
    });
  });

  it('loads balance for connected wallet', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');

    const { result } = renderHook(() => useFlowers(), { wrapper });

    await waitFor(() => {
      expect(result.current.userBalance).toBe(100);
    });
    expect(result.current.isConnected).toBe(true);
    expect(result.current.flowers).toHaveLength(5);
  });

  it('calls buyFlower when purchasing', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');
    mockedBuyFlower.mockResolvedValue('txhash123');

    const { result } = renderHook(() => useFlowers(), { wrapper });

    await waitFor(() => {
      expect(result.current.userBalance).toBe(100);
    });

    await act(async () => {
      await result.current.buy(result.current.flowers[0]);
    });

    expect(mockedBuyFlower).toHaveBeenCalledWith('G_TEST_KEY', 1, 10, 'Астра');
    expect(result.current.purchaseStep === 'done' || result.current.purchaseStep === 'idle').toBe(
      true
    );
  });
});
