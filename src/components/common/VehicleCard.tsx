import { useNavigate } from 'react-router-dom';
import { Card, Image, Text, Group, Badge, Button, ActionIcon, Stack, Box, Divider, useMantineColorScheme } from '@mantine/core';
import { IconDeviceFloppy, IconUsers, IconManualGearbox, IconGasStation, IconStarFilled } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext'; // adjust path if needed
import type { Vehicle } from '../../data/vehicles';
import { post } from '../../utils/apiUtils';
import { useEffect, useState } from 'react';
import Spinner from '../spinner/Spinner';
import { createPortal } from 'react-dom';

import { categoryColors, vehicleStatusDotClass as statusDotClass } from '../../constants/colors';

interface Props {
  vehicle: Vehicle;
  index?: number;
}

export function VehicleCard({ vehicle, index = 0 }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { colorScheme } = useMantineColorScheme();
  const { user } = useAuth();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(vehicle.isSaved);
  const isLoggedIn = !!user;
  const isAdmin = user?.role?.name === 'Admin';
  const canSave = isLoggedIn && !isAdmin;

  const priceBadgeText = `€${vehicle.pricePerDay}/${t('vehicle.perDay')}`;
  const displayName = vehicle.title || vehicle.carName || '';
  const categoryName = vehicle.categoryName ?? '';
  const primaryImage =
    vehicle.carImages?.find(img => img.isPrimary)
    ?? vehicle.carImages?.[0]
    ?? null;

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const optimistic = !isSaved;
    setIsSaved(optimistic);
    setLoading(true);
    try {
      const res = await post('SavedCar/save', {
        userId: user?.id ?? null,
        carId: vehicle.carId,
      });

      if (!res.success) {
        setIsSaved(!optimistic); // revert
        notifications.show({ title: t('error'), message: t('failedToUpdateSavedCar'), color: 'red' });
      } else {
        notifications.show({
          title: t('success'),
          message: optimistic ? t('carWasAddedToSaveSollection') : t('carWasRemovedFromSavecollection'),
          color: 'green',
        });
      }
    } catch {
      setIsSaved(!optimistic); // revert
      notifications.show({ message: t('common.somethingWentWrong'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && createPortal(<Spinner visible={loading} />, document.body)}
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
                src={primaryImage.data}
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
            {canSave && (
              <ActionIcon
                variant={isSaved ? 'filled' : 'default'}
                color={isSaved ? 'teal' : undefined}
                radius="xl"
                size="lg"
                aria-label={isSaved ? t('vehicle.removeSavedVehicle') : t('vehicle.saveVehicle')}
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  zIndex: 4,
                  backdropFilter: 'blur(8px)',
                  background: isSaved ? undefined : 'rgba(0,0,0,0.25)',
                  border: isSaved ? undefined : '1px solid rgba(255,255,255,0.12)',
                }}
                onClick={handleSaveToggle}
              >
                <IconDeviceFloppy size={18} color={isSaved ? undefined : '#fff'} />
              </ActionIcon>
            )}
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

            <Divider style={{ opacity: 0.5 }} variant="dashed" />

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
              {user?.role?.name !== 'Admin' && (
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
              )}
            </Group>
          </Stack>
        </Card>
      </motion.div>
    </>
  );
}