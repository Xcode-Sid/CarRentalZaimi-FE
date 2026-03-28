import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  ThemeIcon,
  Box,
  Paper,
  Group,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconCar,
  IconCoin,
  IconHeadset,
  IconDeviceLaptop,
  IconTargetArrow,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

const reasons = [
  { icon: IconCar, titleKey: 'about.reason1Title', descKey: 'about.reason1Desc', color: 'teal' },
  { icon: IconCoin, titleKey: 'about.reason2Title', descKey: 'about.reason2Desc', color: 'teal' },
  { icon: IconHeadset, titleKey: 'about.reason3Title', descKey: 'about.reason3Desc', color: 'blue' },
  { icon: IconDeviceLaptop, titleKey: 'about.reason4Title', descKey: 'about.reason4Desc', color: 'orange' },
];

export function AboutSection() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Box id="about" py={80} style={{ position: 'relative', scrollMarginTop: 80 }}>
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
      <Container size="lg" style={{ position: 'relative' }}>
        <AnimatedSection scale>
          <Stack align="center" gap="xs" mb={50}>
            <Title order={2} ta="center" fw={800} style={!isDark ? { color: '#1a1b1e' } : undefined}>
              {t('about.title')}
            </Title>
            <Text
              ta="center"
              maw={600}
              size="lg"
              c={isDark ? 'dimmed' : undefined}
              style={!isDark ? { color: '#868e96' } : undefined}
            >
              {t('about.subtitle')}
            </Text>
          </Stack>
        </AnimatedSection>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb={50}>
          <AnimatedSection direction="left" delay={0.1}>
            <Stack gap="lg">
              <Text
                size="md"
                style={{
                  lineHeight: 1.8,
                  ...(!isDark && { color: '#868e96' }),
                }}
                c={isDark ? 'dimmed' : undefined}
              >
                {t('about.description')}
              </Text>

              <Paper
                className="glass-card"
                p="lg"
                radius="lg"
                style={{
                  ...(!isDark && {
                    background: '#ffffff',
                    border: '1px solid #e9ecef',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  }),
                }}
              >
                <Group gap="md" align="flex-start">
                  <motion.div whileHover={{ rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <ThemeIcon size={48} radius="xl" variant="filled" color="teal">
                      <IconTargetArrow size={24} />
                    </ThemeIcon>
                  </motion.div>
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Text fw={700} size="lg" style={!isDark ? { color: '#1a1b1e' } : undefined}>
                      {t('about.mission')}
                    </Text>
                    <Text
                      size="sm"
                      c={isDark ? 'dimmed' : undefined}
                      style={!isDark ? { color: '#868e96' } : undefined}
                    >
                      {t('about.missionText')}
                    </Text>
                  </Stack>
                </Group>
              </Paper>
            </Stack>
          </AnimatedSection>

          {/* Stats grid */}
          <StaggerContainer stagger={0.1}>
            <SimpleGrid cols={2} spacing="md">
              {(['years', 'cars', 'cities', 'clients'] as const).map((key) => (
                <StaggerItem key={key} scale>
                  <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Paper
                      className="glass-card card-gradient-border"
                      p="xl"
                      radius="lg"
                      ta="center"
                      style={{
                        ...(!isDark && {
                          background: '#ffffff',
                          border: '1px solid #e9ecef',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        }),
                      }}
                    >
                      <Text size="2rem" fw={900} c="teal">
                        {t(`about.stats.${key}Value`)}
                      </Text>
                      <Text
                        size="sm"
                        mt={4}
                        c={isDark ? 'dimmed' : undefined}
                        style={!isDark ? { color: '#868e96' } : undefined}
                      >
                        {t(`about.stats.${key}Title`)}
                      </Text>
                    </Paper>
                  </motion.div>
                </StaggerItem>
              ))}
            </SimpleGrid>
          </StaggerContainer>
        </SimpleGrid>

        {/* Why us */}
        <AnimatedSection>
          <Stack align="center" gap="xs" mb="xl">
            <Title order={3} ta="center" fw={700} style={!isDark ? { color: '#1a1b1e' } : undefined}>
              {t('about.whyUs')}
            </Title>
          </Stack>
        </AnimatedSection>

        <StaggerContainer stagger={0.1}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {reasons.map((reason) => (
              <StaggerItem key={reason.titleKey} scale>
                <motion.div whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <Paper
                    className="glass-card card-shimmer"
                    p="xl"
                    radius="lg"
                    ta="center"
                    style={{
                      ...(!isDark && {
                        background: '#ffffff',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      }),
                    }}
                  >
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      style={{ display: 'inline-flex' }}
                    >
                      <ThemeIcon
                        size={56}
                        radius="xl"
                        variant="light"
                        color={reason.color}
                        mx="auto"
                        mb="md"
                      >
                        <reason.icon size={28} />
                      </ThemeIcon>
                    </motion.div>
                    <Text fw={700} mb={4} style={!isDark ? { color: '#1a1b1e' } : undefined}>
                      {t(reason.titleKey)}
                    </Text>
                    <Text
                      size="sm"
                      c={isDark ? 'dimmed' : undefined}
                      style={!isDark ? { color: '#868e96' } : undefined}
                    >
                      {t(reason.descKey)}
                    </Text>
                  </Paper>
                </motion.div>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      </Container>
    </Box>
  );
}
