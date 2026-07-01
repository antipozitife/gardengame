import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletProvider } from '../../context/WalletContext';
import FlowerShop from './FlowerShop';

jest.mock('../../services/stellar', () => ({
  buyFlower: jest.fn(),
  getXLMBalance: jest.fn().mockResolvedValue(100),
}));

jest.mock('../../services/gardenDB', () => ({
  gardenDB: {
    init: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('FlowerShop', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows connect wallet prompt when wallet is not connected', () => {
    render(
      <WalletProvider>
        <FlowerShop />
      </WalletProvider>
    );

    expect(screen.getByText(/Подключите кошелек для покупки цветов/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Подключить кошелек/i })).toBeInTheDocument();
  });

  it('disables buy buttons when wallet is not connected', () => {
    render(
      <WalletProvider>
        <FlowerShop />
      </WalletProvider>
    );

    const buyButtons = screen.getAllByRole('button', { name: 'Купить' });
    buyButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('opens wallet modal on connect click', async () => {
    render(
      <WalletProvider>
        <FlowerShop />
      </WalletProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: /Подключить кошелек/i }));

    expect(screen.getByRole('heading', { name: 'Подключить кошелек' })).toBeInTheDocument();
  });
});
