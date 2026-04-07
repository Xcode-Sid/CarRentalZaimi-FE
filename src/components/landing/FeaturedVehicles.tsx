import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  Button,
  Box,
  useMantineColorScheme,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vehicles } from '../../data/vehicles';
import { VehicleCard } from '../common/VehicleCard';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

export function FeaturedVehicles() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const featured = vehicles.slice(0, 4);

  return (
    <Box py={80} style={{ position: 'relative' }}>
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
            <div className="section-label">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--az-teal)', boxShadow: '0 0 8px var(--az-teal)' }} />
              {t('featured.label')}
            </div>
            <Title order={2} ta="center" fw={800} style={!isDark ? { color: '#1a1b1e' } : undefined}>
              {t('featured.title')}
            </Title>
            <Text
              ta="center"
              maw={500}
              c={isDark ? 'dimmed' : undefined}
              style={!isDark ? { color: '#868e96' } : undefined}
            >
              {t('featured.subtitle')}
            </Text>
          </Stack>
        </AnimatedSection>

        <StaggerContainer stagger={0.12}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {featured.map((vehicle, i) => (
              <StaggerItem key={vehicle.carId} scale>
                <VehicleCard vehicle={vehicle} index={i} />
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>

        <AnimatedSection delay={0.3}>
          <Stack align="center" mt={40}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                color="teal"
                size="lg"
                rightSection={<IconArrowRight size={18} />}
                onClick={() => navigate('/fleet')}
                className="btn-glow"
                radius="xl"
              >
                {t('featured.viewAll')}
              </Button>
            </motion.div>
          </Stack>
        </AnimatedSection>
      </Container>
    </Box>
  );
}
