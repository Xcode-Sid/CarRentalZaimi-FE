import { Text, Box, Title, Stack, Container, Paper, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturedVehicles } from '../components/landing/FeaturedVehicles';
import { HowItWorks } from '../components/landing/HowItWorks';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { AnimatedDivider } from '../components/common/AnimatedDivider';

const partnerLogos = [
  { name: 'Mercedes-Benz', letter: 'MB', color: '#C0C0C0' },
  { name: 'BMW', letter: 'BMW', color: '#1C69D3' },
  { name: 'Audi', letter: 'Audi', color: '#BB0A30' },
  { name: 'Tesla', letter: 'T', color: '#E31937' },
  { name: 'Volkswagen', letter: 'VW', color: '#003399' },
  { name: 'Toyota', letter: 'TY', color: '#EB0A1E' },
  { name: 'Range Rover', letter: 'RR', color: '#005A2B' },
];

function PartnersLogos() {
  const { t } = useTranslation();
  const allLogos = [...partnerLogos, ...partnerLogos];

  return (
    <Box py={60}>
      <Container size="lg">
        <Stack align="center" gap="lg" mb="xl">
          <Title order={3} fw={700} c="dimmed" ta="center">
            {t('partners.title')}
          </Title>
        </Stack>
      </Container>
      <div className="marquee-container">
        <div className="marquee-track">
          {allLogos.map((logo, i) => (
            <Paper
              key={`${logo.name}-${i}`}
              className="glass-card"
              px="xl"
              py="md"
              radius="lg"
              style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            >
              <ThemeIcon
                size={40}
                radius="xl"
                variant="light"
                style={{ backgroundColor: `${logo.color}20`, color: logo.color }}
              >
                <Text fw={800} size="xs">{logo.letter}</Text>
              </ThemeIcon>
              <Text
                fw={700}
                size="sm"
                style={{ whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                {logo.name}
              </Text>
            </Paper>
          ))}
        </div>
      </div>
    </Box>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedVehicles />
      <AnimatedDivider my={0} />
      <HowItWorks />
      <AnimatedDivider my={0} />
      <PartnersLogos />
      <AnimatedDivider my={0} />
      <TestimonialsCarousel />
    </>
  );
}
