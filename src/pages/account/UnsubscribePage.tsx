import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Text,
  Stack,
  Button,
  Paper,
  ThemeIcon,
  Box,
  useMantineColorScheme,
  Loader,
} from '@mantine/core';
import { IconMailOff, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { post } from '../../utils/apiUtils';
import { useTranslation } from 'react-i18next';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function UnsubscribePage() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [status, setStatus] = useState<Status>('idle');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStatus('loading');
    try {
      const res = await post('Subscribe/unsubscribe', { token });

      if (res.success) {
        setStatus('success');
      } else {
        setStatus('error');
        notifications.show({
          title: t('common.error'),
          message: t('common.somethingWentWrong'),
          color: 'red',
        });
      }
    } catch {
      setStatus('error');
      notifications.show({
        title: t('common.error'),
        message: t('common.somethingWentWrong'),
        color: 'red',
      });
    }
  };

  const renderContent = () => {
    if (status === 'success') {
      return (
        <>
          <ThemeIcon size={72} radius="xl" variant="light" color="teal">
            <IconCircleCheck size={36} />
          </ThemeIcon>
          <Title order={2} fw={800} ta="center" style={!isDark ? { color: '#1a1b1e' } : undefined}>
            {t('unsubscribe.successTitle')}
          </Title>
          <Text
            ta="center"
            size="lg"
            c={isDark ? 'dimmed' : undefined}
            style={!isDark ? { color: '#868e96' } : undefined}
          >
            {t('unsubscribe.successMessage')}
          </Text>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="filled"
              color="teal"
              size="md"
              radius="md"
              onClick={() => navigate('/')}
            >
              {t('common.backToHome')}
            </Button>
          </motion.div>
        </>
      );
    }

    if (status === 'error') {
      return (
        <>
          <ThemeIcon size={72} radius="xl" variant="light" color="red">
            <IconAlertCircle size={36} />
          </ThemeIcon>
          <Title order={2} fw={800} ta="center" style={!isDark ? { color: '#1a1b1e' } : undefined}>
            {t('unsubscribe.errorTitle')}
          </Title>
          <Text
            ta="center"
            size="lg"
            c={isDark ? 'dimmed' : undefined}
            style={!isDark ? { color: '#868e96' } : undefined}
          >
            {t('unsubscribe.errorMessage')}
          </Text>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              variant="filled"
              color="teal"
              size="md"
              radius="md"
              onClick={() => navigate('/')}
            >
              {t('common.backToHome')}
            </Button>
          </motion.div>
        </>
      );
    }

    return (
      <>
        <ThemeIcon size={72} radius="xl" variant="light" color="teal">
          {status === 'loading' ? <Loader size={36} color="teal" /> : <IconMailOff size={36} />}
        </ThemeIcon>
        <Title order={2} fw={800} ta="center" style={!isDark ? { color: '#1a1b1e' } : undefined}>
          {t('unsubscribe.title')}
        </Title>
        <Text
          ta="center"
          size="lg"
          maw={400}
          c={isDark ? 'dimmed' : undefined}
          style={!isDark ? { color: '#868e96' } : undefined}
        >
          {t('unsubscribe.description')}
        </Text>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            variant="filled"
            color="teal"
            size="md"
            radius="md"
            loading={status === 'loading'}
            onClick={handleUnsubscribe}
          >
            {t('unsubscribe.confirmButton')}
          </Button>
        </motion.div>
      </>
    );
  };

  return (
    <Box py={80} style={{ minHeight: '100vh', position: 'relative' }}>
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(0,191,165,0.03) 50%, transparent 100%)'
            : '#ffffff',
          pointerEvents: 'none',
        }}
      />
      <Container size="xs" style={{ position: 'relative' }}>
        <Paper
          className="glass-card"
          p="xl"
          radius="lg"
          style={{
            ...(!isDark && {
              background: '#ffffff',
              border: '1px solid #e9ecef',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }),
          }}
        >
          <Stack align="center" gap="xl">
            {renderContent()}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}