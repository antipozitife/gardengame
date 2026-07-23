import React from 'react';
import StatusPage from './StatusPage';

const WalletErrorPage: React.FC = () => (
  <StatusPage
    code="Wallet"
    title="Кошелёк недоступен"
    description="Не удалось подключить Albedo или транзакция была отклонена. Проверьте расширение и попробуйте снова."
    actionLabel="К игре"
    actionTo="/game"
  />
);

export default WalletErrorPage;
