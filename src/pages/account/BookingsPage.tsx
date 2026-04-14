import { useState, useEffect, useCallback, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  Title,
  Table,
  Badge,
  Group,
  Text,
  Image,
  Stack,
  Box,
  ThemeIcon,
  Modal,
  Button,
  TextInput,
  Textarea,
  Select,
  Loader,
  Center,
  Pagination,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconCalendar, IconCar, IconChevronRight, IconSearch, IconX, IconEye } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { mapApiBooking, type Booking } from '../../data/bookings';
import { PAGE_SIZE } from '../../constants/pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import {
  BookingDetailContent,
  bookingStatusColors,
  bookingStatusKeys,
} from '../../components/booking/BookingDetailContent';
import { get, put } from '../../utils/api.utils';



// ─── Sub-component ─────────────────────────────────────────────────────────────

function VehicleThumb({ imageUrl }: { imageUrl?: string }) {
  const [failed, setFailed] = useState(false);
  if (!imageUrl || failed) {
    return (
      <ThemeIcon size={44} radius="md" variant="light" color="teal">
        <IconCar size={22} />
      </ThemeIcon>
    );
  }
  return (
    <Image
      src={imageUrl}
      w={52}
      h={36}
      radius="md"
      fit="cover"
      onError={() => setFailed(true)}
      style={{
        border: '1px solid color-mix(in srgb, var(--mantine-color-teal-6) 25%, transparent)',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Cancel Confirmation Modal ─────────────────────────────────────────────────

interface CancelModalProps {
  booking: Booking | null;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  loading: boolean;
}

function CancelModal({ booking, onClose, onConfirm, loading }: CancelModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (booking) setReason('');
  }, [booking?.id]);

  const handleConfirm = async () => {
    await onConfirm(reason);
  };

  return (
    <Modal
      opened={!!booking}
      onClose={onClose}
      title={
        <Group gap={8}>
          <ThemeIcon color="red" variant="light" size="sm" radius="xl">
            <IconX size={14} />
          </ThemeIcon>
          <Text fw={700} size="md">
            {t('account.cancelBookingTitle')}
          </Text>
        </Group>
      }
      size="sm"
      radius="xl"
      padding="xl"
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      transitionProps={{ transition: 'pop', duration: 200 }}
      classNames={{ content: 'glass-card' }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('account.cancelBookingConfirmText')}
        </Text>

        {booking && (
          <Box
            p="sm"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              background: 'color-mix(in srgb, var(--mantine-color-red-6) 6%, transparent)',
              border: '1px solid color-mix(in srgb, var(--mantine-color-red-6) 20%, transparent)',
            }}
          >
            <Text size="sm" fw={600} ff="monospace" c="red">
              {booking.ref}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {booking.vehicleName}
            </Text>
          </Box>
        )}

        <Textarea
          label={t('account.cancelReason') ?? 'Reason (optional)'}
          placeholder={t('account.cancelReasonPlaceholder')}
          value={reason}
          onChange={(e) => setReason(e.currentTarget.value)}
          minRows={3}
          radius="md"
          autosize
        />

        <Group grow mt="xs">
          <Button
            variant="light"
            color="gray"
            radius="xl"
            onClick={onClose}
            disabled={loading}
          >
            {t('account.closeModal')}
          </Button>
          <Button
            color="red"
            radius="xl"
            loading={loading}
            onClick={handleConfirm}
            leftSection={<IconX size={16} />}
          >
            {t('account.confirmCancel')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);

  const [selected, setSelected] = useState<Booking | null>(null);
  const liveBooking = selected ? bookings.find((booking) => booking.id === selected.id) ?? selected : null;

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter, paymentFilter]);

  const fetchBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        PageNr: String(page),
        PageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());
      if (statusFilter) params.set('Status', statusFilter);
      if (paymentFilter) params.set('PaymentType', paymentFilter);

      const res = await get(`Booking/getAll?${params.toString()}`);
      if (!res.success) throw new Error(res.message || t('failedToLoadBookings'));

      setBookings((res.data.items ?? []).map(mapApiBooking));
      setTotalPages(res.data.totalPages ?? 1);
      setTotalCount(res.data.totalCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, debouncedSearch, statusFilter, paymentFilter, t]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const openCancelModal = (booking: Booking, e: React.MouseEvent) => {
    e.stopPropagation();
    setCancelTarget(booking);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (!cancelTarget || !user?.id) return;
    setCancelLoading(true);
    try {
      const res = await put(`Booking/cancel/${cancelTarget.id}`, {
        bookingId: cancelTarget.id,
        reason: reason.trim() || null,
      });
      if (!res.success) throw new Error(res.message || 'Failed to cancel booking');
      setCancelTarget(null);
      setSelected(null);
      await fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatusFilter(null);
    setPaymentFilter(null);
    setPage(1);
  };

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Stack gap="lg">
        {/* Header */}
        <AnimatedSection>
          <Stack gap={6}>
            <Group gap={10} align="center">
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                style={{ originY: 0 }}
              >
                <Box
                  style={{
                    width: 4,
                    height: 28,
                    borderRadius: 4,
                    background: 'var(--az-teal)',
                    boxShadow: '0 0 12px rgba(45, 212, 168, 0.35)',
                  }}
                />
              </motion.div>
              <div>
                <Title order={2} fw={800}>
                  {t('account.myBookings')}
                </Title>
                <Text c="dimmed" size="sm" mt={4}>
                  {t('account.rentalCarsSubtitle')}
                </Text>
              </div>
            </Group>
          </Stack>
        </AnimatedSection>

        {/* Filters */}
        <AnimatedSection delay={0.08}>
          <Group wrap="wrap" align="end" mb="sm">
            <TextInput
              placeholder={t('account.filterSearchBookings')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
            />
            <Select
              placeholder={t('account.status')}
              data={[
                { value: 'accepted', label: t('account.accepted') },
                { value: 'refused', label: t('account.refused') },
                { value: 'finished', label: t('account.finished') },
              ]}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v ?? null)}
              clearable
              w={190}
            />
            <Select
              placeholder={t('account.filterPayment')}
              data={[
                { value: 'card', label: t('admin.paymentCard') },
                { value: 'cash', label: t('admin.paymentCash') },
              ]}
              value={paymentFilter}
              onChange={(v) => setPaymentFilter(v ?? null)}
              clearable
              w={190}
            />
            <Button variant="subtle" color="gray" onClick={handleReset}>
              {t('account.filtersReset')}
            </Button>
          </Group>
        </AnimatedSection>

        {/* Content */}
        {loading ? (
          <Center py="xl">
            <Loader color="var(--az-teal)" size="md" />
          </Center>
        ) : error ? (
          <Center py="xl">
            <Text c="red" size="sm">{error}</Text>
          </Center>
        ) : bookings.length > 0 ? (
          <AnimatedSection delay={0.1}>
            <Stack gap="md">
              <Box
                className="glass-card card-gradient-border account-rentals-shell"
                p={{ base: 'md', sm: 'xl' }}
                style={{ borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden' }}
              >
                <Table.ScrollContainer minWidth={760} type="native">
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder
                    withColumnBorders
                    verticalSpacing="md"
                    horizontalSpacing="md"
                    className="account-rentals-table"
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.bookingRef')}
                        </Table.Th>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.vehicleName')}
                        </Table.Th>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.bookingDates')}
                        </Table.Th>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.amount')}
                        </Table.Th>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.status')}
                        </Table.Th>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.refusedBy')}
                        </Table.Th>
                        <Table.Th style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                          {t('account.actions')}
                        </Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {bookings.map((b, i) => {
                        const refused = b.status === 'refused';
                        const isAccepted = b.status === 'accepted';
                        return (
                          <Table.Tr
                            key={b.id}
                            className="account-rental-row animate-stagger-up"
                            style={{ '--stagger-delay': `${i * 0.06}s` } as CSSProperties}
                          >
                            <Table.Td>
                              <Group gap={4} wrap="nowrap">
                                <Text size="sm" fw={600} ff="monospace">
                                  {b.ref}
                                </Text>
                                <IconChevronRight size={14} style={{ opacity: 0.35, flexShrink: 0 }} />
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Group gap="sm" wrap="nowrap">
                                <VehicleThumb imageUrl={b.vehicleIamge} />
                                <Text size="sm" fw={500}>
                                  {b.vehicleName}
                                </Text>
                              </Group>
                            </Table.Td>
                            <Table.Td>
                              <Text size="sm" c="dimmed">
                                {formatBookingPeriod(b, t)}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text
                                size="sm"
                                fw={700}
                                c={refused ? 'dimmed' : 'teal'}
                                style={{
                                  textDecoration: refused ? 'line-through' : undefined,
                                  opacity: refused ? 0.75 : 1,
                                }}
                              >
                                €{b.total.toLocaleString()}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                color={bookingStatusColors[b.status]}
                                variant="light"
                                size="md"
                                radius="md"
                                tt="uppercase"
                                style={{ fontWeight: 700, letterSpacing: '0.04em' }}
                              >
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
                                <Tooltip label={t('account.viewDetails') ?? 'View details'} withArrow position="top">
                                  <ActionIcon
                                    variant="subtle"
                                    color="teal"
                                    size="sm"
                                    onClick={() => setSelected(b)}
                                  >
                                    <IconEye size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                {isAccepted && (
                                  <Tooltip label={t('account.cancel') ?? 'Cancel'} withArrow position="top">
                                    <ActionIcon
                                      variant="subtle"
                                      color="red"
                                      size="sm"
                                      onClick={(e) => openCancelModal(b, e)}
                                    >
                                      <IconX size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </Box>

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="space-between" align="center" px={4}>
                  <Text size="xs" c="dimmed">
                    {t('admin.showing') ?? 'Showing'}{' '}
                    <Text component="span" size="xs" fw={500} c="default">
                      {startItem}–{endItem}
                    </Text>{' '}
                    {t('admin.of') ?? 'of'}{' '}
                    <Text component="span" size="xs" fw={500} c="default">
                      {totalCount}
                    </Text>{' '}
                    {t('account.myBookings') ?? 'bookings'}
                  </Text>
                  <Pagination
                    value={page}
                    onChange={setPage}
                    total={totalPages}
                    color="var(--az-teal)"
                    radius="md"
                    size="sm"
                    withEdges
                  />
                </Group>
              )}
            </Stack>
          </AnimatedSection>
        ) : (
          <AnimatedSection delay={0.1}>
            <EmptyState
              icon={<IconCalendar size={40} />}
              title={t('account.noBookings')}
              actionLabel={t('account.bookNow')}
              actionPath="/fleet"
            />
          </AnimatedSection>
        )}
      </Stack>

      {/* Detail Modal */}
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
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <BookingDetailContent booking={liveBooking} />
              <Group grow p="lg" pt="md">
                <Button variant="light" color="gray" onClick={() => setSelected(null)} radius="xl">
                  {t('account.closeModal')}
                </Button>
                {liveBooking.vehicleId && (
                  <Button
                    component={Link}
                    to={`/fleet/${liveBooking.vehicleId}`}
                    variant="filled"
                    color="teal"
                    radius="xl"
                    rightSection={<IconChevronRight size={18} />}
                    onClick={() => setSelected(null)}
                  >
                    {t('account.viewCar')}
                  </Button>
                )}
              </Group>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <CancelModal
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        loading={cancelLoading}
      />
    </motion.div>
  );
}
