import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  NavLink,
  Stack,
  Group,
  Badge,
  Box,
  Container,
  Tabs,
  ScrollArea,
} from '@mantine/core';
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
  IconLayoutGrid,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AdBanner } from '../components/common/AdBanner';

const navItems = [
  { path: '/admin', icon: IconDashboard, labelKey: 'admin.dashboard', badge: null },
  { path: '/admin/car-data', icon: IconClipboardList, labelKey: 'admin.carDatas', badge: null },
  { path: '/admin/cars', icon: IconCar, labelKey: 'admin.cars', badge: null },
  { path: '/admin/bookings', icon: IconCalendar, labelKey: 'admin.bookings', badge: '3' },
  { path: '/admin/additional-services', icon: IconLayoutGrid, labelKey: 'admin.aditionalServices', badge: null },
  { path: '/admin/customers', icon: IconUsers, labelKey: 'admin.customers', badge: null },
  { path: '/admin/settings', icon: IconSettings, labelKey: 'admin.settings', badge: null },
  { path: '/admin/analytics', icon: IconChartBar, labelKey: 'admin.analytics', badge: null },
  { path: '/admin/ads', icon: IconAd, labelKey: 'admin.ads', badge: null },
  { path: '/admin/reports', icon: IconFileText, labelKey: 'admin.reports', badge: null },
];

function isAdminNavActive(pathname: string, itemPath: string) {
  return itemPath === '/admin' ? pathname === '/admin' : pathname.startsWith(itemPath);
}

export function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const tabValue =
    navItems.find((item) => isAdminNavActive(location.pathname, item.path))?.path ?? location.pathname;

  return (
    <AppShell header={{ height: 70 }}>
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <AdBanner position="top" />
        <Container size="xl" py="xl">
          <Box hiddenFrom="md" mb="xl">
            <ScrollArea type="auto" offsetScrollbars>
              <Tabs value={tabValue} onChange={(v) => v && navigate(v)}>
                <Tabs.List style={{ flexWrap: 'nowrap' }}>
                  {navItems.map((item, i) => (
                    <motion.div
                      key={item.path}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.04 * i, duration: 0.35 }}
                    >
                      <Tabs.Tab
                        value={item.path}
                        leftSection={<item.icon size={16} />}
                        rightSection={
                          item.badge ? (
                            <Badge color="red" size="xs" variant="filled" circle>
                              {item.badge}
                            </Badge>
                          ) : undefined
                        }
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {t(item.labelKey)}
                      </Tabs.Tab>
                    </motion.div>
                  ))}
                </Tabs.List>
              </Tabs>
            </ScrollArea>
          </Box>

          <Group align="flex-start" gap="xl" wrap="nowrap">
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

            <Box style={{ flex: 1, minWidth: 0 }}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Outlet />
              </motion.div>
            </Box>
          </Group>
        </Container>
        <AdBanner position="bottom" />
        <Footer />
      </AppShell.Main>
    </AppShell>
  );
}
