import { useState } from 'react';
import {
  Title,
  Table,
  Badge,
  Group,
  Text,
  Avatar,
  Select,
  Stack,
  Modal,
  Button,
  ActionIcon,
  TextInput,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookings } from '../../contexts/BookingsContext';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { displayNameForUserId } from '../../utils/userDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';
import { vehicles } from '../../data/vehicles';
import { users } from '../../data/users';
import type { Booking } from '../../data/bookings';

const statusColors: Record<string, string> = {
  accepted: 'green',
  refused: 'red',
  finished: 'gray',
};

export default function AdminBookingsPage() {
  const { t } = useTranslation();
  const { bookings, updateBookingStatus } = useBookings();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<typeof bookings[number]['status'] | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'cash' | 'card' | null>(null);

  const liveBooking = selected ? bookings.find((b) => b.id === selected.id) ?? selected : null;
  const selectedVehicle = liveBooking ? vehicles.find((v) => v.id === liveBooking.vehicleId) : undefined;

  const filteredBookings = bookings.filter((b) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const userName = displayNameForUserId(b.userId, t).toLowerCase();
      const hay = `${b.ref} ${b.vehicleName} ${userName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (statusFilter && b.status !== statusFilter) return false;
    if (paymentFilter && b.paymentMethod !== paymentFilter) return false;
    return true;
  });

  return (
    <Stack gap="xl" className="animate-fade-in">
      <Title order={2} fw={700}>
        {t('admin.manageBookings')}
      </Title>

      <Group wrap="wrap" align="end">
        <TextInput
          placeholder={t('admin.filterSearchBookings')}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 260, maxWidth: 420 }}
        />
        <Select
          placeholder={t('admin.status')}
          data={[
            { value: 'accepted', label: t('account.accepted') },
            { value: 'refused', label: t('account.refused') },
            { value: 'finished', label: t('account.finished') },
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter((v as typeof bookings[number]['status'] | null) ?? null)}
          clearable
          w={190}
        />
        <Select
          placeholder={t('admin.paymentMethod')}
          data={[
            { value: 'card', label: t('admin.paymentCard') },
            { value: 'cash', label: t('admin.paymentCash') },
          ]}
          value={paymentFilter}
          onChange={(v) => setPaymentFilter((v as 'cash' | 'card' | null) ?? null)}
          clearable
          w={190}
        />
        <Button
          variant="subtle"
          color="gray"
          onClick={() => {
            setSearch('');
            setStatusFilter(null);
            setPaymentFilter(null);
          }}
        >
          {t('admin.filtersReset')}
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={1000}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('admin.bookingIdColumn')}</Table.Th>
              <Table.Th>{t('admin.customer')}</Table.Th>
              <Table.Th>{t('admin.vehicle')}</Table.Th>
              <Table.Th>{t('admin.paymentMethod')}</Table.Th>
              <Table.Th>{t('admin.dates')}</Table.Th>
              <Table.Th>{t('admin.total')}</Table.Th>
              <Table.Th>{t('admin.status')}</Table.Th>
              <Table.Th>{t('admin.carActions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredBookings.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>{b.ref}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar size="sm" radius="xl" color="teal">
                      {users.find((u) => u.id === b.userId)?.avatar ?? '?'}
                    </Avatar>
                    <Text size="sm">{displayNameForUserId(b.userId, t)}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>{b.vehicleName}</Table.Td>
                <Table.Td>
                  <Badge variant="outline" size="sm">
                    {b.paymentMethod === 'cash' ? t('admin.paymentCash') : t('admin.paymentCard')}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {formatBookingPeriod(b, t)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600}>€{b.total.toLocaleString()}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={statusColors[b.status]} variant="light" size="sm">
                    {t(bookingStatusKeys[b.status])}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="teal"
                    size="sm"
                    aria-label={t('admin.viewBookingDetails')}
                    onClick={() => setSelected(b)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal
        opened={!!liveBooking}
        onClose={() => setSelected(null)}
        title={null}
        size="lg"
        radius="xl"
        padding={0}
        overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
        transitionProps={{ transition: 'pop', duration: 200 }}
        classNames={{ content: 'booking-detail-modal glass-card' }}
      >
        <AnimatePresence mode="wait">
          {liveBooking && (
            <motion.div
              key={liveBooking.id}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <BookingDetailContent
                booking={liveBooking}
                vehicleImageUrl={selectedVehicle?.image ?? undefined}
                headerStatusSlot={null}
                footer={
                  <Stack gap="md" mt="xl">
                    <Select
                      label={t('admin.status')}
                      value={liveBooking.status}
                      onChange={(v) => v && updateBookingStatus(liveBooking.id, v as typeof liveBooking.status)}
                      data={[
                        { value: 'accepted', label: t('account.accepted') },
                        { value: 'refused', label: t('account.refused') },
                        { value: 'finished', label: t('account.finished') },
                      ]}
                    />
                    <Button variant="light" color="gray" onClick={() => setSelected(null)} radius="xl" fullWidth>
                      {t('account.closeModal')}
                    </Button>
                  </Stack>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </Stack>
  );
}
