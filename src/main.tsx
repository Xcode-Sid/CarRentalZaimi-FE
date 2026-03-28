import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { BookingsProvider } from './contexts/BookingsContext';
import { AdsProvider } from './contexts/AdsContext';
import { theme } from './theme';
import App from './App';
import './i18n';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/charts/styles.css';
import './index.css';

const savedScheme = localStorage.getItem('az-color-scheme') as 'dark' | 'light' | null;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme={savedScheme || 'dark'}>
      <Notifications position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <FavoritesProvider>
            <BookingsProvider>
              <AdsProvider>
                <App />
              </AdsProvider>
            </BookingsProvider>
          </FavoritesProvider>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);
