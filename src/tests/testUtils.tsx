import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { WalletProvider } from '../context/WalletContext';
import { ThemeProvider } from '../context/ThemeContext';

const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <WalletProvider>{children}</WalletProvider>
  </ThemeProvider>
);

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });
