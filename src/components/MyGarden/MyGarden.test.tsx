import { render, screen } from '@testing-library/react';
import { WalletProvider } from '../../context/WalletContext';
import MyGarden from './MyGarden';

jest.mock('../../services/stellar', () => ({
  waterSingleFlower: jest.fn(),
  getLastWatering: jest.fn(),
  getXLMBalance: jest.fn().mockResolvedValue(50),
}));

jest.mock('../../services/gardenDB', () => ({
  gardenDB: {
    getAllFlowers: jest.fn().mockResolvedValue([]),
  },
}));

describe('MyGarden', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows message when wallet is not connected', () => {
    render(
      <WalletProvider>
        <MyGarden />
      </WalletProvider>
    );

    expect(screen.getByText(/Подключите кошелек для просмотра сада/i)).toBeInTheDocument();
  });

  it('shows empty garden when wallet is connected but no flowers', async () => {
    localStorage.setItem('walletPublicKey', 'G_TEST_KEY');

    render(
      <WalletProvider>
        <MyGarden />
      </WalletProvider>
    );

    expect(await screen.findByText(/У вас пока нет цветов/i)).toBeInTheDocument();
    expect(screen.getByText(/Мой сад \(0\)/i)).toBeInTheDocument();
  });
});
