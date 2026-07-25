import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useGarden } from './useGarden';
import { WalletProvider } from '../context/WalletContext';
import { ThemeProvider } from '../context/ThemeContext';
import { WALLET_STORAGE_KEY } from '../constants/storage';

jest.mock('../services/stellar', () => ({
  waterSingleFlower: jest.fn(),
  getLastWatering: jest.fn().mockResolvedValue(0),
  getXLMBalance: jest.fn().mockResolvedValue(42),
  connectAlbedo: jest.fn(),
}));

jest.mock('../services/gardenDB', () => ({
  gardenDB: {
    getFlowersByUser: jest.fn().mockResolvedValue([
      {
        flowerId: 2,
        flowerName: 'Ромашка',
        publicKey: 'G_TEST_KEY',
        price: 25,
        timestamp: Date.now(),
        txHash: 'hash',
      },
    ]),
  },
}));

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <WalletProvider>{children}</WalletProvider>
  </ThemeProvider>
);

describe('useGarden', () => {
  beforeEach(() => {
    localStorage.clear();
    const stellar = jest.requireMock('../services/stellar') as {
      getLastWatering: jest.Mock;
      getXLMBalance: jest.Mock;
    };
    const { gardenDB } = jest.requireMock('../services/gardenDB') as {
      gardenDB: { getFlowersByUser: jest.Mock };
    };

    stellar.getLastWatering.mockResolvedValue(0);
    stellar.getXLMBalance.mockResolvedValue(42);
    gardenDB.getFlowersByUser.mockResolvedValue([
      {
        flowerId: 2,
        flowerName: 'Ромашка',
        publicKey: 'G_TEST_KEY',
        price: 25,
        timestamp: Date.now(),
        txHash: 'hash',
      },
    ]);
  });

  it('loads owned flowers and balance for connected wallet', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');

    const { result } = renderHook(() => useGarden(), { wrapper });

    await waitFor(() => {
      if (result.current.loadError) {
        throw new Error(result.current.loadError);
      }
      expect(result.current.flowers).toHaveLength(1);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.flowers[0].name).toBe('Ромашка');
    expect(result.current.userBalance).toBe(42);
    expect(result.current.totalFlowers).toBe(1);
  });

  it('reports disconnected state without wallet', () => {
    const { result } = renderHook(() => useGarden(), { wrapper });
    expect(result.current.isConnected).toBe(false);
    expect(result.current.flowers).toEqual([]);
  });
});
