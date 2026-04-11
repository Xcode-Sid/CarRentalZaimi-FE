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
  Textarea,
  Pagination,
  Loader,
  Center,
  Tooltip,
} from '@mantine/core';
import { IconEye, IconCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';
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

  const [acceptTarget, setAcceptTarget] = useState<Booking | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);

  const [refuseTarget, setRefuseTarget] = useState<Booking | null>(null);
  const [refuseReason, setRefuseReason] = useState('');
  const [refuseLoading, setRefuseLoading] = useState(false);

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
      console.log('res', response.data)
      if (response.success) {
        const paged: PagedResponse<any> = response.data;
        setBookings(paged.items.map(mapApiBooking));
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

  useEffect(() => {
    setPageNr(1);
  }, [debouncedSearch, statusFilter, paymentFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  const acceptBooking = async () => {
    if (!acceptTarget) return;
    setAcceptLoading(true);
    try {
      const response = await put(`Booking/accept/${acceptTarget.id}`, {});
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === acceptTarget.id ? { ...b, status: 'accepted' as BookingStatus } : b))
        );
        if (selected?.id === acceptTarget.id)
          setSelected((prev) => (prev ? { ...prev, status: 'accepted' as BookingStatus } : prev));
        notifications.show({ message: t('admin.bookingAccepted'), color: 'green' });
        setAcceptTarget(null);
      } else {

        notifications.show({ message: response.errors, color: 'red' });
      }
    } catch (err: any) {
      notifications.show({ message: err, color: 'red' });
    } finally {
      setAcceptLoading(false);
    }
  };

  const refuseBooking = async () => {
    if (!refuseTarget) return;
    setRefuseLoading(true);
    try {
      const response = await put(`Booking/refuse/${refuseTarget.id}`, {
        bookingId: refuseTarget.id,
        refusedReason: refuseReason,
      });
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === refuseTarget.id ? { ...b, status: 'refused' as BookingStatus } : b
          )
        );
        if (selected?.id === refuseTarget.id)
          setSelected((prev) => (prev ? { ...prev, status: 'refused' as BookingStatus } : prev));
        notifications.show({ message: t('admin.bookingRefused'), color: 'orange' });
        setRefuseTarget(null);
        setRefuseReason('');
      }
    } catch {
      notifications.show({ message: t('admin.statusUpdateFailed'), color: 'red' });
    } finally {
      setRefuseLoading(false);
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
                  <Table.Th>{t('admin.refusedBy')}</Table.Th>
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
                      <Text size="sm">{formatBookingPeriod(b, t)}</Text>
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
                      {b.refuzedBy ? (
                        <Badge
                          color={b.refuzedBy === 'Admin' ? 'red' : 'blue'}
                          variant="light"
                          size="md"
                          radius="md"
                          tt="uppercase"
                          style={{ fontWeight: 700, letterSpacing: '0.04em' }}
                        >
                          {b.refuzedBy}
                        </Badge>
                      ) : (
                        <Text size="sm" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} wrap="nowrap">
                        <Tooltip label={t('admin.viewBookingDetails')} withArrow position="top">
                          <ActionIcon
                            variant="subtle"
                            color="teal"
                            size="sm"
                            onClick={() => setSelected(b)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>

                        {b.status === 'accepted' && (
                          <>
                            <Tooltip label={t('admin.acceptBooking')} withArrow position="top">
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                size="sm"
                                onClick={() => setAcceptTarget(b)}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                            </Tooltip>

                            <Tooltip label={t('admin.refuseBooking')} withArrow position="top">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={() => setRefuseTarget(b)}
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </>
                        )}
                      </Group>
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

      {/* Booking Detail Modal */}
      <Modal
        opened={!!liveBooking}
        onClose={() => setSelected(null)}
        title={null}
        size="lg"
        radius="xl"
        padding={0}
        lockScroll={false}
        styles={{
          body: { overflow: 'hidden' },
          content: { overflow: 'hidden' },
        }}
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      {/* Accept Confirmation Modal */}
      <Modal
        opened={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        title={t('admin.acceptBookingTitle')}
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.5, blur: 3 }}
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('admin.acceptBookingConfirmMessage', { ref: acceptTarget?.ref })}
          </Text>
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => setAcceptTarget(null)}
            >
              {t('account.closeModal')}
            </Button>
            <Button
              color="green"
              loading={acceptLoading}
              onClick={acceptBooking}
            >
              {t('admin.confirmAccept')}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Refuse Booking Modal */}
      <Modal
        opened={!!refuseTarget}
        onClose={() => { setRefuseTarget(null); setRefuseReason(''); }}
        title={t('admin.refuseBookingTitle')}
        radius="lg"
        size="sm"
        overlayProps={{ backgroundOpacity: 0.5, blur: 3 }}
      >
        <Stack gap="md">
          <Textarea
            label={t('admin.refuseReason')}
            placeholder={t('admin.refuseReasonPlaceholder')}
            value={refuseReason}
            onChange={(e) => setRefuseReason(e.currentTarget.value)}
            minRows={3}
            autosize
          />
          <Group justify="flex-end">
            <Button
              variant="subtle"
              color="gray"
              onClick={() => { setRefuseTarget(null); setRefuseReason(''); }}
            >
              {t('account.closeModal')}
            </Button>
            <Button
              color="red"
              loading={refuseLoading}
              onClick={refuseBooking}
            >
              {t('admin.confirmRefuse')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}