import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Landing from './pages/MainPage';
import GamePage from './pages/GamePage';
import './App.css';

const App: React.FC = () => {
  return (
    <WalletProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </Router>
    </WalletProvider>
  );
};

export default App;
