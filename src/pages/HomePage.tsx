import { Text, Box, Title, Stack, Container, Paper, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturedVehicles } from '../components/landing/FeaturedVehicles';
import { HowItWorks } from '../components/landing/HowItWorks';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { AnimatedDivider } from '../components/common/AnimatedDivider';
import { useEffect, useState } from 'react';
import { get } from '../utils/apiUtils';


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
          {allLogos.map((partner, i) => (
            <Paper
              key={`${partner.id}-${i}`}
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
                style={{ backgroundColor: `${partner.color}20`, color: partner.color }}
              >
                <Text fw={800} size="xs">{partner.initials}</Text>
              </ThemeIcon>
              <Text
                fw={700}
                size="sm"
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
