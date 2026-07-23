import React from 'react';
import StatusPage from './StatusPage';

const NotFoundPage: React.FC = () => (
  <StatusPage
    code="404"
    title="Страница не найдена"
    description="Такого маршрута нет. Вернитесь в сад или откройте игру заново."
  />
);

export default NotFoundPage;
