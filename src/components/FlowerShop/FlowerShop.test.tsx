import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buyFlower, getXLMBalance } from '../../services/stellar';
import FlowerShop from './FlowerShop';
import { renderWithProviders } from '../../tests/testUtils';
import { WALLET_STORAGE_KEY } from '../../constants/storage';

jest.mock('../../services/stellar', () => ({
  buyFlower: jest.fn(),
  getXLMBalance: jest.fn().mockResolvedValue(100),
  connectAlbedo: jest.fn(),
}));

jest.mock('../../services/gardenDB', () => ({
  gardenDB: {
    init: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockedBuyFlower = buyFlower as jest.MockedFunction<typeof buyFlower>;
const mockedGetXLMBalance = getXLMBalance as jest.MockedFunction<typeof getXLMBalance>;

describe('FlowerShop', () => {
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

  it('shows connect wallet prompt when wallet is not connected', () => {
    renderWithProviders(<FlowerShop />);

    expect(screen.getByText(/Подключите кошелёк для покупки цветов/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Подключить кошелёк/i })).toBeInTheDocument();
  });

  it('disables buy buttons when wallet is not connected', () => {
    renderWithProviders(<FlowerShop />);

    const buyButtons = screen.getAllByRole('button', { name: 'Купить' });
    buyButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('opens wallet modal on connect click', async () => {
    renderWithProviders(<FlowerShop />);

    await userEvent.click(screen.getByRole('button', { name: /Подключить кошелёк/i }));

    expect(screen.getByRole('heading', { name: /Подключить кошелёк/i })).toBeInTheDocument();
  });

  it('buys a flower when wallet is connected', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');
    mockedBuyFlower.mockResolvedValue('abcdef1234567890');

    renderWithProviders(<FlowerShop />);

    expect(await screen.findByText(/Ваш баланс/i)).toBeInTheDocument();

    const buyButtons = screen.getAllByRole('button', { name: 'Купить' });
    await userEvent.click(buyButtons[0]);

    await waitFor(() => {
      expect(mockedBuyFlower).toHaveBeenCalledWith('G_TEST_KEY', 1, 10, 'Астра');
    });
  });
});
