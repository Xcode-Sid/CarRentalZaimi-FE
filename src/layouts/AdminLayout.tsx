import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  NavLink,
  Stack,
  Group,
  Badge,
  Box,
  Container,
  ScrollArea,
  Drawer,
  ActionIcon,
  Text,
  UnstyledButton,
  Indicator,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconDashboard,
  IconCar,
  IconCalendar,
  IconUsers,
  IconSettings,
  IconChartBar,
  IconFileText,
  IconAd,
  IconClipboardList,
  IconRosetteDiscount,
  IconLayoutGrid,
  IconStar,
  IconBriefcase,
  IconFileCheck,
  IconShieldCheck,
  IconMailbox,
  IconCalendarOff,
  IconPhone,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AdBanner } from '../components/common/AdBanner';

const navItems = [
  { path: '/admin', icon: IconDashboard, labelKey: 'admin.dashboard', badge: null },
  { path: '/admin/car-data', icon: IconClipboardList, labelKey: 'admin.carDatas', badge: null },
  { path: '/admin/cars', icon: IconCar, labelKey: 'admin.cars', badge: null },
  { path: '/admin/featured_cars', icon: IconStar, labelKey: 'admin.featuredCars', badge: null },
  { path: '/admin/bookings', icon: IconCalendar, labelKey: 'admin.bookings', badge: null },
  { path: '/admin/promotion', icon: IconRosetteDiscount, labelKey: 'admin.promotions', badge: null },
  { path: '/admin/additional-services', icon: IconLayoutGrid, labelKey: 'admin.aditionalServices', badge: null },
  { path: '/admin/customers', icon: IconUsers, labelKey: 'admin.customers', badge: null },
  { path: '/admin/partners', icon: IconBriefcase, labelKey: 'admin.partners', badge: null },
  { path: '/admin/terms', icon: IconFileCheck, labelKey: 'admin.terms', badge: null },
  { path: '/admin/privacies', icon: IconShieldCheck, labelKey: 'admin.privacies', badge: null },
  { path: '/admin/settings', icon: IconSettings, labelKey: 'admin.settings', badge: null },
  { path: '/admin/subscriptions', icon: IconMailbox, labelKey: 'admin.subscriptions', badge: null },
  { path: '/admin/occupiedDays', icon: IconCalendarOff, labelKey: 'admin.occupiedDays', badge: null },
  { path: '/admin/statePrefixes', icon: IconPhone, labelKey: 'admin.statePrefixes', badge: null },
  { path: '/admin/ads', icon: IconAd, labelKey: 'admin.ads', badge: null },
  { path: '/admin/analytics', icon: IconChartBar, labelKey: 'admin.analytics', badge: null },
  { path: '/admin/reports', icon: IconFileText, labelKey: 'admin.reports', badge: null },
];

// Items to pin in the bottom bar for quick access on mobile
const pinnedItems = navItems.slice(0, 4);

function isAdminNavActive(pathname: string, itemPath: string) {
  return itemPath === '/admin' ? pathname === '/admin' : pathname.startsWith(itemPath);
}

export function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleNavigate = (path: string) => {
    navigate(path);
    closeDrawer();
  };

  const activeItem = navItems.find((item) => isAdminNavActive(location.pathname, item.path));

  return (
    <AppShell
      header={{ height: 70 }}
      // Add bottom padding on mobile so content isn't hidden behind the bottom nav bar
      styles={{
        main: {
          paddingBottom: isMobile ? 'calc(72px + env(safe-area-inset-bottom))' : undefined,
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
            {/* ── Desktop sidebar ── */}
            <Box
              visibleFrom="md"
              w={260}
              className="glass-card card-gradient-border"
              p="md"
              style={{ borderRadius: 'var(--mantine-radius-xl)', flexShrink: 0 }}
            >
              <Stack gap={6}>
                {navItems.map((item, i) => {
                  const active = isAdminNavActive(location.pathname, item.path);
                  return (
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
                        rightSection={
                          item.badge ? (
                            <Badge color="red" size="xs" variant="filled" circle>
                              {item.badge}
                            </Badge>
                          ) : undefined
                        }
                        active={active}
                        onClick={() => navigate(item.path)}
                        style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        variant="subtle"
                        color="teal"
                      />
                    </motion.div>
                  );
                })}
              </Stack>
            </Box>

            {/* ── Page content ── */}
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

      {/* ── Mobile: full-menu drawer ── */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Text fw={700} size="sm" tt="uppercase" c="teal" style={{ letterSpacing: '0.08em' }}>
            {t('admin.menu', 'Admin Menu')}
          </Text>
        }
        size="xs"
        position="left"
        hiddenFrom="md"
        styles={{
          header: { paddingBottom: 8 },
          body: { padding: '8px 12px' },
        }}
      >
        <ScrollArea h="calc(100dvh - 80px)" type="scroll">
          <Stack gap={4}>
            {navItems.map((item, i) => {
              const active = isAdminNavActive(location.pathname, item.path);
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i, duration: 0.25 }}
                >
                  <NavLink
                    label={t(item.labelKey)}
                    leftSection={<item.icon size={18} />}
                    rightSection={
                      item.badge ? (
                        <Badge color="red" size="xs" variant="filled" circle>
                          {item.badge}
                        </Badge>
                      ) : undefined
                    }
                    active={active}
                    onClick={() => handleNavigate(item.path)}
                    style={{ borderRadius: 'var(--mantine-radius-md)' }}
                    variant="subtle"
                    color="teal"
                  />
                </motion.div>
              );
            })}
          </Stack>
        </ScrollArea>
      </Drawer>

      {/* ── Mobile bottom navigation bar ── */}
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
        {/* 4 pinned quick-access items */}
        {pinnedItems.map((item) => {
          const active = isAdminNavActive(location.pathname, item.path);
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
                  {item.badge ? (
                    <Indicator color="red" size={8} offset={2} processing>
                      <item.icon size={22} stroke={active ? 2.2 : 1.6} />
                    </Indicator>
                  ) : (
                    <item.icon size={22} stroke={active ? 2.2 : 1.6} />
                  )}
                </motion.div>
              </AnimatePresence>
              <Text
                size="10px"
                fw={active ? 700 : 400}
                style={{
                  lineHeight: 1,
                  maxWidth: 56,
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {t(item.labelKey)}
              </Text>
            </UnstyledButton>
          );
        })}

        {/* "More" button → opens full drawer */}
        <UnstyledButton
          onClick={openDrawer}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '10px 4px',
            color: drawerOpened
              ? 'var(--mantine-color-teal-6)'
              : 'var(--mantine-color-dimmed)',
            transition: 'color 0.2s',
          }}
        >
          <motion.div
            animate={{ rotate: drawerOpened ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {drawerOpened ? <IconX size={22} stroke={2} /> : <IconMenu2 size={22} stroke={1.6} />}
          </motion.div>
          <Text size="10px" fw={400} style={{ lineHeight: 1 }}>
            {t('admin.more', 'More')}
          </Text>
        </UnstyledButton>
      </Box>
    </AppShell>
  );
}