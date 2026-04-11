import {
  Badge,
  Group,
  Text,
  Stack,
  Box,
  Paper,
  ThemeIcon,
  Image,
  Avatar,
} from '@mantine/core';
import { IconCalendar, IconClock, IconCreditCard, IconShield, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import type { Booking } from '../../data/bookings';

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

const statusGradients: Record<string, string> = {
  accepted: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 40%, #5DCAA5 100%)',
  refused: 'linear-gradient(135deg, #7a1a1a 0%, #A32D2D 50%, #E24B4A 100%)',
  finished: 'linear-gradient(135deg, #2C2C2A 0%, #5F5E5A 50%, #888780 100%)',
};

const statusDotColors: Record<string, string> = {
  accepted: '#9FE1CB',
  refused: '#F7C1C1',
  finished: '#D3D1C7',
};

export function rentalDayCount(start: string, end?: string): number | null {
  if (!end) return null;
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const d = Math.round((e.getTime() - s.getTime()) / 86400000);
  return d >= 1 ? d : 1;
}

function formatDateParts(dateStr: string) {
  if (!dateStr) return { day: '—', monthYear: '', weekday: '' };
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString('sq-AL', { day: 'numeric', month: 'short' }),
    monthYear: d.getFullYear().toString(),
    weekday: d.toLocaleDateString('sq-AL', { weekday: 'short' }),
  };
}

function HeroImage({ imageUrl, name }: { imageUrl?: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <Box style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.18 }}>
        <svg viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 260 }}>
          <rect x="10" y="28" width="200" height="36" rx="10" fill="white" />
          <rect x="38" y="14" width="130" height="26" rx="8" fill="white" />
          <circle cx="48" cy="64" r="14" fill="white" />
          <circle cx="170" cy="64" r="14" fill="white" />
          <rect x="2" y="36" width="12" height="18" rx="4" fill="white" opacity="0.6" />
          <rect x="206" y="36" width="12" height="18" rx="4" fill="white" opacity="0.6" />
          <rect x="44" y="17" width="56" height="20" rx="5" fill="white" opacity="0.3" />
          <rect x="108" y="17" width="56" height="20" rx="5" fill="white" opacity="0.3" />
        </svg>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }}
      onError={() => setFailed(true)}
    />
  );
}

interface Props {
  booking: Booking;
}

export function BookingDetailContent({ booking }: Props) {
  const { t } = useTranslation();
  const days = rentalDayCount(booking.startDate, booking.endDate);
  const gradient = statusGradients[booking.status] ?? statusGradients.accepted;
  const dotColor = statusDotColors[booking.status] ?? statusDotColors.accepted;
  const startParts = formatDateParts(booking.startDate);
  const endParts = booking.endDate ? formatDateParts(booking.endDate) : null;

  const detailRows = [
    {
      icon: <IconCalendar size={14} />,
      label: t('account.rentalType'),
      value: <Text size="sm" fw={500}>{t('account.typeDay')}</Text>,
    },
    days != null && {
      icon: <IconClock size={14} />,
      label: t('rental.duration'),
      value: <Text size="sm" fw={500}>{t('account.rentalDays', { count: days })}</Text>,
    },
    {
      icon: booking.paymentMethod === 'cash' ? <IconMapPin size={14} /> : <IconCreditCard size={14} />,
      label: t('rental.paymentMethod'),
      value: (
        <Badge variant="outline" color="teal" size="sm" radius="xl">
          {booking.paymentMethod === 'cash' ? t('rental.cashPickup') : t('rental.cardPickup')}
        </Badge>
      ),
    },
    {
      icon: <IconShield size={14} />,
      label: t('account.bookingAddons') ?? 'Add-ons',
      value: booking.services?.length ? (
        <Group gap={4} justify="flex-end" wrap="wrap">
          {booking.services.map((s) => (
            <Badge key={s.id} variant="light" color="teal" size="sm" radius="xl">{s.name}</Badge>
          ))}
        </Group>
      ) : (
        <Text size="sm" c="dimmed">{t('account.noAddons')}</Text>
      ),
    },
  ].filter(Boolean) as { icon: ReactNode; label: string; value: ReactNode }[];

  return (
    <Box>
      {/* ── Hero ── */}
      <Box
        style={{
          position: 'relative',
          height: 200,
          background: gradient,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '1.25rem 1.5rem',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.07,
            backgroundImage: `
              repeating-linear-gradient(45deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px),
              repeating-linear-gradient(-45deg,#fff 0px,#fff 1px,transparent 1px,transparent 24px)
            `,
          }}
        />
        <HeroImage imageUrl={booking.vehicleIamge} name={booking.vehicleName} />
        <Box style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <Text
            size="xs"
            fw={500}
            style={{ letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}
          >
            {booking.ref}
          </Text>
          <Text fw={800} style={{ color: '#fff', lineHeight: 1.1, marginBottom: 10, fontSize: 24 }}>
            {booking.vehicleName}
          </Text>
          <Box
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.35)',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Box style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
            <Text size="xs" fw={500} style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {t(bookingStatusKeys[booking.status])}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* ── Body ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }}>
        <Box p="lg" pb={0}>

          {/* Date cards */}
          <Text size="xs" fw={500} mb="xs" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mantine-color-dimmed)' }}>
            {t('account.rentalPeriod')}
          </Text>
          <Group grow gap="sm" mb="lg">
            <Paper radius="md" p="md" withBorder>
              <Text size="xs" fw={500} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} mb={4}>
                {t('rental.startDate') ?? 'Pick up'}
              </Text>
              <Text fw={700} size="lg" lh={1}>{startParts.day}</Text>
              <Text size="xs" c="dimmed" mt={2}>{startParts.monthYear} · {startParts.weekday}</Text>
            </Paper>
            {endParts && (
              <Paper radius="md" p="md" withBorder>
                <Text size="xs" fw={500} c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} mb={4}>
                  {t('rental.endDate') ?? 'Return'}
                </Text>
                <Text fw={700} size="lg" lh={1}>{endParts.day}</Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {endParts.monthYear} · {endParts.weekday}{days != null ? ` · ${days}d` : ''}
                </Text>
              </Paper>
            )}
          </Group>

          {/* Customer card */}
          <Text size="xs" fw={500} mb="xs" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mantine-color-dimmed)' }}>
            {t('admin.customer') ?? 'Customer'}
          </Text>
          <Paper radius="md" p="md" withBorder mb="lg">
            <Group gap="sm">
              <Avatar
                src={booking.user.image?.imageData ? `data:image/jpeg;base64,${booking.user.image.imageData}` : undefined}
                color="teal"
                radius="xl"
                size="md"
              >
                {!booking.user.image?.imageData && `${booking.user.firstName?.[0] ?? ''}${booking.user.lastName?.[0] ?? ''}`}
              </Avatar>
              <Box>
                <Text size="sm" fw={600}>{booking.user.firstName} {booking.user.lastName}</Text>
                {booking.phoneNumber && (
                  <Text size="xs" c="dimmed" mt={2}>{booking.phoneNumber}</Text>
                )}
              </Box>
            </Group>
          </Paper>

          {/* Detail rows */}
          <Text size="xs" fw={500} mb="xs" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--mantine-color-dimmed)' }}>
            {t('admin.bookingDetails') ?? 'Booking details'}
          </Text>
          <Stack gap={0} mb="lg">
            {detailRows.map((row, i) => (
              <Group
                key={i}
                justify="space-between"
                align="center"
                py="xs"
                style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}
              >
                <Group gap="sm">
                  <ThemeIcon size={28} radius="md" variant="light" color="teal" style={{ flexShrink: 0 }}>
                    {row.icon}
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">{row.label}</Text>
                </Group>
                <Box style={{ textAlign: 'right' }}>{row.value}</Box>
              </Group>
            ))}
          </Stack>
        </Box>
      </motion.div>

      {/* ── Total ── */}
   <Group
          justify="space-between"
          align="center"
          px="lg"
          py="md"
          style={{
            borderTop: '0.5px solid var(--mantine-color-default-border)',
            background: 'var(--mantine-color-default)',
          }}
        >
          <Box>
            <Text size="xs" c="dimmed" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {t('account.amount')}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>{t('rental.inclServices') ?? 'Incl. all services'}</Text>
          </Box>
          <Text
            fw={800}
            style={{
              fontSize: 28,
              color: booking.status === 'refused' ? 'var(--mantine-color-dimmed)' : 'var(--mantine-color-teal-6)',
              textDecoration: booking.status === 'refused' ? 'line-through' : undefined,
            }}
          >
            €{booking.total.toLocaleString()}
          </Text>
        </Group>
    </Box>
  );
}