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
  Alert,
  Box,
  ThemeIcon,
  Paper,
} from '@mantine/core';
import { IconEye, IconCheck, IconX, IconLock, IconInfoCircle, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';
import { useDebouncedValue } from '@mantine/hooks';
import { PAGE_SIZE } from '../../constants/pagination';
import { get, put } from '../../utils/api.utils';
import { toImagePath } from '../../utils/general';
import { mapApiBooking, type Booking, type BookingStatus } from '../../data/bookings';

const statusColors: Record<string, string> = {
  accepted: 'orange',
  refused: 'red',
  done: 'teal',
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

  const [closeTarget, setCloseTarget] = useState<Booking | null>(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('pageNr', String(pageNr));
      params.set('pageSize', String(PAGE_SIZE));
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (paymentFilter) params.set('paymentType', paymentFilter);

      const response = await get(`Booking/getAll?${params.toString()}`);
      console.log("b",response.data)
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

  const closeBooking = async () => {
    if (!closeTarget) return;
    setCloseLoading(true);
    try {
      const response = await put(`Booking/close/${closeTarget.id}`, {});
      if (response.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === closeTarget.id ? { ...b, status: 'done' as BookingStatus } : b))
        );
        if (selected?.id === closeTarget.id)
          setSelected((prev) => (prev ? { ...prev, status: 'done' as BookingStatus } : prev));
        notifications.show({ message: t('admin.bookingClosed'), color: 'teal' });
        setCloseTarget(null);
      } else {
        notifications.show({ message: response.errors, color: 'red' });
      }
    } catch (err: any) {
      notifications.show({ message: err, color: 'red' });
    } finally {
      setCloseLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter(null);
    setPaymentFilter(null);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
            { value: 'done', label: t('account.finished') },
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
          <Paper radius="lg" withBorder style={{ overflow: 'hidden', borderColor: 'var(--mantine-color-default-border)' }}>
            <Table.ScrollContainer minWidth={1000}>
              <Table
                highlightOnHover
                styles={{
                  thead: {
                    background: 'var(--mantine-color-default-hover)',
                    borderBottom: '0.5px solid var(--mantine-color-default-border)',
                  },
                  th: { fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--mantine-color-dimmed)', padding: '8px 12px' },
                  td: { padding: '8px 12px' },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={36}>#</Table.Th>
                    <Table.Th>{t('admin.bookingIdColumn')}</Table.Th>
                    <Table.Th>{t('admin.customer')}</Table.Th>
                    <Table.Th>{t('admin.vehicle')}</Table.Th>
                    <Table.Th>{t('admin.paymentMethod')}</Table.Th>
                    <Table.Th>{t('admin.dates')}</Table.Th>
                    <Table.Th>{t('admin.total')}</Table.Th>
                    <Table.Th>{t('admin.status')}</Table.Th>
                    <Table.Th>{t('admin.refusedBy')}</Table.Th>
                    <Table.Th w={100}>{t('admin.carActions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {bookings.map((b, idx) => (
                    <Table.Tr key={b.id}>

                      <Table.Td>
                        <Text size="xs" c="dimmed" fw={500} ff="monospace">
                          {String(idx + 1).padStart(3, '0')}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" fw={500} ff="monospace" c="dimmed">{b.ref}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Group gap={7} wrap="nowrap">
                          <Avatar color="teal" radius="xl" size={26} src={b.user.image ? toImagePath(b.user.image.imageData) : undefined}>
                            {!b.user.image?.imageData && `${b.user.firstName?.[0] ?? ''}${b.user.lastName?.[0] ?? ''}`}
                          </Avatar>
                          <Text size="sm">{`${b.user.firstName} ${b.user.lastName}`}</Text>
                        </Group>
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" c="dimmed">{b.vehicleName}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge variant={b.paymentMethod === 'cash' ? 'outline' : 'light'} color={b.paymentMethod === 'cash' ? 'gray' : 'blue'} size="sm" radius="sm">
                          {b.paymentMethod === 'cash' ? t('admin.paymentCash') : t('admin.paymentCard')}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" c="dimmed">{formatBookingPeriod(b, t)}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Text size="sm" fw={600}>€{b.total.toLocaleString()}</Text>
                      </Table.Td>

                      <Table.Td>
                        <Badge color={statusColors[b.status]} variant="light" size="sm" radius="sm">
                          {t(bookingStatusKeys[b.status])}
                        </Badge>
                      </Table.Td>

                      <Table.Td>
                        {b.refuzedBy ? (
                          <Badge color={b.refuzedBy === 'Admin' ? 'red' : 'blue'} variant="light" size="sm" radius="sm"
                            style={{ fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {b.refuzedBy}
                          </Badge>
                        ) : (
                          <Text size="xs" c="dimmed">—</Text>
                        )}
                      </Table.Td>

                      <Table.Td>
                        <Group gap={3} wrap="nowrap">
                          <Tooltip label={t('admin.viewBookingDetails')} withArrow position="top" fz="xs">
                            <ActionIcon variant="subtle" color="teal" size="sm" radius="md" onClick={() => setSelected(b)}>
                              <IconEye size={13} />
                            </ActionIcon>
                          </Tooltip>
                          {b.status === 'accepted' && (
                            <>
                              <Tooltip label={t('admin.acceptBooking')} withArrow position="top" fz="xs">
                                <ActionIcon variant="subtle" color="green" size="sm" radius="md" onClick={() => setAcceptTarget(b)}>
                                  <IconCheck size={13} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label={t('admin.refuseBooking')} withArrow position="top" fz="xs">
                                <ActionIcon variant="subtle" color="red" size="sm" radius="md" onClick={() => setRefuseTarget(b)}>
                                  <IconX size={13} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label={t('admin.closeBooking')} withArrow position="top" fz="xs">
                                <ActionIcon variant="subtle" color="gray" size="sm" radius="md" onClick={() => setCloseTarget(b)}>
                                  <IconLock size={13} />
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
          </Paper>

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
        withCloseButton={false}
        radius="xl"
        size="sm"
        padding={0}
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
      >
        {/* Header */}
        <Box
          px="xl" pt="xl" pb="md"
          style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon size={32} radius="xl" color="orange" variant="light">
                <IconCircleCheck size={16} stroke={2.5} />
              </ThemeIcon>
              <Text fw={500} size="sm">{t('admin.acceptBookingTitle')}</Text>
            </Group>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setAcceptTarget(null)}>
              <IconX size={13} stroke={2.5} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Body */}
        <Box px="xl" pt="md" pb="sm">
          <Text size="sm" c="dimmed" lh={1.6} mb="md">
            {t('admin.acceptBookingConfirmMessage', { ref: acceptTarget?.ref })}
          </Text>
          <Alert
            icon={<IconInfoCircle size={14} />}
            color="orange"
            variant="light"
            radius="md"
            styles={{ message: { fontSize: 12.5 } }}
          >
            {t('admin.acceptBookingSlotNotice')}
          </Alert>
        </Box>

        {/* Footer */}
        <Group px="xl" pb="xl" pt="sm" justify="flex-end" gap="xs">
          <Button variant="subtle" color="gray" size="sm" onClick={() => setAcceptTarget(null)}>
            {t('account.closeModal')}
          </Button>
          <Button
            color="orange"
            variant="light"
            size="sm"
            loading={acceptLoading}
            leftSection={<IconCircleCheck size={13} stroke={2.5} />}
            onClick={acceptBooking}
          >
            {t('admin.confirmAccept')}
          </Button>
        </Group>
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

      <Modal
        opened={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        withCloseButton={false}
        radius="xl"
        size="sm"
        padding={0}
        overlayProps={{ backgroundOpacity: 0.45, blur: 3 }}
      >
        {/* Header */}
        <Box
          px="xl" pt="xl" pb="md"
          style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}
        >
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon size={32} radius="xl" color="green" variant="light">
                <IconCheck size={16} stroke={2.5} />
              </ThemeIcon>
              <Text fw={500} size="sm">{t('admin.closeBookingTitle')}</Text>
            </Group>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setCloseTarget(null)}>
              <IconX size={13} stroke={2.5} />
            </ActionIcon>
          </Group>
        </Box>

        {/* Body */}
        <Box px="xl" pt="md" pb="sm">
          <Text size="sm" c="dimmed" lh={1.6} mb="md">
            {t('admin.closeBookingConfirmMessage', { ref: closeTarget?.ref })}
          </Text>
          <Alert
            icon={<IconCheck size={14} />}
            color="green"
            variant="light"
            radius="md"
            styles={{ message: { fontSize: 12.5 } }}
          >
            {t('admin.closeBookingArchiveNotice')}
          </Alert>
        </Box>

        {/* Footer */}
        <Group px="xl" pb="xl" pt="sm" justify="flex-end" gap="xs">
          <Button variant="subtle" color="gray" size="sm" onClick={() => setCloseTarget(null)}>
            {t('account.closeModal')}
          </Button>
          <Button
            color="green"
            variant="light"
            size="sm"
            loading={closeLoading}
            leftSection={<IconCheck size={13} stroke={2.5} />}
            onClick={closeBooking}
          >
            {t('admin.confirmClose')}
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
