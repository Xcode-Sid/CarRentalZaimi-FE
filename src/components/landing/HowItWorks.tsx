import { Container, Title, Text, SimpleGrid, Stack, ThemeIcon, Box, useMantineColorScheme } from '@mantine/core';
import { IconCar, IconCalendarEvent, IconKey } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

const steps = [
  { icon: IconCar, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc', color: 'teal' },
  { icon: IconCalendarEvent, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc', color: 'teal' },
  { icon: IconKey, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc', color: 'green' },
];

export function HowItWorks() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box py={80} style={{ position: 'relative' }}>
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark ? 'linear-gradient(180deg, transparent 0%, rgba(0,191,165,0.03) 50%, transparent 100%)' : '#ffffff',
          pointerEvents: 'none',
        }}
      />
      <Container size="lg" style={{ position: 'relative' }}>
        <AnimatedSection scale>
          <Stack align="center" gap="sm" mb={40}>
            <div className="section-label">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--az-teal)', boxShadow: '0 0 6px var(--az-teal)' }} />
              {t('howItWorks.title')}
            </div>
            <Title
              order={2}
              ta="center"
              fw={800}
              style={!isDark ? { color: '#1a1b1e' } : undefined}
            >
              {t('howItWorks.title')}
            </Title>
          </Stack>
        </AnimatedSection>

        <StaggerContainer stagger={0.2}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {steps.map((step, i) => (
              <StaggerItem key={i} scale>
                <motion.div
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Stack
                    align="center"
                    gap="md"
                    className={`glass-card card-shimmer ${i < steps.length - 1 ? 'step-connector' : ''}`}
                    p="xl"
                    style={{
                      borderRadius: 'var(--mantine-radius-xl)',
                      position: 'relative',
                      ...(!isDark && {
                        background: '#ffffff',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      }),
                    }}
                  >
                    <div className="step-number">{i + 1}</div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                    >
                      <ThemeIcon
                        size={72}
                        radius="xl"
                        variant="light"
                        color={step.color}
                        style={{ boxShadow: '0 6px 20px rgba(45,212,168,0.12)' }}
                      >
                        <step.icon size={36} />
                      </ThemeIcon>
                    </motion.div>

                    <Text
                      size="xl"
                      fw={700}
                      ta="center"
                      style={!isDark ? { color: '#1a1b1e' } : undefined}
                    >
                      {t(step.titleKey)}
                    </Text>

                    <Text
                      ta="center"
                      size="sm"
                      c={isDark ? 'dimmed' : undefined}
                      style={!isDark ? { color: '#868e96' } : undefined}
                    >
                      {t(step.descKey)}
                    </Text>
                  </Stack>
                </motion.div>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      </Container>
    </Box>
  );
}
