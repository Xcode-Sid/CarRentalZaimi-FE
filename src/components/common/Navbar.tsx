import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Group,
  Button,
  Text,
  Menu,
  Avatar,
  Indicator,
  Burger,
  Drawer,
  Stack,
  Divider,
  Box,
  ActionIcon,
  UnstyledButton,
  TextInput,
  Transition,
} from '@mantine/core';
import {
  IconUser,
  IconDeviceFloppy,
  IconCalendar,
  IconSettings,
  IconLogout,
  IconBell,
  IconSearch,
  IconShieldCheck,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Logo } from './Logo';

export function Navbar() {
  const { t } = useTranslation();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const diff = latest - lastScrollY.current;
    setScrolled(latest > 20);
    if (latest > 150 && diff > 8) {
      setHidden(true);
    } else if (diff < -8) {
      setHidden(false);
    }
    lastScrollY.current = latest;
  });

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const navLinks = [
    { label: t('nav.home'), path: '/', hash: '' },
    { label: t('nav.fleet'), path: '/fleet', hash: '' },
    { label: t('nav.about'), path: '/about', hash: '' },
    { label: t('nav.contact'), path: '/contact', hash: '' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = (link: { path: string; hash: string }) => {
    if (link.hash) {
      if (location.pathname === '/') {
        const el = document.getElementById(link.hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      navigate(`/${link.hash ? '#' + link.hash : ''}`);
    } else {
      navigate(link.path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      className={`nav-bar ${scrolled ? 'nav-bar-scrolled' : ''}`}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 200,
      }}
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <Box
        px="xl"
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}
      >
        {/* ——— LEFT: Logo ——— */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UnstyledButton component={Link} to="/" className="nav-logo-wrap">
            <Logo height={36} />
          </UnstyledButton>
        </motion.div>

        {/* ——— RIGHT: Nav links + actions ——— */}
        <Group gap={0} visibleFrom="md" style={{ alignItems: 'center' }}>
          {/* Nav links */}
          <Group gap={0} mr="lg">
            {navLinks.map((link, i) => {
              const linkActive = !link.hash && isActive(link.path);
              return (
                <motion.div
                  key={link.path + link.hash}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 + i * 0.06 }}
                >
                  <UnstyledButton
                    onClick={() => handleNavClick(link)}
                    className="nav-link-pill"
                    style={{ position: 'relative', padding: '8px 20px' }}
                  >
                    {linkActive && (
                      <motion.span
                        className="nav-pill-active"
                        layoutId="nav-pill"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Text
                      size="sm"
                      fw={linkActive ? 700 : 600}
                      tt="uppercase"
                      c={linkActive ? 'teal' : undefined}
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        letterSpacing: '0.04em',
                        transition: 'color 0.2s',
                      }}
                    >
                      {link.label}
                    </Text>
                  </UnstyledButton>
                </motion.div>
              );
            })}
          </Group>

          {/* Divider */}
          <Box
            style={{
              width: 1,
              height: 24,
              background: 'var(--mantine-color-dark-4)',
              opacity: 0.5,
              marginRight: 12,
            }}
          />

          {/* Search */}
          <Group gap={0} style={{ position: 'relative' }}>
            <Transition mounted={searchOpen} transition="scale-x" duration={250}>
              {(styles) => (
                <TextInput
                  ref={searchRef}
                  placeholder={t('nav.search') + '...'}
                  size="sm"
                  radius="xl"
                  className="glow-input"
                  style={{ ...styles, width: 200, marginRight: 4 }}
                  rightSection={
                    <ActionIcon variant="subtle" size="sm" onClick={() => setSearchOpen(false)}>
                      <IconX size={14} />
                    </ActionIcon>
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setSearchOpen(false);
                    if (e.key === 'Enter') {
                      setSearchOpen(false);
                      navigate('/fleet');
                    }
                  }}
                />
              )}
            </Transition>
            {!searchOpen && (
              <ActionIcon
                variant="subtle"
                size="lg"
                radius="xl"
                aria-label={t('nav.search')}
                onClick={() => setSearchOpen(true)}
              >
                <IconSearch size={20} />
              </ActionIcon>
            )}
          </Group>

          {/* Notifications (customer accounts only) */}
          {isLoggedIn && !isAdmin && (
            <Indicator color="red" size={8} offset={4} processing>
              <ActionIcon variant="subtle" size="lg" radius="xl" aria-label={t('nav.notifications')}>
                <IconBell size={20} />
              </ActionIcon>
            </Indicator>
          )}

          {/* Auth section */}
          {isLoggedIn ? (
            <Menu shadow="lg" width={220} position="bottom-end">
              <Menu.Target>
                <Avatar
                  radius="xl"
                  size="md"
                  color="teal"
                  ml="xs"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--mantine-color-teal-6)';
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(45,212,168,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* {user?.avatar} */}
                </Avatar>
              </Menu.Target>
              <Menu.Dropdown className="animate-scale-in">
                {isAdmin ? (
                  <>
                    <Menu.Label>{t('nav.adminPanel')}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconShieldCheck size={16} />}
                      onClick={() => navigate('/admin')}
                      color="teal"
                    >
                      {t('nav.adminPanel')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout} color="red">
                      {t('nav.logout')}
                    </Menu.Item>
                  </>
                ) : (
                  <>
                    <Menu.Label>{t('nav.userPanel')}</Menu.Label>
                    <Menu.Item
                      leftSection={<IconUser size={16} />}
                      onClick={() => navigate('/account')}
                      color="teal"
                    >
                      {t('nav.userPanel')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item leftSection={<IconLogout size={16} />} onClick={handleLogout} color="red">
                      {t('nav.logout')}
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          ) : (
            <>
            <Button
              variant="filled"
              color="teal"
              size="sm"
              radius="xl"
              ml="xs"
              className="nav-cta-glow"
              onClick={() => navigate('/register')}
              style={{ fontWeight: 700, letterSpacing: '0.02em' }}
              tt="uppercase"
            >
              {t('nav.register')}
            </Button>
            <Button
              variant="filled"
              color="teal"
              size="sm"
              radius="xl"
              ml="xs"
              className="nav-cta-glow"
              onClick={() => navigate('/login')}
              style={{ fontWeight: 700, letterSpacing: '0.02em' }}
              tt="uppercase"
            >
              {t('nav.login')}
            </Button></>
          )}
        </Group>

        {/* ——— MOBILE: burger ——— */}
        <Burger
          opened={drawerOpen}
          onClick={() => setDrawerOpen(!drawerOpen)}
          hiddenFrom="md"
          size="sm"
        />
      </Box>

      {/* Mobile drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        size="xs"
        title={<Logo height={28} />}
        padding="md"
      >
        <Stack gap="sm">
          <TextInput
            placeholder={t('nav.search') + '...'}
            leftSection={<IconSearch size={16} />}
            radius="md"
            size="sm"
            className="glow-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setDrawerOpen(false);
                navigate('/fleet');
              }
            }}
          />
          <Divider my={4} />
          {navLinks.map((link, i) => (
            <Button
              key={link.path + link.hash}
              variant={!link.hash && isActive(link.path) ? 'light' : 'subtle'}
              color={!link.hash && isActive(link.path) ? 'teal' : undefined}
              fullWidth
              justify="start"
              radius="md"
              tt="uppercase"
              onClick={() => { handleNavClick(link); setDrawerOpen(false); }}
              className="drawer-stagger-item"
              style={{ fontWeight: 600, letterSpacing: '0.03em', '--stagger-delay': `${i * 0.06}s` } as React.CSSProperties}
            >
              {link.label}
            </Button>
          ))}
          <Divider my="sm" />
          {isLoggedIn ? (
            isAdmin ? (
              <>
                <Button variant="light" color="teal" fullWidth justify="start" leftSection={<IconShieldCheck size={16} />} onClick={() => { navigate('/admin'); setDrawerOpen(false); }}>
                  {t('nav.adminPanel')}
                </Button>
                <Button variant="subtle" color="red" fullWidth justify="start" leftSection={<IconLogout size={16} />} onClick={() => { handleLogout(); setDrawerOpen(false); }}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                  {t('nav.userPanel')}
                </Text>
                <Button
                  variant="light"
                  color="teal"
                  fullWidth
                  justify="start"
                  leftSection={<IconUser size={16} />}
                  onClick={() => {
                    navigate('/account');
                    setDrawerOpen(false);
                  }}
                >
                  {t('nav.userPanel')}
                </Button>
                <Button
                  variant="subtle"
                  color="red"
                  fullWidth
                  justify="start"
                  leftSection={<IconLogout size={16} />}
                  onClick={() => {
                    handleLogout();
                    setDrawerOpen(false);
                  }}
                >
                  {t('nav.logout')}
                </Button>
              </>
            )
          ) : (
            <Button variant="filled" color="teal" fullWidth onClick={() => { navigate('/register'); setDrawerOpen(false); }}>
              {t('nav.register')}
            </Button>
          )}
        </Stack>
      </Drawer>
    </motion.header>
  );
}
