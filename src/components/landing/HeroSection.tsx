import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  Box,
  Stack,
  Badge,
  SimpleGrid,
  Paper,
  useMantineColorScheme,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconSearch, IconShieldCheck, IconHeadset, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <Box
      ref={heroRef}
      py={{ base: 60, sm: 80, md: 100 }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-start',
        background: isDark ? undefined : '#f8f9fa',
      }}
    >
      {/* Parallax background image */}
      <motion.div
        style={{
          position: 'absolute',
          inset: '-10% 0',
          backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&auto=format)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isDark ? 0.15 : 0.08,
          y: bgY,
        }}
      />

      {/* Gradient overlay */}
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(135deg, rgba(10,17,28,0.97) 0%, rgba(21,32,48,0.88) 50%, rgba(10,17,28,0.97) 100%)'
            : 'linear-gradient(135deg, rgba(248,249,250,0.97) 0%, rgba(255,255,255,0.88) 50%, rgba(248,249,250,0.97) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Floating orbs — hidden in light mode */}
      {isDark && (
        <>
          <motion.div
            style={{
              position: 'absolute', width: 300, height: 300, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45,212,168,0.08) 0%, transparent 70%)',
              top: '10%', left: '10%',
            }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute', width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(45,212,168,0.06) 0%, transparent 70%)',
              bottom: '20%', right: '15%',
            }}
            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      <Container size="lg" style={{ position: 'relative', zIndex: 1 }}>
        <Stack align="center" gap="xl">
          {/* Label */}
          <AnimatedSection delay={0.1}>
            <div className="section-label">
              <motion.span
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--az-teal)', display: 'inline-block' }}
                animate={{ boxShadow: ['0 0 4px var(--az-teal)', '0 0 16px var(--az-teal)', '0 0 4px var(--az-teal)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {t('hero.subtitle')}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2} scale>
            <Title
              ta="center"
              fw={900}
              style={{
                fontSize: 'clamp(2.4rem, 7vw, 5rem)',
                lineHeight: 1.05,
                color: isDark ? undefined : '#1a1b1e',
                letterSpacing: '-0.02em',
              }}
            >
              <Text
                component="span"
                inherit
                c="teal"
              >
                {t('hero.title')}
              </Text>
            </Title>
          </AnimatedSection>

          <AnimatedSection delay={0.35}>
            <Text
              ta="center"
              size="xl"
              maw={600}
              c={isDark ? 'dimmed' : undefined}
              style={!isDark ? { color: '#868e96' } : undefined}
            >
              {t('featured.subtitle')}
            </Text>
          </AnimatedSection>

          {/* Search Card */}
          <AnimatedSection delay={0.45} scale>
            <Box
              className={`${isDark ? 'glass-card' : ''}`}
              p={{ base: 'lg', sm: 'xl' }}
              w="100%"
              maw={720}
              style={{
                borderRadius: 'var(--mantine-radius-xl)',
                boxShadow: isDark
                  ? '0 30px 80px rgba(0,0,0,0.35)'
                  : '0 8px 40px rgba(0,0,0,0.10)',
                border: isDark ? '1px solid rgba(45,212,168,0.1)' : '1px solid #e9ecef',
                background: isDark ? undefined : '#ffffff',
              }}
            >
              <Stack gap="lg">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <DatePickerInput
                    type="range"
                    label={t('hero.pickupDate')}
                    placeholder={`${t('hero.pickupDate')} — ${t('hero.returnDate')}`}
                    value={dateRange}
                    onChange={setDateRange}
                    minDate={new Date().toISOString().split('T')[0]}
                    radius="lg"
                    size="md"
                  />
                </SimpleGrid>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    fullWidth
                    variant="filled"
                    color="teal"
                    leftSection={<IconSearch size={20} />}
                    onClick={() => navigate('/fleet')}
                    className="btn-glow"
                    radius="xl"
                  >
                    {t('hero.searchBtn')}
                  </Button>
                </motion.div>
              </Stack>
            </Box>
          </AnimatedSection>

          {/* Stats counter row */}
          <StaggerContainer stagger={0.15} delay={0.6} style={{ width: '100%', maxWidth: 650 }}>
            <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="md" mt="lg">
              {[
                { target: 500, suffix: '+', label: t('hero.stats.cars'), color: 'teal' },
                { target: 10000, suffix: '+', label: t('hero.stats.clients'), color: 'teal' },
                { target: 50, suffix: '+', label: t('hero.stats.cities'), color: 'green' },
              ].map((stat) => (
                <StaggerItem key={stat.label} scale>
                  <Paper
                    className={`${isDark ? 'glass-card' : ''} card-gradient-border`}
                    p="lg"
                    radius="lg"
                    ta="center"
                    style={{
                      background: isDark ? undefined : '#ffffff',
                      border: isDark ? undefined : '1px solid #e9ecef',
                      boxShadow: isDark ? undefined : '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    <Text style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)' }} fw={900} c={stat.color}>
                      <CountUp target={stat.target} suffix={stat.suffix} />
                    </Text>
                    <Text
                      size="xs"
                      mt={2}
                      tt="uppercase"
                      fw={600}
                      style={{
                        letterSpacing: '0.05em',
                        color: isDark ? undefined : '#868e96',
                      }}
                      c={isDark ? 'dimmed' : undefined}
                    >
                      {stat.label}
                    </Text>
                  </Paper>
                </StaggerItem>
              ))}
            </SimpleGrid>
          </StaggerContainer>

          {/* Trust badges */}
          <StaggerContainer stagger={0.12} delay={0.9}>
            <Group mt="md" justify="center" wrap="wrap" gap="md">
              {[
                { label: t('hero.trust.bestPrice'), icon: IconShieldCheck },
                { label: t('hero.trust.support'), icon: IconHeadset },
                { label: t('hero.trust.verified'), icon: IconCircleCheck },
              ].map((badge) => (
                <StaggerItem key={badge.label}>
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} transition={{ type: 'spring', stiffness: 400 }}>
                    <Badge
                      size="lg"
                      variant="outline"
                      color="gray"
                      leftSection={<badge.icon size={16} style={{ color: '#2DD4A8' }} />}
                      style={{
                        padding: '0.7rem 1.4rem',
                        cursor: 'default',
                        borderColor: 'rgba(45, 212, 168, 0.3)',
                        backgroundColor: 'rgba(45, 212, 168, 0.08)',
                        color: '#fff',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        fontSize: '0.8rem',
                      }}
                    >
                      {badge.label}
                    </Badge>
                  </motion.div>
                </StaggerItem>
              ))}
            </Group>
          </StaggerContainer>
        </Stack>
      </Container>
    </Box>
  );
}
