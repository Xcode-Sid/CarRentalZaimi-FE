import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Group,
  Box,
  Anchor,
  SimpleGrid,
  Divider,
} from '@mantine/core';
import {
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandWindows,
  IconBrandYahoo,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/common/AnimatedSection';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      notifications.show({ message: t('register.success'), color: 'teal' });
      navigate('/login');
      setLoading(false);
    }, 800);
  };

  const handleSocialRegister = (provider: string) => {
    notifications.show({ message: `${t('register.success')} (${provider})`, color: 'teal' });
    navigate('/login');
  };

  return (
    <Box w="100%" py={{ base: 'md', sm: 'xl' }}>
      <Container size={520} w="100%">
        <AnimatedSection>
          <Stack align="center" mb="xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Logo height={44} />
            </motion.div>
            <Text size="xl" fw={700}>{t('register.title')}</Text>
            <Text c="dimmed" size="sm">{t('register.subtitle')}</Text>
          </Stack>
        </AnimatedSection>

        <AnimatedSection delay={0.15} scale>
          <Paper className="glass-card" radius="lg" p="xl">
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <TextInput
                    label={t('register.firstName')}
                    leftSection={<IconUser size={16} />}
                    required
                  />
                  <TextInput
                    label={t('register.lastName')}
                    leftSection={<IconUser size={16} />}
                    required
                  />
                </SimpleGrid>
                <TextInput
                  label={t('register.email')}
                  placeholder="email@example.com"
                  leftSection={<IconMail size={16} />}
                  required
                />
                <TextInput
                  label={t('register.phone')}
                  placeholder="+355 6X XXX XXXX"
                  leftSection={<IconPhone size={16} />}
                />
                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                  <PasswordInput
                    label={t('register.password')}
                    placeholder="••••••••"
                    leftSection={<IconLock size={16} />}
                    required
                  />
                  <PasswordInput
                    label={t('register.confirmPassword')}
                    placeholder="••••••••"
                    leftSection={<IconLock size={16} />}
                    required
                  />
                </SimpleGrid>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="filled"
                    color="teal"
                    size="md"
                    loading={loading}
                    className="ripple-btn"
                  >
                    {t('register.submit')}
                  </Button>
                </motion.div>
              </Stack>
            </form>

            <Divider label={t('register.orSocial')} labelPosition="center" my="lg" />

            <StaggerContainer stagger={0.06}>
              <Stack gap="sm">
                {[
                  { color: 'red', icon: IconBrandGoogle, label: t('login.google'), provider: 'Google' },
                  { color: 'blue', icon: IconBrandFacebook, label: t('login.facebook'), provider: 'Facebook' },
                  { color: 'indigo', icon: IconBrandWindows, label: t('login.microsoft'), provider: 'Microsoft' },
                  { color: 'teal', icon: IconBrandYahoo, label: t('login.yahoo'), provider: 'Yahoo' },
                ].map((btn) => (
                  <StaggerItem key={btn.provider}>
                    <Button
                      fullWidth
                      variant="outline"
                      color={btn.color}
                      leftSection={<btn.icon size={18} />}
                      onClick={() => handleSocialRegister(btn.provider)}
                    >
                      {btn.label}
                    </Button>
                  </StaggerItem>
                ))}
              </Stack>
            </StaggerContainer>
          </Paper>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <Text ta="center" mt="md" size="sm">
            {t('register.hasAccount')}{' '}
            <Anchor component={Link} to="/login" fw={600}>
              {t('register.login')}
            </Anchor>
          </Text>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
