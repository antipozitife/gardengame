export function getErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.toLowerCase();

  if (
    message.includes('user declined') ||
    message.includes('user cancelled') ||
    message.includes('canceled') ||
    message.includes('cancelled') ||
    message.includes('rejected') ||
    message.includes('отмен')
  ) {
    return 'Транзакция отменена в кошельке';
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror')
  ) {
    return 'Ошибка сети. Проверьте подключение к интернету';
  }

  if (
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('account not found')
  ) {
    return 'Аккаунт не найден. Активируйте кошелёк через Friendbot (Stellar testnet)';
  }

  if (
    message.includes('op_underfunded') ||
    message.includes('insufficient') ||
    message.includes('underfunded')
  ) {
    return 'Недостаточно XLM для выполнения операции';
  }

  if (message.includes('albedo')) {
    return 'Не удалось подключить кошелёк Albedo';
  }

  return error.message || fallback;
}
