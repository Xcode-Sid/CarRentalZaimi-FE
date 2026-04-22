import { Text, Box, Title, Stack, Container, Paper, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturedVehicles } from '../components/landing/FeaturedVehicles';
import { HowItWorks } from '../components/landing/HowItWorks';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { AnimatedDivider } from '../components/common/AnimatedDivider';
import { useEffect, useState } from 'react';
import { get } from '../utils/api.utils';

const styles = `
  .partners-section {
    padding: 40px 0;
  }
  @media (min-width: 768px) {
    .partners-section {
      padding: 60px 0;
    }
  }

  .partners-title {
    font-size: 1rem !important;
    margin-bottom: 16px;
  }
  @media (min-width: 768px) {
    .partners-title {
      font-size: 1.25rem !important;
      margin-bottom: 24px;
    }
  }

  .marquee-container {
    overflow: hidden;
    width: 100%;
    /* Fade edges */
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
    mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
  }

  .marquee-track {
    display: flex;
    gap: 16px;
    width: max-content;
    animation: marquee 28s linear infinite;
    padding: 8px 0;
  }
  @media (min-width: 768px) {
    .marquee-track {
      gap: 24px;
    }
  }

  .marquee-track:hover {
    animation-play-state: paused;
  }

  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .partner-card {
    padding: 10px 16px !important;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  @media (min-width: 768px) {
    .partner-card {
      padding: 12px 24px !important;
      gap: 12px;
    }
  }

  .partner-icon {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    min-height: 32px !important;
  }
  @media (min-width: 768px) {
    .partner-icon {
      width: 40px !important;
      height: 40px !important;
      min-width: 40px !important;
      min-height: 40px !important;
    }
  }

  .partner-name {
    font-size: 0.75rem !important;
  }
  @media (min-width: 768px) {
    .partner-name {
      font-size: 0.875rem !important;
    }
  }
`;

function PartnersLogos() {
  const { t } = useTranslation();
  const [partners, setPartners] = useState<{ id: string; name: string; initials: string; color: string; isActive: boolean }[]>([]);

  useEffect(() => {
    get('Partner/getAll')
      .then((res) => {
        if (res.success) setPartners(res.data.filter((p: any) => p.isActive));
      })
      .catch(console.error);
  }, []);

  const allLogos = [...partners, ...partners];

  if (!allLogos.length) return null;

  return (
    <Box className="partners-section">
      <Container size="lg" px="md">
        <Stack align="center" gap="sm" mb="lg">
          <Title order={3} fw={700} c="dimmed" ta="center" className="partners-title">
            {t('partners.title')}
          </Title>
        </Stack>
      </Container>
      <div className="marquee-container">
        <div className="marquee-track">
          {allLogos.map((partner, i) => (
            <Paper
              key={`${partner.id}-${i}`}
              className="glass-card partner-card"
              radius="lg"
            >
              <ThemeIcon
                size={40}
                radius="xl"
                variant="light"
                className="partner-icon"
                style={{ backgroundColor: `${partner.color}20`, color: partner.color }}
              >
                <Text fw={800} size="xs">{partner.initials}</Text>
              </ThemeIcon>
              <Text
                fw={700}
                className="partner-name"
                style={{ whiteSpace: 'nowrap', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                {partner.name}
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
      <style>{styles}</style>
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