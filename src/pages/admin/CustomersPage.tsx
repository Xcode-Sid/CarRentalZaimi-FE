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
  SimpleGrid,
  Image,
  Paper,
  Tooltip,
  TextInput,
  Select,
  Loader,
  Center,
  Pagination,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEye, IconPencil, IconCalendar, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ads } from '../../data/ads';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';
import { type User } from '../../data/users';
import { mapApiBooking, type Booking } from '../../data/bookings';
import { get } from '../../utils/api.utils';
import { toImagePath } from '../../utils/general';

const PAGE_SIZE = 10;

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
  const [adsOpen, setAdsOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
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

  const openEdit = (u: User) => {
    editForm.setValues({
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phoneNumber ?? '',
      customerStatus: u.customerStatus ?? 'active',
    });
    setEditUser(u);
  };

  const handleSaveEdit = () => {
    // TODO: call PUT/PATCH API endpoint here
    setEditUser(null);
    editForm.reset();
    fetchCustomers();
  };

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
          <Table.ScrollContainer minWidth={700}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('admin.customerId')}</Table.Th>
                  <Table.Th>{t('admin.fullName')}</Table.Th>
                  <Table.Th>{t('admin.email')}</Table.Th>
                  <Table.Th>{t('admin.phone')}</Table.Th>
                  <Table.Th>{t('admin.customerStatus')}</Table.Th>
                  <Table.Th>{t('admin.carActions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {customers.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text c="dimmed" size="sm" ta="center" py="md">
                        {t('admin.noCustomersFound')}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  customers.map((c) => {
                    const st = c.customerStatus ?? 'active';
                    const initials = `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase();
                    return (
                      <Table.Tr key={c.id}>
                        <Table.Td>
                          <Text size="sm" fw={500}>{c.id}</Text>
                        </Table.Td>
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
                            <Text size="sm">{c.firstName} {c.lastName}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td><Text size="sm">{c.email}</Text></Table.Td>
                        <Table.Td><Text size="sm">{c.phoneNumber ?? '—'}</Text></Table.Td>
                        <Table.Td>
                          <Badge color={st === 'active' ? 'green' : 'gray'} variant="light" size="sm">
                            {st === 'active' ? t('admin.active') : t('admin.inactive')}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <Tooltip label={t('admin.viewAds')}>
                              <ActionIcon
                                variant="subtle" color="blue" size="sm"
                                onClick={() => setAdsOpen(true)}
                                aria-label={t('admin.viewAds')}
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t('admin.editCustomer')}>
                              <ActionIcon
                                variant="subtle" color="teal" size="sm"
                                onClick={() => openEdit(c)}
                                aria-label={t('admin.editCustomer')}
                              >
                                <IconPencil size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t('admin.userBookings')}>
                              <ActionIcon
                                variant="subtle" color="grape" size="sm"
                                onClick={() => openBookings(c)}
                                aria-label={t('admin.userBookings')}
                              >
                                <IconCalendar size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

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

      {/* ── Ads Modal ── */}
      <Modal opened={adsOpen} onClose={() => setAdsOpen(false)} title={t('admin.userAdsModalTitle')} size="lg" radius="md">
        <Text size="sm" c="dimmed" mb="md">{t('admin.userAdsModalSubtitle')}</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {ads.map((ad) => (
            <Paper key={ad.id} p="sm" radius="md" withBorder>
              <Image src={ad.imageUrl} h={120} radius="sm" fit="cover" alt="" />
              <Text fw={600} mt="sm" size="sm">{ad.title}</Text>
              <Badge size="xs" mt={4} color={ad.isActive ? 'teal' : 'gray'}>
                {ad.isActive ? t('admin.adActive') : t('admin.unavailable')}
              </Badge>
            </Paper>
          ))}
        </SimpleGrid>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal opened={!!editUser} onClose={() => setEditUser(null)} title={t('admin.editCustomer')} radius="md">
        <form onSubmit={editForm.onSubmit(() => handleSaveEdit())}>
          <Stack gap="sm">
            <TextInput label={t('account.firstName')} {...editForm.getInputProps('firstName')} />
            <TextInput label={t('account.lastName')} {...editForm.getInputProps('lastName')} />
            <TextInput label={t('admin.email')} {...editForm.getInputProps('email')} />
            <TextInput label={t('admin.phone')} {...editForm.getInputProps('phone')} />
            <Select
              label={t('admin.customerStatus')}
              data={[
                { value: 'active', label: t('admin.active') },
                { value: 'inactive', label: t('admin.inactive') },
              ]}
              {...editForm.getInputProps('customerStatus')}
            />
            <Button type="submit" color="teal">{t('common.save')}</Button>
          </Stack>
        </form>
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
              <BookingDetailContent
                booking={detailBooking}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </Stack>
  );
}