import React from 'react';
import Spinner from '../Spinner/Spinner';
import './PageLoader.css';

const PageLoader: React.FC = () => (
  <div className="page-loader" role="status" aria-live="polite" aria-label="Загрузка страницы">
    <Spinner size="lg" label="Загрузка..." />
  </div>
);

export default PageLoader;
