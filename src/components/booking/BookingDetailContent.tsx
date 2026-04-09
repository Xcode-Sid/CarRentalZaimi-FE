import {
  Title,
  Badge,
  Group,
  Text,
  Stack,
  Box,
  Divider,
  Paper,
  ThemeIcon,
  Image,
} from '@mantine/core';
import { IconCar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import type { Booking } from '../../data/bookings';
import { formatBookingPeriod } from '../../utils/bookingDisplay';

export const bookingStatusColors: Record<string, string> = {
  accepted: 'teal',
  refused: 'red',
  finished: 'gray',
};

export const bookingStatusKeys: Record<string, string> = {
  accepted: 'account.accepted',
  refused: 'account.refused',
  finished: 'account.finished',
};

export function rentalDayCount(start: string, end?: string): number | null {
  if (!end) return null;
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const d = Math.round((e.getTime() - s.getTime()) / 86400000);
  return d >= 1 ? d : 1;
}

function VehicleHero({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  if (!imageUrl || failed) {
    return (
      <Paper
        p="xl"
        radius="lg"
        className="glass-card"
        style={{ textAlign: 'center', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ThemeIcon size={72} radius="xl" variant="light" color="teal">
          <IconCar size={40} />
        </ThemeIcon>
      </Paper>
    );
  }
  return (
    <Image
      src={imageUrl}
      alt={name}
      h={200}
      radius="lg"
      fit="cover"
      onError={() => setFailed(true)}
      style={{ width: '100%' }}
    />
  );
}

interface Props {
  booking: Booking;
  vehicleImageUrl?: string;
  /** When set, replaces the status badge (`null` hides it). Omit to show default badge. */
  headerStatusSlot?: ReactNode | null;
  /** Renders below the detail stack (e.g. action buttons) */
  footer?: ReactNode;
}

export function BookingDetailContent({ booking, vehicleImageUrl, headerStatusSlot, footer }: Props) {
  const { t } = useTranslation();
  const days = rentalDayCount(booking.startDate, booking.endDate);

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
        <div>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.12em' }}>
            {t('account.bookingDetailsTitle')}
          </Text>
          <Title order={3} fw={800} mt={4}>
            {booking.vehicleName}
          </Title>
          <Text size="sm" c="dimmed" ff="monospace" mt={4}>
            {booking.ref}
          </Text>
        </div>
        {headerStatusSlot !== undefined ? (
          headerStatusSlot
        ) : (
          <Badge
            color={bookingStatusColors[booking.status]}
            variant="light"
            size="lg"
            radius="md"
            tt="uppercase"
            style={{ fontWeight: 700 }}
          >
            {t(bookingStatusKeys[booking.status])}
          </Badge>
        )}
      </Group>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <VehicleHero imageUrl={vehicleImageUrl} name={booking.vehicleName} />
      </motion.div>

      <Stack gap="sm" mt="lg">
        <Divider label={t('account.rentalPeriod')} labelPosition="left" />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('account.rentalType')}
          </Text>
          <Text size="sm" fw={600}>{t('account.typeDay')}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('account.bookingDates')}
          </Text>
          <Text size="sm" fw={600}>
            {formatBookingPeriod(booking, t)}
          </Text>
        </Group>
        {days != null && (
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t('rental.duration')}
            </Text>
            <Text size="sm" fw={600}>
              {t('account.rentalDays', { count: days })}
            </Text>
          </Group>
        )}
        <Divider label={t('rental.paymentMethod')} labelPosition="left" />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('rental.paymentMethod')}
          </Text>
          <Text size="sm" fw={600}>
            {booking.paymentMethod === 'cash' ? t('rental.cashPickup') : t('rental.cardPickup')}
          </Text>
        </Group>
        <Divider label={t('account.amount')} labelPosition="left" />
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            {t('account.amount')}
          </Text>
          <Text
            size="lg"
            fw={800}
            c={booking.status === 'refused' ? 'dimmed' : 'teal'}
            style={{
              textDecoration: booking.status === 'refused' ? 'line-through' : undefined,
            }}
          >
            €{booking.total.toLocaleString()}
          </Text>
        </Group>
        <Divider label={t('account.bookingAddons')} labelPosition="left" />
        {booking.services?.length ? (
          <Stack gap={4}>
            {booking.services.map((s) => (
              <Group key={s.id} justify="space-between">
                <Text size="sm" c="dimmed">{s.name}</Text>
                <Text size="sm" fw={600}>€{s.pricePerDay} / {t('account.typeDay')}</Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">{t('account.noAddons')}</Text>
        )}
      </Stack>
      {footer}
    </Box>
  );
}
