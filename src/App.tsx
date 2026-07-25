import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import PageLoader from './components/ui/PageLoader/PageLoader';
import './App.css';

const Landing = lazy(() => import('./pages/MainPage'));
const GamePage = lazy(() => import('./pages/GamePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/ServerErrorPage'));
const WalletErrorPage = lazy(() => import('./pages/WalletErrorPage'));
const NetworkErrorPage = lazy(() => import('./pages/NetworkErrorPage'));

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <WalletProvider>
        <Router>
          <ErrorBoundary>
            <Toaster
              position="top-right"
              toastOptions={{
                className: 'app-toast',
                duration: 4000,
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/error/500" element={<ServerErrorPage />} />
                <Route path="/error/wallet" element={<WalletErrorPage />} />
                <Route path="/error/network" element={<NetworkErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
