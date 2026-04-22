import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Box, Container, NavLink, Stack, Group, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconUser, IconDeviceFloppy, IconCalendar, IconSettings } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AdBanner } from '../components/common/AdBanner';

const navItems = [
  { path: '/account/profile', icon: IconUser, labelKey: 'account.profile' },
  { path: '/account/saved', icon: IconDeviceFloppy, labelKey: 'account.savedCars' },
  { path: '/account/bookings', icon: IconCalendar, labelKey: 'account.myBookings' },
  { path: '/account/settings', icon: IconSettings, labelKey: 'account.settings' },
];

export function AccountLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <AppShell
      header={{ height: 70 }}
      styles={{
        main: {
          paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom))' : undefined,
        },
      }}
    >
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>

      <AppShell.Main>
        <AdBanner position="top" />
        <Container size="xl" py="xl" px={{ base: 'sm', sm: 'xl' }}>
          <Group align="flex-start" gap="xl" wrap="nowrap">
            {/* Desktop sidebar */}
            <Box
              visibleFrom="md"
              w={260}
              className="glass-card card-gradient-border"
              p="md"
              style={{ borderRadius: 'var(--mantine-radius-xl)', flexShrink: 0 }}
            >
              <Stack gap={6}>
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ x: 4 }}
                  >
                    <NavLink
                      label={t(item.labelKey)}
                      leftSection={<item.icon size={18} />}
                      active={location.pathname === item.path}
                      onClick={() => navigate(item.path)}
                      style={{ borderRadius: 'var(--mantine-radius-md)' }}
                      variant="subtle"
                      color="teal"
                    />
                  </motion.div>
                ))}
              </Stack>
            </Box>

            {/* Page content */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Outlet />
              </motion.div>
            </Box>
          </Group>
        </Container>

        <AdBanner position="bottom" />
        <Footer />
      </AppShell.Main>

      {/* Mobile bottom tab bar */}
      <Box
        hiddenFrom="md"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'var(--mantine-color-body)',
          borderTop: '1px solid var(--mantine-color-default-border)',
          display: 'flex',
          alignItems: 'stretch',
        }}
      >
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <UnstyledButton
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                padding: '10px 4px',
                color: active
                  ? 'var(--mantine-color-teal-6)'
                  : 'var(--mantine-color-dimmed)',
                transition: 'color 0.2s',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={active ? 'active' : 'idle'}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: active ? 1.15 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <item.icon size={22} stroke={active ? 2.2 : 1.6} />
                </motion.div>
              </AnimatePresence>
              <Text
                size="10px"
                fw={active ? 700 : 400}
                style={{ lineHeight: 1, whiteSpace: 'nowrap' }}
              >
                {t(item.labelKey)}
              </Text>
            </UnstyledButton>
          );
        })}
      </Box>
    </AppShell>
  );
}