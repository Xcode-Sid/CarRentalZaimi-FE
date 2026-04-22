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
  IconTargetArrow,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';
import { useEffect, useState } from 'react';
import { get } from '../../utils/api.utils';
import Spinner from '../spinner/Spinner';

interface CompanyProfileDto {
  id?: string;
  name?: string;
  logoUrl?: string;
  tagline?: string;
  aboutText?: string;
  missionTitle?: string;
  missionDescription?: string;
  whyChooseUs?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twiterUrl?: string;
  youtubeUrl?: string;
  whatsAppNumber?: string;
  years: number;
  cars: number;
  cities: number;
  clients: number;
}

interface WhyChooseUsItem {
  icon: string;
  title: string;
  description: string;
}

export function AboutSection() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState<CompanyProfileDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUsItem[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get('CompanyProfile/get');
        if (res.success) {
          const data = res.data as CompanyProfileDto;
          setProfile(data);

          const rawWhy = data.whyChooseUs;
          let parsedWhyChooseUs: WhyChooseUsItem[] = [];

          if (Array.isArray(rawWhy)) {
            parsedWhyChooseUs = rawWhy;
          } else if (typeof rawWhy === 'string' && rawWhy.trim().startsWith('[')) {
            try {
              const parsed = JSON.parse(rawWhy);
              if (Array.isArray(parsed)) parsedWhyChooseUs = parsed;
            } catch (e) {
              console.error('JSON.parse failed:', e);
            }
          } else if (typeof rawWhy === 'object' && rawWhy !== null) {
            parsedWhyChooseUs = [rawWhy as unknown as WhyChooseUsItem];
          }

          setWhyChooseUs(parsedWhyChooseUs);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      <Spinner visible={loading} />
      <Box id="about" py={{ base: 48, sm: 80 }} style={{ position: 'relative', scrollMarginTop: 80 }}>
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
        <Container size="lg" px={{ base: 'sm', sm: 'xl' }} style={{ position: 'relative' }}>

          {/* ── Header ── */}
          <AnimatedSection scale>
            <Stack align="center" gap="xs" mb={{ base: 32, sm: 50 }}>
              <Title
                order={2}
                ta="center"
                fw={800}
                style={!isDark ? { color: '#1a1b1e', fontSize: 'clamp(1.4rem, 5vw, 2rem)' } : { fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}
              >
                {t('about.title')} {profile?.name}
              </Title>
              <Text
                ta="center"
                maw={600}
                size="md"
                c={isDark ? 'dimmed' : undefined}
                style={!isDark ? { color: '#868e96' } : undefined}
              >
                {profile?.tagline}
              </Text>
            </Stack>
          </AnimatedSection>

          {/* ── About text + stats ── */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: 'lg', sm: 'xl' }} mb={{ base: 32, sm: 50 }}>
            <AnimatedSection direction="left" delay={0.1}>
              <Stack gap="lg">
                <Text
                  size="sm"
                  style={{
                    lineHeight: 1.8,
                    ...(!isDark && { color: '#868e96' }),
                  }}
                  c={isDark ? 'dimmed' : undefined}
                >
                  {profile?.aboutText}
                </Text>

                {/* Mission card */}
                <Paper
                  className="glass-card"
                  p={{ base: 'md', sm: 'lg' }}
                  radius="lg"
                  style={{
                    ...(!isDark && {
                      background: '#ffffff',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    }),
                  }}
                >
                  <Group gap="md" align="flex-start" wrap="nowrap">
                    <motion.div whileHover={{ rotate: 10 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <ThemeIcon size={44} radius="xl" variant="filled" color="teal" style={{ flexShrink: 0 }}>
                        <IconTargetArrow size={22} />
                      </ThemeIcon>
                    </motion.div>
                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="md" style={!isDark ? { color: '#1a1b1e' } : undefined}>
                        {profile?.missionTitle}
                      </Text>
                      <Text
                        size="sm"
                        c={isDark ? 'dimmed' : undefined}
                        style={!isDark ? { color: '#868e96' } : undefined}
                      >
                        {profile?.missionDescription}
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              </Stack>
            </AnimatedSection>

            {/* Stats grid */}
            <StaggerContainer stagger={0.1}>
              <SimpleGrid cols={2} spacing={{ base: 'sm', sm: 'md' }}>
                {([
                  { key: 'years', value: profile?.years },
                  { key: 'cars', value: profile?.cars },
                  { key: 'cities', value: profile?.cities },
                  { key: 'clients', value: profile?.clients },
                ] as const).map(({ key, value }) => (
                  <StaggerItem key={key} scale>
                    <motion.div whileHover={{ y: -4, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <Paper
                        className="glass-card card-gradient-border"
                        p={{ base: 'md', sm: 'xl' }}
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
                        <Text size="xl" fw={900} c="teal">
                          {value}+
                        </Text>
                        <Text
                          size="xs"
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

          {/* ── Why us ── */}
          <AnimatedSection>
            <Stack align="center" gap="xs" mb="xl">
              <Title
                order={3}
                ta="center"
                fw={700}
                style={!isDark ? { color: '#1a1b1e', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' } : { fontSize: 'clamp(1.2rem, 4vw, 1.6rem)' }}
              >
                {t('about.whyUs')}
              </Title>
            </Stack>
          </AnimatedSection>

          <StaggerContainer stagger={0.1}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 'sm', sm: 'lg' }}>
              {whyChooseUs.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Paper
                    className="glass-card card-shimmer"
                    p={{ base: 'md', sm: 'xl' }}
                    radius="lg"
                    style={{
                      // On mobile: horizontal layout (icon left, text right)
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      ...(!isDark && {
                        background: '#ffffff',
                        border: '1px solid #e9ecef',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                      }),
                    }}
                  >
                    <Text size="2rem" mb={{ base: 'xs', sm: 'md' }}>{item.icon}</Text>
                    <Text fw={700} mb={4} style={!isDark ? { color: '#1a1b1e' } : undefined}>
                      {item.title}
                    </Text>
                    <Text
                      size="sm"
                      c={isDark ? 'dimmed' : undefined}
                      style={!isDark ? { color: '#868e96' } : undefined}
                    >
                      {item.description}
                    </Text>
                  </Paper>
                </motion.div>
              ))}
            </SimpleGrid>
          </StaggerContainer>

        </Container>
      </Box>
    </>
  );
}