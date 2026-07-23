import { getErrorMessage } from './getErrorMessage';

describe('getErrorMessage', () => {
  it('returns fallback for non-Error values', () => {
    expect(getErrorMessage('oops', 'Что-то пошло не так')).toBe('Что-то пошло не так');
  });

  it('maps cancelled transaction', () => {
    expect(getErrorMessage(new Error('User declined access'), 'fallback')).toBe(
      'Транзакция отменена в кошельке'
    );
  });

  it('maps network errors', () => {
    expect(getErrorMessage(new Error('Failed to fetch'), 'fallback')).toBe(
      'Ошибка сети. Проверьте подключение к интернету'
    );
  });

  it('maps account not found', () => {
    expect(getErrorMessage(new Error('Account not found: 404'), 'fallback')).toBe(
      'Аккаунт не найден. Активируйте кошелёк через Friendbot (Stellar testnet)'
    );
  });

  it('maps unavailable contract errors', () => {
    expect(getErrorMessage(new Error('Simulation failed'), 'fallback')).toBe(
      'Контракт недоступен. Попробуйте позже'
    );
  });

  it('returns original message when no pattern matches', () => {
    expect(getErrorMessage(new Error('Custom unexpected error'), 'fallback')).toBe(
      'Custom unexpected error'
    );
  });
});
