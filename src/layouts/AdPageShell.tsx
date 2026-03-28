import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mantine/core';
import { AdBanner } from '../components/common/AdBanner';

/** Top + bottom ads with a flexible main area (auth pages, 404, etc.). */
export function AdsVerticalLayout({ children }: { children: ReactNode }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--mantine-color-body)',
      }}
    >
      <AdBanner position="top" />
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        {children}
      </Box>
      <AdBanner position="bottom" />
    </Box>
  );
}

/** Same as AdsVerticalLayout but renders an `<Outlet />` for nested routes. */
export function AdPageShell() {
  return (
    <AdsVerticalLayout>
      <Outlet />
    </AdsVerticalLayout>
  );
}
