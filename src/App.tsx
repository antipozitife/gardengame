import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Landing from './pages/MainPage';
import GamePage from './pages/GamePage';
import NotFoundPage from './pages/NotFoundPage';
import ServerErrorPage from './pages/ServerErrorPage';
import WalletErrorPage from './pages/WalletErrorPage';
import NetworkErrorPage from './pages/NetworkErrorPage';
import './App.css';

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
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/game" element={<GamePage />} />
              <Route path="/error/500" element={<ServerErrorPage />} />
              <Route path="/error/wallet" element={<WalletErrorPage />} />
              <Route path="/error/network" element={<NetworkErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </Router>
      </WalletProvider>
    </ThemeProvider>
  );
};

export default App;
