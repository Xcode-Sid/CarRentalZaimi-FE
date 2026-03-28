import { Container, Stack, Text, Button, ThemeIcon } from '@mantine/core';
import { IconError404 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../components/common/AnimatedSection';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Container size="sm" py={120}>
      <Stack align="center" gap="xl">
        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <ThemeIcon size={120} radius="xl" variant="light" color="teal">
            <IconError404 size={60} />
          </ThemeIcon>
        </motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <Text
            size="3rem"
            fw={900}
            c="teal"
            ta="center"
          >
            404
          </Text>
        </motion.div>

        <AnimatedSection delay={0.2}>
          <Text size="xl" fw={600} ta="center">
            {t('notFound.title')}
          </Text>
        </AnimatedSection>

        <AnimatedSection delay={0.25}>
          <Text c="dimmed" ta="center" maw={400}>
            {t('notFound.subtitle')}
          </Text>
        </AnimatedSection>

        <AnimatedSection delay={0.3}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="filled"
              color="teal"
              size="lg"
              onClick={() => navigate('/')}
              className="ripple-btn"
            >
              {t('notFound.backHome')}
            </Button>
          </motion.div>
        </AnimatedSection>
      </Stack>
    </Container>
  );
}
