import { useNavigate } from 'react-router-dom';
import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Box, Divider, useMantineColorScheme } from '@mantine/core';
import { IconDeviceFloppy, IconUsers, IconManualGearbox, IconGasStation, IconStarFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useFavorites } from '../../contexts/FavoritesContext';
import type { Vehicle } from '../../data/vehicles';

const categoryColors: Record<string, string> = {
  Luksoze: 'yellow',
  SUV: 'green',
  Elektrike: 'blue',
  Ekonomike: 'gray',
};

const statusDotClass: Record<string, string> = {
  available: 'status-dot-available',
  maintenance: 'status-dot-maintenance',
  unavailable: 'status-dot-unavailable',
};

interface Props {
  vehicle: Vehicle;
  index?: number;
}

export function VehicleCard({ vehicle, index = 0 }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const carIdNum = Number(vehicle.carId);
  const fav = isFavorite(carIdNum);
  const priceBadgeText = `€${vehicle.pricePerDay}/${t('vehicle.perDay')}`;
  const displayName = vehicle.title || vehicle.carName || '';
  const categoryName = vehicle.categoryName ?? '';
  const firstImage = vehicle.carImages.map((img) => (img as any).data ?? '').filter(Boolean)[0] ?? '';

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        className="glass-card card-gradient-border card-shimmer"
        radius="lg"
        padding={0}
        style={{
          overflow: 'hidden',
          position: 'relative',
          cursor: 'pointer',
          ...(!isDark && {
            background: '#ffffff',
            border: '1px solid #e9ecef',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }),
        }}
        onClick={() => navigate(`/fleet/${vehicle.carId}`)}
      >
        {/* Image section */}
        <Box style={{ position: 'relative' }}>
          <Box className="card-image-zoom">
            <Image
              src={firstImage}
              alt={displayName}
              radius="lg"
              h={220}
              fit="cover"
              fallbackSrc="https://placehold.co/800x400?text=AutoZaimi"
              className="animate-fade-in"
            />
          </Box>

          {/* Floating price badge */}
          <motion.div
            className="price-badge-float"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            {priceBadgeText}
          </motion.div>

          {/* Save to list */}
          <ActionIcon
            variant={fav ? 'filled' : 'default'}
            color={fav ? 'teal' : undefined}
            radius="xl"
            size="lg"
            aria-label={fav ? t('vehicle.removeSavedVehicle') : t('vehicle.saveVehicle')}
            title={fav ? t('vehicle.removeSavedVehicle') : t('vehicle.saveVehicle')}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 4,
              backdropFilter: 'blur(8px)',
              background: fav ? undefined : 'rgba(0,0,0,0.25)',
              border: fav ? undefined : '1px solid rgba(255,255,255,0.12)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(carIdNum);
            }}
          >
            <IconDeviceFloppy size={18} color={fav ? undefined : '#fff'} />
          </ActionIcon>

          {/* Status dot + category badge overlay */}
          <Box style={{ position: 'absolute', top: 12, left: 12, zIndex: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`status-dot ${statusDotClass['available'] || 'status-dot-available'}`} />
            {categoryName && (
              <Badge
                color={categoryColors[categoryName]}
                variant="filled"
                size="sm"
                style={{ backdropFilter: 'blur(4px)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {categoryName}
              </Badge>
            )}
          </Box>

          {/* Rating overlay */}
          <Box style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <IconStarFilled size={13} color="#F5B544" />
            <Text size="xs" fw={700} c="white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
              4.{8 - (index % 3)}
            </Text>
          </Box>
        </Box>

        {/* Card body */}
        <Stack gap="sm" p="md" pt="sm">
          <div>
            <Text
              fw={700}
              size="md"
              lineClamp={1}
              style={!isDark ? { color: '#1a1b1e' } : undefined}
            >
              {displayName}
            </Text>
            <Group gap={6} mt={2}>
              <Text size="xs" c={isDark ? 'dimmed' : undefined} style={!isDark ? { color: '#868e96' } : undefined}>
                {vehicle.year}
              </Text>
            </Group>
          </div>

          <Divider
            style={{ opacity: 0.5 }}
            variant="dashed"
          />

          {/* Spec pills */}
          <Group gap={6} wrap="wrap">
            <Box className="spec-pill" px="xs" py={4}>
              <IconUsers size={14} />
              <Text size="sm">{vehicle.seats}</Text>
            </Box>
            {vehicle.transmissionType && (
              <Box className="spec-pill" px="xs" py={4}>
                <IconManualGearbox size={13} />
                {vehicle.transmissionType}
              </Box>
            )}
            {vehicle.fuelType && (
              <Box className="spec-pill" px="xs" py={4}>
                <IconGasStation size={13} />
                {vehicle.fuelType}
              </Box>
            )}
          </Group>

          <Group grow mt={4}>
            <Button
              variant="outline"
              color="gray"
              size="xs"
              radius="md"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/fleet/${vehicle.carId}`);
              }}
              style={{
                transition: 'all 0.2s',
                ...(!isDark && {
                  borderColor: '#dee2e6',
                  color: '#495057',
                }),
              }}
            >
              {t('account.viewDetails')}
            </Button>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="filled"
                color="teal"
                size="xs"
                radius="md"
                fullWidth
                className="btn-glow ripple-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/fleet/${vehicle.carId}`);
                }}
              >
                {t('vehicle.rentNow')}
              </Button>
            </motion.div>
          </Group>
        </Stack>
      </Card>
    </motion.div>
  );
}