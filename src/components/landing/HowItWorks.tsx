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

const styles = `
  .how-it-works-section {
    padding: 48px 0;
  }
  @media (min-width: 768px) {
    .how-it-works-section {
      padding: 80px 0;
    }
  }

  .how-it-works-title {
    font-size: 1.5rem;
  }
  @media (min-width: 768px) {
    .how-it-works-title {
      font-size: 2rem;
    }
  }
  @media (min-width: 1024px) {
    .how-it-works-title {
      font-size: 2.5rem;
    }
  }

  .step-card {
    gap: 12px !important;
    padding: 24px !important;
  }
  @media (min-width: 768px) {
    .step-card {
      gap: 16px !important;
      padding: 32px !important;
    }
  }

  .step-icon-wrapper {
    width: 56px !important;
    height: 56px !important;
    min-width: 56px !important;
    min-height: 56px !important;
  }
  @media (min-width: 768px) {
    .step-icon-wrapper {
      width: 72px !important;
      height: 72px !important;
      min-width: 72px !important;
      min-height: 72px !important;
    }
  }

  .step-icon-inner {
    width: 28px !important;
    height: 28px !important;
  }
  @media (min-width: 768px) {
    .step-icon-inner {
      width: 36px !important;
      height: 36px !important;
    }
  }

  .step-title {
    font-size: 1rem !important;
  }
  @media (min-width: 768px) {
    .step-title {
      font-size: 1.25rem !important;
    }
  }
`;

export function HowItWorks() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <>
      <style>{styles}</style>
      <Box className="how-it-works-section" style={{ position: 'relative' }}>
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
        <Container size="lg" style={{ position: 'relative' }} px="md">
          <AnimatedSection scale>
            <Stack align="center" gap="sm" mb={40}>
              <div className="section-label">
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: 'var(--az-teal)',
                    boxShadow: '0 0 6px var(--az-teal)',
                  }}
                />
                {t('howItWorks.title')}
              </div>
              <Title
                order={2}
                ta="center"
                fw={800}
                className="how-it-works-title"
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
                    style={{ height: '100%' }}
                  >
                    <Stack
                      align="center"
                      gap="md"
                      className={`glass-card card-shimmer step-card ${i < steps.length - 1 ? 'step-connector' : ''}`}
                      style={{
                        borderRadius: 'var(--mantine-radius-xl)',
                        position: 'relative',
                        height: '100%',
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
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: i * 0.4,
                        }}
                      >
                        <ThemeIcon
                          size={72}
                          radius="xl"
                          variant="light"
                          color={step.color}
                          className="step-icon-wrapper"
                          style={{ boxShadow: '0 6px 20px rgba(45,212,168,0.12)' }}
                        >
                          <step.icon size={36} className="step-icon-inner" />
                        </ThemeIcon>
                      </motion.div>

                      <Text
                        fw={700}
                        ta="center"
                        className="step-title"
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
    </>
  );
}