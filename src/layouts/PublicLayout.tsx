import { Outlet } from 'react-router-dom';
import { Box } from '@mantine/core';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AdBanner } from '../components/common/AdBanner';

export function PublicLayout() {
  return (
    <Box>
      <Navbar />
      <AdBanner position="top" />
      <Box mih="100vh">
        <Outlet />
      </Box>
      <AdBanner position="bottom" />
      <Footer />
    </Box>
  );
}
