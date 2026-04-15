import { useState } from 'react';
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

const socialIcons = [
  { Icon: IconBrandFacebook, color: 'blue', label: 'Facebook' },
  { Icon: IconBrandInstagram, color: 'pink', label: 'Instagram' },
  { Icon: IconBrandTwitter, color: 'cyan', label: 'Twitter' },
  { Icon: IconBrandYoutube, color: 'red', label: 'YouTube' },
];

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubscribe = async () => {
    if (!email) return;

    try {
      const response = await post('Subscribe/subscribe', {
        email: email
      });

      if (!response.success) {
        notifications.show({
          title: t('error'),
          message: t('footer.subscribeError'),
          color: 'red',
        });
      }

      notifications.show({
        title: t('success'),
        message: t('footer.subscribeSuccess'),
        color: 'teal',
      });
      setEmail('');
    } catch (error) {
      notifications.show({
        title: t('error'),
        message: t('footer.subscribeError'),
        color: 'red',
      });
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
                <Stack gap="md">
                  <Logo height={28} />
                  <Text size="sm" c="dimmed" maw={280}>
                    {t('footer.description')}
                  </Text>
                  <Group gap="xs">
                    {socialIcons.map(({ Icon, color, label }) => (
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
                  <Text size="sm" c="dimmed">{t('footer.luxury')}</Text>
                  <Text size="sm" c="dimmed">{t('footer.suv')}</Text>
                  <Text size="sm" c="dimmed">{t('footer.electric')}</Text>
                  <Text size="sm" c="dimmed">{t('footer.economy')}</Text>
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
                        className="ripple-btn"
                      >
                        {t('footer.subscribe')}
                      </Button>
                    </motion.div>
                  </Stack>
                  <Stack gap={6} mt="xs">
                    <Group gap={6}>
                      <IconPhone size={14} style={{ opacity: 0.6 }} />
                      <Text size="xs" c="dimmed">+355 44 123 456</Text>
                    </Group>
                    <Group gap={6}>
                      <IconMail size={14} style={{ opacity: 0.6 }} />
                      <Text size="xs" c="dimmed">info@autozaimi.al</Text>
                    </Group>
                    <Group gap={6}>
                      <IconMapPin size={14} style={{ opacity: 0.6 }} />
                      <Text size="xs" c="dimmed">{t('footer.address')}</Text>
                    </Group>
                  </Stack>
                </Stack>
              </StaggerItem>
            </SimpleGrid>
          </StaggerContainer>

          <Divider my="xl" />

          <AnimatedSection>
            <Text ta="center" size="sm" c="dimmed">
              © {new Date().getFullYear()} AutoZaimi. {t('footer.rights')}
            </Text>
          </AnimatedSection>
        </Container>
      </Box>
    </Box>
  );
}
