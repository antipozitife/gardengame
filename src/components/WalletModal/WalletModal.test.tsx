import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WalletProvider } from '../../context/WalletContext';
import WalletModal from './WalletModal';

jest.mock('../../services/stellar', () => ({
  connectAlbedo: jest.fn(),
}));

describe('WalletModal', () => {
  it('does not render when closed', () => {
    render(
      <WalletProvider>
        <WalletModal isOpen={false} onClose={jest.fn()} onConnect={jest.fn()} />
      </WalletProvider>
    );

    expect(screen.queryByRole('heading', { name: 'Подключить кошелек' })).not.toBeInTheDocument();
  });

  it('renders modal content when open', () => {
    render(
      <WalletProvider>
        <WalletModal isOpen onClose={jest.fn()} onConnect={jest.fn()} />
      </WalletProvider>
    );

    expect(screen.getByRole('heading', { name: 'Подключить кошелек' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Albedo/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn();

    render(
      <WalletProvider>
        <WalletModal isOpen onClose={onClose} onConnect={jest.fn()} />
      </WalletProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
