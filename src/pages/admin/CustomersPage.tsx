import { useState, useEffect, useCallback } from 'react';
import {
  Title,
  Table,
  Badge,
  Group,
  Text,
  Avatar,
  ActionIcon,
  Stack,
  Modal,
  Button,
  Paper,
  Tooltip,
  TextInput,
  Select,
  Loader,
  Center,
  Pagination,
  ThemeIcon,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEye, IconCalendar, IconSearch, IconUsers, IconCheck, IconBan } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';
import { type User } from '../../data/users';
import { mapApiBooking, type Booking } from '../../data/bookings';
import { PAGE_SIZE } from '../../constants/pagination';
import { get } from '../../utils/api.utils';
import { toImagePath } from '../../utils/general';


const statusColors: Record<string, string> = {
  accepted: 'green',
  refused: 'red',
  finished: 'gray',
};

export default function CustomersPage() {
  const { t } = useTranslation();

  // ── Customers state ────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Filter state ───────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  // ── Fetch customers ────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        PageNr: String(page),
        PageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());
      if (statusFilter) params.set('Status', statusFilter);

      const res = await get(`User/getAll?${params.toString()}`);
      if (!res.success) throw new Error(res.message || t('admin.failedToLoadUsers'));

      setCustomers(res.data.items);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, t]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  // ── Modal / bookings state ─────────────────────────────────────────────────
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [bookingsFor, setBookingsFor] = useState<User | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  // ── Fetch bookings for selected user ──────────────────────────────────────
  const fetchUserBookings = useCallback(async (userId: string) => {
    setBookingsLoading(true);
    setBookingsError(null);
    setUserBookings([]);
    try {
      const res = await get(`Booking/user/${userId}`);
      if (!res.success) throw new Error(res.message || t('admin.failedToLoadBookings'));
      const mapped: Booking[] = (res.data ?? []).map(mapApiBooking);
      setUserBookings(mapped);
    } catch (err) {
      setBookingsError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setBookingsLoading(false);
    }
  }, [t]);

  const openBookings = (u: User) => {
    setBookingsFor(u);
    fetchUserBookings(u.id);
  };

  // ── Edit form ──────────────────────────────────────────────────────────────
  const editForm = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      customerStatus: 'active' as 'active' | 'inactive',
    },
  });



  return (
    <Stack gap="xl" className="animate-fade-in">
      <Title order={2} fw={700}>
        {t('admin.manageCustomers')}
      </Title>

      {/* ── Filters ── */}
      <Group wrap="wrap" align="end">
        <TextInput
          placeholder={t('admin.filterSearchUsers')}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 240, maxWidth: 360 }}
        />
        <Select
          placeholder={t('admin.customerStatus')}
          data={[
            { value: 'active', label: t('admin.active') },
            { value: 'inactive', label: t('admin.inactive') },
          ]}
          value={statusFilter}
          onChange={(v) => setStatusFilter((v as 'active' | 'inactive' | null) ?? null)}
          clearable
          w={200}
        />
        <Button
          variant="subtle"
          color="gray"
          onClick={() => { setSearch(''); setStatusFilter(null); setPage(1); }}
        >
          {t('admin.filtersReset')}
        </Button>
      </Group>

      {/* ── Table ── */}
      {loading ? (
        <Center py="xl"><Loader color="teal" size="md" /></Center>
      ) : error ? (
        <Center py="xl"><Text c="red" size="sm">{error}</Text></Center>
      ) : (
        <Stack gap="md">
          <Paper
            radius="lg"
            withBorder
            style={{ overflow: "hidden", borderColor: "var(--mantine-color-default-border)" }}
          >
            <Table.ScrollContainer minWidth={700}>
              <Table
                highlightOnHover
                verticalSpacing="sm"
                horizontalSpacing="md"
                styles={{
                  thead: {
                    background: "var(--mantine-color-default-hover)",
                    borderBottom: "0.5px solid var(--mantine-color-default-border)",
                  },
                  th: {
                    fontWeight: 500,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--mantine-color-dimmed)",
                  },
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th w={60}>#</Table.Th>
                    <Table.Th>{t('admin.fullName')}</Table.Th>
                    <Table.Th>{t('admin.email')}</Table.Th>
                    <Table.Th>{t('admin.phone')}</Table.Th>
                    <Table.Th>{t('admin.customerStatus')}</Table.Th>
                    <Table.Th w={90}>{t('admin.carActions')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {/* Skeleton rows while loading */}
                  {loading &&
                    [1, 2, 3, 4].map((i) => (
                      <Table.Tr key={i}>
                        {[60, 20, 25 + i * 5, 30, 20, 15, 10].map((w, j) => (
                          <Table.Td key={j}>
                            <Box
                              style={{
                                height: 12,
                                borderRadius: 6,
                                background: "var(--mantine-color-default-border)",
                                opacity: 0.5,
                                width: `${w}%`,
                                animation: "pulse 1.4s ease-in-out infinite",
                              }}
                            />
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}

                  {/* Empty state */}
                  {!loading && customers.length === 0 && (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Center py="xl">
                          <Stack align="center" gap="xs">
                            <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                              <IconUsers size={18} />
                            </ThemeIcon>
                            <Text size="sm" c="dimmed">
                              {t('admin.noCustomersFound')}
                            </Text>
                          </Stack>
                        </Center>
                      </Table.Td>
                    </Table.Tr>
                  )}

                  {/* Data rows */}
                  {!loading &&
                    customers.map((c, idx) => {
                      const st = c.customerStatus ?? 'active';
                      const initials = `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase();
                      return (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.25, ease: "easeOut" }}
                        >
                          {/* Index */}
                          <Table.Td>
                            <Text size="xs" c="dimmed" fw={500}>
                              #{String(idx + 1).padStart(3, "0")}
                            </Text>
                          </Table.Td>

                          {/* Full Name */}
                          <Table.Td>
                            <Group gap="sm">
                              <Avatar
                                size="sm"
                                radius="xl"
                                color="teal"
                                src={
                                  c.image?.imagePath
                                    ? toImagePath(c.image.imagePath)
                                    : undefined
                                }
                              >
                                {initials}
                              </Avatar>
                              <Text size="sm" fw={500}>
                                {c.firstName} {c.lastName}
                              </Text>
                            </Group>
                          </Table.Td>

                          {/* Email */}
                          <Table.Td>
                            <Text size="sm" c="dimmed">{c.email}</Text>
                          </Table.Td>

                          {/* Phone */}
                          <Table.Td>
                            <Text size="sm" c="dimmed">{c.phoneNumber ?? '—'}</Text>
                          </Table.Td>

                          {/* Status */}
                          <Table.Td>
                            {st === 'active' ? (
                              <Badge
                                color="green"
                                variant="light"
                                size="sm"
                                radius="md"
                                leftSection={<IconCheck size={11} />}
                              >
                                {t('admin.active')}
                              </Badge>
                            ) : (
                              <Badge
                                color="gray"
                                variant="light"
                                size="sm"
                                radius="md"
                                leftSection={<IconBan size={11} />}
                              >
                                {t('admin.inactive')}
                              </Badge>
                            )}
                          </Table.Td>

                          {/* Actions */}
                          <Table.Td>
                            <Group gap={4}>
                              <Tooltip label={t('admin.viewCustomer')} withArrow fz="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="teal"
                                  size="sm"
                                  radius="md"
                                  onClick={() => setViewUser(c)}
                                  aria-label={t('admin.viewCustomer')}
                                >
                                  <IconEye size={15} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label={t('admin.userBookings')} withArrow fz="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="grape"
                                  size="sm"
                                  radius="md"
                                  onClick={() => openBookings(c)}
                                  aria-label={t('admin.userBookings')}
                                >
                                  <IconCalendar size={15} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </motion.tr>
                      );
                    })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>

          {totalPages > 1 && (
            <Group justify="space-between" align="center" px={4}>
              <Text size="xs" c="dimmed">
                {t('admin.showing') ?? 'Showing'}{' '}
                <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>{' '}
                {t('admin.of') ?? 'of'}{' '}
                <Text component="span" size="xs" fw={500}>{totalCount}</Text>{' '}
                {t('admin.customers') ?? 'customers'}
              </Text>
              <Pagination
                value={page}
                onChange={setPage}
                total={totalPages}
                color="teal"
                radius="md"
                size="sm"
                withEdges
              />
            </Group>
          )}
        </Stack>
      )}

      {/* ── User Detail Modal ── */}
      <Modal
        opened={!!viewUser}
        onClose={() => setViewUser(null)}
        title={null}
        size="md"
        radius="xl"
        padding={0}
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.45, blur: 2 }}
      >
        {viewUser && (() => {
          const u = viewUser;
          const st = u.customerStatus ?? 'active';
          const initials = `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
          const fullName = `${u.firstName} ${u.lastName}`;

          return (
            <Stack gap={0}>
              {/* Hero header */}
              <Box
                px="xl"
                pt="xl"
                pb="lg"
                style={{
                  background: 'linear-gradient(135deg, var(--mantine-color-teal-0) 0%, var(--mantine-color-teal-1) 100%)',
                  borderRadius: 'var(--mantine-radius-xl) var(--mantine-radius-xl) 0 0',
                  position: 'relative',
                }}
              >
                {/* Close button */}
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => setViewUser(null)}
                  style={{ position: 'absolute', top: 12, right: 12 }}
                >
                  ✕
                </ActionIcon>

                <Group gap="md" align="flex-start">
                  <Avatar
                    size={64}
                    radius="xl"
                    color="teal"
                    src={u.image?.imagePath ? toImagePath(u.image.imagePath) : undefined}
                    style={{
                      border: '3px solid white',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                    }}
                  >
                    <Text fw={600} size="lg">{initials}</Text>
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Group gap="xs" align="center" mb={4}>
                      <Text fw={700} size="lg" lh={1.2} c={"black"}>{fullName}</Text>
                      <Badge
                        color={st === 'active' ? 'teal' : 'gray'}
                        variant="filled"
                        size="xs"
                        radius="xl"
                      >
                        {st === 'active' ? t('admin.active') : t('admin.inactive')}
                      </Badge>
                    </Group>
                  </div>
                </Group>
              </Box>

              {/* Details grid */}
              <Stack gap={0} px="xl" py="md">
                {[
                  {
                    label: t('admin.email'),
                    value: u.email,
                    icon: '✉',
                  },
                  {
                    label: t('admin.phone'),
                    value: u.phoneNumber ?? '—',
                    icon: '☎',
                  },
                ].map(({ label, value, icon }) => (
                  <Group
                    key={label}
                    justify="space-between"
                    align="center"
                    py="xs"
                    style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}
                  >
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">{icon}</Text>
                      <Text size="sm" c="dimmed">{label}</Text>
                    </Group>
                    <Text size="sm" fw={500}>{value}</Text>
                  </Group>
                ))}

                {/* Booking summary row */}
                <Group
                  justify="space-between"
                  align="center"
                  py="xs"
                >
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">📅</Text>
                    <Text size="sm" c="dimmed">{t('admin.userBookings')}</Text>
                  </Group>
                  <Button
                    variant="light"
                    color="grape"
                    size="xs"
                    radius="md"
                    leftSection={<IconCalendar size={13} />}
                    onClick={() => {
                      setViewUser(null);
                      openBookings(u);
                    }}
                  >
                    {t('admin.viewBookings')}
                  </Button>
                </Group>
              </Stack>

              {/* Footer */}
              <Group
                px="xl"
                py="md"
                justify="flex-end"
                style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}
              >
                <Button
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => setViewUser(null)}
                >
                  {t('account.closeModal')}
                </Button>
              </Group>
            </Stack>
          );
        })()}
      </Modal>

      {/* ── Bookings Modal ── */}
      <Modal
        opened={!!bookingsFor}
        onClose={() => { setBookingsFor(null); setDetailBooking(null); setUserBookings([]); }}
        title={null}
        size="lg"
        radius="xl"
        padding={0}
      >
        {bookingsFor && (
          <Stack gap={0}>
            {/* Header */}
            <Group
              px="xl" py="md"
              justify="space-between"
              style={{ borderBottom: '0.5px solid var(--mantine-color-default-border)' }}
            >
              <Group gap="sm">
                <Avatar
                  size="md"
                  radius="xl"
                  color="teal"
                  src={
                    bookingsFor.image?.imagePath
                      ? toImagePath(bookingsFor.image.imagePath)
                      : undefined
                  }
                >
                  {`${bookingsFor.firstName?.[0] ?? ''}${bookingsFor.lastName?.[0] ?? ''}`.toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={500} size="sm">{bookingsFor.firstName} {bookingsFor.lastName}</Text>
                  <Text size="xs" c="dimmed">
                    {userBookings.length} {t('admin.userBookings').toLowerCase()}
                  </Text>
                </div>
              </Group>
              {userBookings.length > 0 && (
                <Badge variant="light" color="teal" size="sm">
                  {t('admin.total')}: €{userBookings.reduce((s, b) => s + b.total, 0).toLocaleString()}
                </Badge>
              )}
            </Group>

            {/* Body */}
            <Stack gap="xs" px="xl" py="md" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {bookingsLoading ? (
                <Center py="xl"><Loader color="teal" size="sm" /></Center>
              ) : bookingsError ? (
                <Center py="xl"><Text c="red" size="sm">{bookingsError}</Text></Center>
              ) : userBookings.length === 0 ? (
                <Center py="xl">
                  <Text c="dimmed" size="sm">{t('admin.noBookingsForCustomer')}</Text>
                </Center>
              ) : (
                userBookings.map((b) => (
                  <Paper
                    key={b.id}
                    withBorder
                    radius="md"
                    p="sm"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setDetailBooking(b)}
                  >
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      {/* Left: icon + info */}
                      <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        <ThemeIcon
                          size={40}
                          radius="md"
                          variant="light"
                          color={
                            b.status === 'accepted' ? 'teal'
                              : b.status === 'refused' ? 'red'
                                : 'gray'
                          }
                        >
                          <IconCalendar size={18} />
                        </ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>{b.vehicleName}</Text>
                          <Group gap={6} wrap="nowrap">
                            <Text size="xs" c="dimmed">{formatBookingPeriod(b, t)}</Text>
                            <Text size="xs" c="dimmed">·</Text>
                            <Text size="xs" c="dimmed" ff="monospace">{b.ref}</Text>
                          </Group>
                        </div>
                      </Group>

                      {/* Right: price + status + eye */}
                      <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                        <Text size="sm" fw={500}>€{b.total.toLocaleString()}</Text>
                        <Badge
                          size="xs"
                          variant="light"
                          color={statusColors[b.status]}
                        >
                          {t(bookingStatusKeys[b.status])}
                        </Badge>
                        <ActionIcon
                          variant="subtle"
                          color="teal"
                          size="sm"
                          aria-label={t('admin.viewBookingDetails')}
                          onClick={(e) => { e.stopPropagation(); setDetailBooking(b); }}
                        >
                          <IconEye size={15} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Paper>
                ))
              )}
            </Stack>

            {/* Footer */}
            <Group
              px="xl" py="md"
              justify="flex-end"
              style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}
            >
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => { setBookingsFor(null); setDetailBooking(null); setUserBookings([]); }}
              >
                {t('account.closeModal')}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ── Booking Detail Modal ── */}
      <Modal
        opened={!!detailBooking}
        onClose={() => setDetailBooking(null)}
        title={null}
        size="lg"
        radius="xl"
        padding={0}
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <AnimatePresence mode="wait">
          {detailBooking && (
            <motion.div
              key={detailBooking.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <BookingDetailContent booking={detailBooking} />
              <Stack gap="md" px="xl" py="md" style={{ borderTop: '0.5px solid var(--mantine-color-default-border)' }}>
                <Button variant="light" color="gray" onClick={() => setDetailBooking(null)} radius="xl" fullWidth>
                  {t('account.closeModal')}
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </Stack>
  );
}
