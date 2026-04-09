import { useState, useEffect, useCallback } from 'react';
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
  Pagination,
  Loader,
  Center,
} from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { displayNameForUserId } from '../../utils/userDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';

import { users } from '../../data/users';
import { useDebouncedValue } from '@mantine/hooks';
import { get, put } from '../../utils/api.utils';
import { toImagePath } from '../../utils/general';
import { mapApiBooking, type Booking, type BookingStatus } from '../../data/bookings';

const statusColors: Record<string, string> = {
  accepted: 'green',
  refused: 'red',
  finished: 'gray',
};




interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNr: number;
  pageSize: number;
}

export default function AdminBookingsPage() {
  const { t } = useTranslation();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNr, setPageNr] = useState(1);
  const pageSize = 10;

  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'cash' | 'card' | null>(null);
  const liveBooking = selected ? bookings.find((b) => b.id === selected.id) ?? selected : null;

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('pageNr', String(pageNr));
      params.set('pageSize', String(pageSize));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentType', paymentFilter);

      const response = await get(`Booking/getAll?${params.toString()}`);
      if (response.success) {
        const paged: PagedResponse<any> = response.data;
        setBookings(paged.items.map(mapApiBooking));  // ← map each raw DTO
        setTotalCount(paged.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      notifications.show({
        message: t('admin.bookingsLoadFailed'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [pageNr, debouncedSearch, statusFilter, paymentFilter, t]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPageNr(1);
  }, [debouncedSearch, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      const response = await put(`Booking/updateStatus/${id}`, { status });
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
        if (selected?.id === id) {
          setSelected((prev) => prev ? { ...prev, status } : prev);
        }
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
      notifications.show({
        message: t('admin.statusUpdateFailed'),
        color: 'red',
      });
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter(null);
    setPaymentFilter(null);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

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
          onChange={(v) => setStatusFilter((v as BookingStatus | null) ?? null)}
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
        <Button variant="subtle" color="gray" onClick={handleReset}>
          {t('admin.filtersReset')}
        </Button>
      </Group>

      {loading ? (
        <Center py="xl">
          <Loader color="teal" />
        </Center>
      ) : (
        <>
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
                {bookings.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{b.ref}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar
                          color="teal"
                          radius="xl"
                          size="sm"
                          src={b.user.image ? toImagePath(b.user.image.imageData) : undefined}
                        >
                          {!b.user.image?.imageData &&
                            `${b.user.firstName?.[0] ?? ''}${b.user.lastName?.[0] ?? ''}`}
                        </Avatar>
                        <Text size="sm">{`${b.user.firstName} ${b.user.lastName}`}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{b.vehicleName}</Table.Td>
                    <Table.Td>
                      <Badge variant="outline" size="sm">
                        {b.paymentMethod === 'cash' ? t('admin.paymentCash') : t('admin.paymentCard')}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {/* <Text size="sm">{formatBookingPeriod(b, t)}</Text> */}
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

          {totalPages > 1 && (
            <Group justify="center">
              <Pagination
                total={totalPages}
                value={pageNr}
                onChange={setPageNr}
                color="teal"
              />
            </Group>
          )}
        </>
      )}

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
                vehicleImageUrl={liveBooking.vehicleIamge}
                headerStatusSlot={null}
                footer={
                  <Stack gap="md" mt="xl">
                    <Select
                      label={t('admin.status')}
                      value={liveBooking.status}
                      onChange={(v) => v && updateBookingStatus(liveBooking.id, v as BookingStatus)}
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