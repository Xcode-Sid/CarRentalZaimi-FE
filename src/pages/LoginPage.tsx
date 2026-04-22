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
  Modal,
} from '@mantine/core';
import {
  IconMail,
  IconLock,
  IconMailCheck,
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
import { get, post } from '../utils/apiUtils';
import { Loader } from 'lucide-react';
import { useForm } from '@mantine/form';
import Spinner from '../components/spinner/Spinner';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successModalOpened, setSuccessModalOpened] = useState(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : t('enterAValidEmail'),
      password: (v) => {
        if (v.length < 8) return t('passwordMustBeAtLeast8Characters');
        if (!/[a-z]/.test(v)) return t('passwordMustContainAtLeastOneLowercaseLetter');
        if (!/[A-Z]/.test(v)) return t('passwordMustContainAtLeastOneUppercaseLetter');
        if (!/\d/.test(v)) return t('passwordMustContainAtLeastOneNumber');
        if (!/[^a-zA-Z0-9]/.test(v)) return t('passwordMustContainAtLeastOneSpecialCharacter');
        return null;
      },
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    const loggedInUser = await login(values.email, values.password);
    if (loggedInUser) {
      notifications.show({ message: t('login.success'), color: 'teal' });
      // ✅ Read from role object instead of comparing role directly to a string
      navigate(
        loggedInUser.role?.normalizedName?.toLowerCase() === 'admin' ? '/admin' : '/account',
        { replace: true }
      );
    } else {
      form.setErrors({ password: t('login.error') });
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    const emailError = /^\S+@\S+\.\S+$/.test(form.values.email)
      ? null
      : t('enterAValidEmail');

    if (!form.values.email || emailError) {
      form.setFieldError('email', emailError ?? t('login.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      const response = await post('Authentication/forgot-password', { email: form.values.email });
      if (!response.success) throw new Error(response.message?.toString());
      setSuccessModalOpened(true);
    } catch (err) {
      console.error('Forgot password error:', err);
    }
    setLoading(false);
  };

  const handleConfirmPhone = async () => {
    // Reuse the email from the form (same as forgotPassword does)
    const emailError = /^\S+@\S+\.\S+$/.test(form.values.email)
      ? null
      : t('enterAValidEmail');

    if (!form.values.email || emailError) {
      form.setFieldError('email', emailError ?? t('login.emailRequired'));
      return;
    }

    const email = form.values.email;

    try {
      // 1. Get userId by email
      const res = await get(`User/user/email/${email}`);

      if (!res.success || !res.data) {
        notifications.show({
          color: 'red',
          title: t('error'),
          message: t('somethingWentWrong'),
        });
        return;
      }
      if (res.data.status == 'Active') {
        notifications.show({
          color: 'orange',
          title: t('error'),
          message: t('thisAccountIsConfirmed'), 
        });
        return;
      }

      const id = res.data.id;

      if (!id) {
        notifications.show({
          color: 'red',
          title: t('error'),
          message: t('emailDoesNotExist'),
        });
        return;
      }
      // 2. Send SMS verification code
      const smsResponse = await post('Phone/send-verification-code', {
        userId: id,
      });

      if (smsResponse.success) {
        notifications.show({
          color: 'green',
          title: t('success'),
          message: t('verificationCodeSent'),
        });
        navigate("/verify-phone", {
          state: { userId: id },
        });
      }
    } catch (err) {
      console.error('Something went wrong:', err);
    }
  };


  return (
    <>
     <Spinner visible={loading} />
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
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput
                    label={t('login.email')}
                    placeholder="email@example.com"
                    leftSection={<IconMail size={16} />}
                    withAsterisk
                    {...form.getInputProps('email')}
                  />
                  <PasswordInput
                    label={t('login.password')}
                    placeholder="••••••••"
                    leftSection={<IconLock size={16} />}
                    withAsterisk
                    {...form.getInputProps('password')}
                  />
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
            <Text ta="center" mt="md" size="sm">
              <Anchor
                component="button"
                type="button"
                fw={600}
                onClick={handleForgotPassword}
              >
                { t('forgotPassword')}
              </Anchor>
            </Text>
            <Text ta="center" mt="md" size="sm">
              <Anchor
                component="button"
                type="button"
                fw={600}
                onClick={handleConfirmPhone}
              >
                { t('confirmPhoneNumber')}
              </Anchor>
            </Text>
          </AnimatedSection>
        </Container>
      </Box>
      <Modal
        opened={successModalOpened}
        onClose={() => setSuccessModalOpened(false)}
        withCloseButton={false}
        centered
        radius="lg"
        padding="xl"
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <IconMailCheck style={{ width: 30, height: 30, color: 'var(--mantine-color-green-5)' }} />
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            {t('checkYourEmail')}
          </h2>

          <p style={{ fontSize: '0.875rem', color: 'var(--mantine-color-dimmed)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
            {t('passwordSentToEmail')}
          </p>

          <motion.button
            onClick={() => setSuccessModalOpened(false)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, var(--mantine-color-green-6), var(--mantine-color-teal-5))',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {t('gotIt')}
          </motion.button>
        </div>
      </Modal>
    </>
  );
}
