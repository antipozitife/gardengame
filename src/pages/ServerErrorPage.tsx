import React from 'react';
import StatusPage from './StatusPage';

const ServerErrorPage: React.FC = () => (
  <StatusPage
    code="500"
    title="Внутренняя ошибка"
    description="Сервер или клиентское приложение столкнулись с неожиданной ошибкой."
    actionLabel="Обновить главную"
  />
);

export default ServerErrorPage;
