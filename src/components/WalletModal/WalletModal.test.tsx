import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { connectAlbedo } from '../../services/stellar';
import WalletModal from './WalletModal';
import { renderWithProviders } from '../../tests/testUtils';

jest.mock('../../services/stellar', () => ({
  connectAlbedo: jest.fn(),
}));

const mockedConnectAlbedo = connectAlbedo as jest.MockedFunction<typeof connectAlbedo>;

describe('WalletModal', () => {
  beforeEach(() => {
    localStorage.clear();
    mockedConnectAlbedo.mockReset();
  });

  it('does not render when closed', () => {
    renderWithProviders(<WalletModal isOpen={false} onClose={jest.fn()} onConnect={jest.fn()} />);

    expect(screen.queryByRole('heading', { name: /Подключить кошелёк/i })).not.toBeInTheDocument();
  });

  it('renders modal content when open', () => {
    renderWithProviders(<WalletModal isOpen onClose={jest.fn()} onConnect={jest.fn()} />);

    expect(screen.getByRole('heading', { name: /Подключить кошелёк/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Albedo/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();

    renderWithProviders(<WalletModal isOpen onClose={onClose} onConnect={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('connects wallet through Albedo mock and notifies parent', async () => {
    mockedConnectAlbedo.mockResolvedValue('G_CONNECTED_KEY');
    const onConnect = jest.fn();

    renderWithProviders(<WalletModal isOpen onClose={jest.fn()} onConnect={onConnect} />);

    await userEvent.click(screen.getByRole('button', { name: /Albedo/i }));

    await waitFor(() => {
      expect(onConnect).toHaveBeenCalledWith('G_CONNECTED_KEY');
    });
  });

  it('shows error when wallet connection fails', async () => {
    mockedConnectAlbedo.mockRejectedValue(new Error('User declined access'));

    renderWithProviders(<WalletModal isOpen onClose={jest.fn()} onConnect={jest.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: /Albedo/i }));

    expect(await screen.findByText(/Транзакция отменена в кошельке/i)).toBeInTheDocument();
  });
});
