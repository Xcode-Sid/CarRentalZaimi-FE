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
  Divider,
} from '@mantine/core';
import {
  IconMail,
  IconLock,
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandWindows,
  IconBrandYahoo,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from '../components/common/Logo';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/common/AnimatedSection';
import GoogleOAuth from './oauth/GoogleOAuth';
import FacebookOAuth from './oauth/FacebookOAuth';
import MicrosoftOAuth from './oauth/MicrosoftOAuth';
import YahooOAuth from './oauth/YahooOAuth';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const loggedInUser = await login(email, password);
    if (loggedInUser) {
      notifications.show({ message: t('login.success'), color: 'teal' });
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/account', { replace: true });
    } else {
      setError(t('login.error'));
    }
    setLoading(false);
  };

  return (
    <Box w="100%" py={{ base: 'md', sm: 'xl' }}>
      <Container size={440} w="100%">
        <AnimatedSection>
          <Stack align="center" mb="xl">
            <motion.div
              whileHover={{ scale: 1.05 }}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Logo height={44} />
            </motion.div>
            <Text size="xl" fw={700}>{t('login.title')}</Text>
            <Text c="dimmed" size="sm">{t('login.subtitle')}</Text>
          </Stack>
        </AnimatedSection>

        <AnimatedSection delay={0.15} scale>
          <Paper
            className="glass-card"
            radius="lg"
            p="xl"
          >
            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                <TextInput
                  label={t('login.email')}
                  placeholder="email@example.com"
                  leftSection={<IconMail size={16} />}
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                />
                <PasswordInput
                  label={t('login.password')}
                  placeholder="••••••••"
                  leftSection={<IconLock size={16} />}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                />
                {error && (
                  <Text c="red" size="sm" ta="center">
                    {error}
                  </Text>
                )}
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
                    {t('login.submit')}
                  </Button>
                </motion.div>
              </Stack>
            </form>

            <Divider label={t('login.orSocial')} labelPosition="center" my="lg" />

            <StaggerContainer stagger={0.06}>
              <Box mb="lg">
                <Stack gap="sm">
                  <GoogleOAuth />
                  <FacebookOAuth />
                  <MicrosoftOAuth />
                  <YahooOAuth />
                </Stack>
              </Box>
            </StaggerContainer>
          </Paper>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <Text ta="center" mt="md" size="sm">
            {t('login.noAccount')}{' '}
            <Anchor component={Link} to="/register" fw={600}>
              {t('login.register')}
            </Anchor>
          </Text>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
