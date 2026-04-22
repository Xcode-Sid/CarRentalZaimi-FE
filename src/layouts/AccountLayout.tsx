import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppShell, Box, Container, NavLink, Stack, Group, Tabs, ScrollArea } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { AdBanner } from '../components/common/AdBanner';
import { accountNavItems as navItems } from '../constants/navigation';

export function AccountLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell header={{ height: 70 }}>
      <AppShell.Header>
        <Navbar />
      </AppShell.Header>
      <AppShell.Main>
        <AdBanner position="top" />
        <Container size="xl" py="xl">
          {/* Mobile tabs with horizontal scroll */}
          <Box hiddenFrom="md" mb="xl">
            <ScrollArea type="auto" offsetScrollbars>
              <Tabs value={location.pathname} onChange={(v) => v && navigate(v)}>
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
