import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { connectAlbedo } from '../services/stellar';
import { WalletProvider, useWallet } from './WalletContext';

jest.mock('../services/stellar', () => ({
  connectAlbedo: jest.fn(),
}));

const mockedConnectAlbedo = connectAlbedo as jest.MockedFunction<typeof connectAlbedo>;

const TestConsumer = () => {
  const { publicKey, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      <span data-testid="public-key">{publicKey ?? 'none'}</span>
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
    localStorage.setItem('walletPublicKey', 'G_TEST_KEY');

    render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('public-key')).toHaveTextContent('G_TEST_KEY');
    });
  });

  it('connects wallet and saves public key', async () => {
    mockedConnectAlbedo.mockResolvedValue('G_NEW_KEY');

    render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => {
      expect(screen.getByTestId('public-key')).toHaveTextContent('G_NEW_KEY');
    });
    expect(localStorage.getItem('walletPublicKey')).toBe('G_NEW_KEY');
  });

  it('disconnects wallet and clears localStorage', async () => {
    localStorage.setItem('walletPublicKey', 'G_TEST_KEY');

    render(
      <WalletProvider>
        <TestConsumer />
      </WalletProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('public-key')).toHaveTextContent('G_TEST_KEY');
    });

    await userEvent.click(screen.getByRole('button', { name: 'Disconnect' }));

    expect(screen.getByTestId('public-key')).toHaveTextContent('none');
    expect(localStorage.getItem('walletPublicKey')).toBeNull();
  });
});
