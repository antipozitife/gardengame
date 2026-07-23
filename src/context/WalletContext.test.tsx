import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { connectAlbedo } from '../services/stellar';
import { useWallet } from './WalletContext';
import { renderWithProviders } from '../tests/testUtils';
import { WALLET_STORAGE_KEY } from '../constants/storage';

jest.mock('../services/stellar', () => ({
  connectAlbedo: jest.fn(),
}));

const mockedConnectAlbedo = connectAlbedo as jest.MockedFunction<typeof connectAlbedo>;

const TestConsumer = () => {
  const { publicKey, isConnected, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      <span data-testid="public-key">{publicKey ?? 'none'}</span>
      <span data-testid="is-connected">{isConnected ? 'yes' : 'no'}</span>
      <button type="button" onClick={() => void connectWallet()}>
        Connect
      </button>
      <button type="button" onClick={disconnectWallet}>
        Disconnect
      </button>
    </div>
  );
};

describe('WalletContext', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedConnectAlbedo.mockReset();
  });

  it('restores public key from localStorage on mount', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');

    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('public-key')).toHaveTextContent('G_TEST_KEY');
    });
    expect(screen.getByTestId('is-connected')).toHaveTextContent('yes');
  });

  it('connects wallet and saves public key', async () => {
    mockedConnectAlbedo.mockResolvedValue('G_NEW_KEY');

    renderWithProviders(<TestConsumer />);

    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => {
      expect(screen.getByTestId('public-key')).toHaveTextContent('G_NEW_KEY');
    });
    expect(localStorage.getItem(WALLET_STORAGE_KEY)).toBe('G_NEW_KEY');
  });

  it('disconnects wallet and clears localStorage', async () => {
    localStorage.setItem(WALLET_STORAGE_KEY, 'G_TEST_KEY');

    renderWithProviders(<TestConsumer />);

    await waitFor(() => {
      expect(screen.getByTestId('public-key')).toHaveTextContent('G_TEST_KEY');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Disconnect' }));

    expect(screen.getByTestId('public-key')).toHaveTextContent('none');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('no');
    expect(localStorage.getItem(WALLET_STORAGE_KEY)).toBeNull();
  });
});
