import { screen } from '@testing-library/react';
import MyGarden from './MyGarden';
import { renderWithProviders } from '../../tests/testUtils';
import { WALLET_STORAGE_KEY } from '../../constants/storage';

jest.mock('../../services/stellar', () => ({
  waterSingleFlower: jest.fn(),
  getLastWatering: jest.fn().mockResolvedValue(0),
  getXLMBalance: jest.fn().mockResolvedValue(50),
  connectAlbedo: jest.fn(),
}));

jest.mock('../../services/gardenDB', () => ({
  gardenDB: {
    getAllFlowers: jest.fn().mockResolvedValue([]),
  },
}));

describe('MyGarden', () => {
  beforeEach(() => {
    localStorage.clear();
    const stellar = jest.requireMock('../../services/stellar') as {
      getXLMBalance: jest.Mock;
      getLastWatering: jest.Mock;
    };
    const { gardenDB } = jest.requireMock('../../services/gardenDB') as {
      gardenDB: { getAllFlowers: jest.Mock };
    };

    stellar.getXLMBalance.mockReset();
    stellar.getXLMBalance.mockResolvedValue(50);
    stellar.getLastWatering.mockResolvedValue(0);
    gardenDB.getAllFlowers.mockReset();
    gardenDB.getAllFlowers.mockResolvedValue([]);
  });

  it('shows message when wallet is not connected', () => {
    renderWithProviders(<MyGarden />);

    expect(screen.getByText(/Подключите кошелёк для просмотра сада/i)).toBeInTheDocument();
  });

  it('shows empty garden when wallet is connected but no flowers', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');

    renderWithProviders(<MyGarden />);

    expect(await screen.findByText(/У вас пока нет цветов/i)).toBeInTheDocument();
    expect(screen.getByText(/Мой сад \(0\)/i)).toBeInTheDocument();
  });

  it('shows owned flowers for connected wallet', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');

    const { gardenDB } = jest.requireMock('../../services/gardenDB') as {
      gardenDB: { getAllFlowers: jest.Mock };
    };

    gardenDB.getAllFlowers.mockResolvedValueOnce([
      {
        flowerId: 1,
        flowerName: 'Астра',
        publicKey: 'G_TEST_KEY',
        price: 10,
        timestamp: Date.now(),
        txHash: 'hash1',
      },
    ]);

    renderWithProviders(<MyGarden />);

    expect(await screen.findByText('Астра')).toBeInTheDocument();
    expect(screen.getByText(/Мой сад \(1\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Полить за 1 XLM/i })).toBeInTheDocument();
  });
});
