import React from 'react';
import StatusPage from './StatusPage';

const NetworkErrorPage: React.FC = () => (
  <StatusPage
    code="Network"
    title="Ошибка сети"
    description="Нет связи с Horizon / Soroban RPC. Проверьте интернет и доступность Stellar testnet."
    actionLabel="Попробовать игру"
    actionTo="/game"
  />
);

export default NetworkErrorPage;
