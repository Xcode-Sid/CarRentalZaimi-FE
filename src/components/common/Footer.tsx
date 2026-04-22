import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Group,
  TextInput,
  Button,
  ActionIcon,
  Divider,
  Skeleton,
  Collapse,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconPhone,
  IconMail,
  IconMapPin,
  IconChevronDown,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import { AnimatedSection, StaggerContainer, StaggerItem } from './AnimatedSection';
import { AnimatedDivider } from './AnimatedDivider';
import { get, post } from '../../utils/api.utils';

interface CompanyProfileDto {
  id?: string;
  name?: string;
  logoUrl?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twiterUrl?: string;
  youtubeUrl?: string;
  whatsAppNumber?: string;
  years: number;
}

// Collapsible section for mobile
function FooterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <Box>
      {/* Mobile: tappable header */}
      <UnstyledButton
        onClick={toggle}
        hiddenFrom="sm"
        w="100%"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
        }}
      >
        <Text fw={600} size="md">{title}</Text>
        <motion.div animate={{ rotate: opened ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <IconChevronDown size={16} style={{ opacity: 0.6 }} />
        </motion.div>
      </UnstyledButton>

      {/* Mobile: collapsible body */}
      <Box hiddenFrom="sm">
        <Collapse in={opened}>
          <Box pb="md">{children}</Box>
        </Collapse>
      </Box>

      {/* Desktop: always visible */}
      <Box visibleFrom="sm">
        <Text fw={600} size="md" mb="sm">{title}</Text>
        {children}
      </Box>
    </Box>
  );
}

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<CompanyProfileDto | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [carCategories, setCarCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get('CarCategory/getAll');
        if (response?.data) setCarCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch car categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await get('CompanyProfile/get');
        if (response?.data) setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch company profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const socialIcons = [
    { Icon: IconBrandFacebook, color: 'blue', label: 'Facebook', url: profile?.facebookUrl },
    { Icon: IconBrandInstagram, color: 'pink', label: 'Instagram', url: profile?.instagramUrl },
    { Icon: IconBrandTwitter, color: 'cyan', label: 'Twitter', url: profile?.twiterUrl },
    { Icon: IconBrandYoutube, color: 'red', label: 'YouTube', url: profile?.youtubeUrl },
  ];

  const handleSubscribe = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await post('Subscribe/subscribe', { email });
      if (!response.success) {
        notifications.show({ title: t('error'), message: t('footer.subscribeError'), color: 'red' });
      } else {
        notifications.show({ title: t('success'), message: t('footer.subscribeSuccess'), color: 'teal' });
        setEmail('');
      }
    } catch (error) {
      notifications.show({ title: t('error'), message: t('footer.subscribeError'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="footer">
      <AnimatedDivider maxWidth={1200} />
      <Box py={{ base: 40, sm: 60 }}>
        <Container size="xl" px={{ base: 'sm', sm: 'xl' }}>
          <StaggerContainer stagger={0.12}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 0, sm: 40 }}>

              {/* Brand block — always expanded, no accordion */}
              <StaggerItem>
                <Stack
                  gap="sm"
                  mb={{ base: 'md', sm: 0 }}
                  style={{ alignItems: 'center' }}
                  styles={{ root: { '@media (min-width: 768px)': { alignItems: 'flex-start' } } as any }}
                >
                  <Box style={{ alignSelf: 'inherit' }}>
                    <Logo logoUrl={profile?.logoUrl} />
                  </Box>
                  <Text size="sm" c="dimmed" ta={{ base: 'center', sm: 'left' }}>
                    {profile?.tagline}
                  </Text>
                  <Group gap="xs" justify="center" w="100%">
                    {socialIcons.map(({ Icon, color, label, url }) => (
                      <motion.div
                        key={label}
                        whileHover={{ scale: 1.2, y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <ActionIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          color={color}
                          aria-label={label}
                          component={url ? 'a' : 'button'}
                          href={url || undefined}
                          target={url ? '_blank' : undefined}
                          rel={url ? 'noopener noreferrer' : undefined}
                          style={{ opacity: url ? 1 : 0.4, pointerEvents: url ? 'auto' : 'none' }}
                        >
                          <Icon size={20} />
                        </ActionIcon>
                      </motion.div>
                    ))}
                  </Group>
                </Stack>

                {/* Divider between brand and next section on mobile */}
                <Divider hiddenFrom="sm" />
              </StaggerItem>

              {/* Quick Links */}
              <StaggerItem>
                <FooterSection title={t('footer.quickLinks')}>
                  <Stack gap="sm">
                    {[
                      { to: '/about', label: 'footer.aboutUs' },
                      { to: '/fleet', label: 'footer.fleet' },
                      { to: '/contact', label: 'footer.contact' },
                    ].map((link) => (
                      <motion.div
                        key={link.to + link.label}
                        whileHover={{ x: 4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Text
                          component={Link}
                          to={link.to}
                          size="sm"
                          c="dimmed"
                          style={{ textDecoration: 'none', transition: 'color 0.2s' }}
                        >
                          {t(link.label)}
                        </Text>
                      </motion.div>
                    ))}
                  </Stack>
                </FooterSection>
                <Divider hiddenFrom="sm" />
              </StaggerItem>

              {/* Car Types */}
              <StaggerItem>
                <FooterSection title={t('footer.carTypes')}>
                  <Stack gap="sm">
                    {carCategories.map((category) => (
                      <Text key={category.id} size="sm" c="dimmed">
                        {category.name}
                      </Text>
                    ))}
                  </Stack>
                </FooterSection>
                <Divider hiddenFrom="sm" />
              </StaggerItem>

              {/* Newsletter + Contact */}
              <StaggerItem>
                <FooterSection title={t('footer.newsletter')}>
                  <Stack gap="sm">
                    <Text size="sm" c="dimmed">{t('footer.newsletterDesc')}</Text>
                    <Stack gap="xs">
                      <TextInput
                        placeholder={t('footer.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        radius="md"
                        className="glow-input"
                        onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                      />
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          variant="filled"
                          color="teal"
                          onClick={handleSubscribe}
                          fullWidth
                          radius="md"
                          loading={loading}
                          className="ripple-btn"
                        >
                          {t('footer.subscribe')}
                        </Button>
                      </motion.div>
                    </Stack>

                    <Stack gap={6} mt="xs">
                      <Group gap={6}>
                        <IconPhone size={14} style={{ opacity: 0.6 }} />
                        {loadingProfile ? (
                          <Skeleton height={12} width={120} radius="sm" />
                        ) : (
                          <Text size="xs" c="dimmed">{profile?.phone}</Text>
                        )}
                      </Group>
                      <Group gap={6}>
                        <IconMail size={14} style={{ opacity: 0.6 }} />
                        {loadingProfile ? (
                          <Skeleton height={12} width={150} radius="sm" />
                        ) : (
                          <Text size="xs" c="dimmed">{profile?.email}</Text>
                        )}
                      </Group>
                      <Group gap={6}>
                        <IconMapPin size={14} style={{ opacity: 0.6 }} />
                        {loadingProfile ? (
                          <Skeleton height={12} width={180} radius="sm" />
                        ) : (
                          <Text size="xs" c="dimmed">{profile?.address}</Text>
                        )}
                      </Group>
                    </Stack>
                  </Stack>
                </FooterSection>
              </StaggerItem>

            </SimpleGrid>
          </StaggerContainer>

          <Divider my="xl" />

          <AnimatedSection>
            <Text ta="center" size="sm" c="dimmed">
              © {new Date().getFullYear() - (profile?.years ?? 0)} {profile?.name}. {t('footer.rights')}
            </Text>
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
}