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
} from '@mantine/core';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconPhone,
  IconMail,
  IconMapPin,
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
        if (response?.data) {
          setCarCategories(response.data);
        }
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
        if (response?.data) {
          setProfile(response.data);
        }
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
      <Box py={60}>
        <Container size="xl">
          <StaggerContainer stagger={0.12}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={40}>
              <StaggerItem>
                <Stack gap={2} align="flex-start" w="100%"  >
                  <Logo logoUrl={profile?.logoUrl} />
                  <Text size="sm" c="dimmed" style={{ marginLeft: 20 }}>
                    {profile?.tagline}
                  </Text>
                  <Group gap="xs">
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
              </StaggerItem>

              <StaggerItem>
                <Stack gap="sm">
                  <Text fw={600} size="md">{t('footer.quickLinks')}</Text>
                  {[
                    { to: '/about', label: 'footer.aboutUs' },
                    { to: '/fleet', label: 'footer.fleet' },
                    { to: '/contact', label: 'footer.contact' },
                  ].map((link) => (
                    <motion.div key={link.to + link.label} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Text component={Link} to={link.to} size="sm" c="dimmed" style={{ textDecoration: 'none', transition: 'color 0.2s' }}>
                        {t(link.label)}
                      </Text>
                    </motion.div>
                  ))}
                </Stack>
              </StaggerItem>

              <StaggerItem>
                <Stack gap="sm">
                  <Text fw={600} size="md">{t('footer.carTypes')}</Text>
                  {carCategories.map((category) => (
                    <Text key={category.id} size="sm" c="dimmed">
                      {category.name}
                    </Text>
                  ))}
                </Stack>
              </StaggerItem>

              <StaggerItem>
                <Stack gap="sm">
                  <Text fw={600} size="md">{t('footer.newsletter')}</Text>
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