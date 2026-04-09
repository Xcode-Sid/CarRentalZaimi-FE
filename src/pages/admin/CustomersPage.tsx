import { useState, useMemo } from 'react';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEye, IconPencil, IconCalendar, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { users, type User } from '../../data/users';
import { ads } from '../../data/ads';
import { useBookings } from '../../contexts/BookingsContext';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import { BookingDetailContent, bookingStatusKeys } from '../../components/booking/BookingDetailContent';
import { vehicles } from '../../data/vehicles';
import type { Booking } from '../../data/bookings';

const statusColors: Record<string, string> = {
  accepted: 'green',
  refused: 'red',
  finished: 'gray',
};

export default function CustomersPage() {
  const { t } = useTranslation();
  const { getUserBookings } = useBookings();

  const customerUsers = useMemo(() => users.filter((u) => u.role?.normalizedName?.toLowerCase() === 'user'), []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | null>(null);

  const [adsOpen, setAdsOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [bookingsFor, setBookingsFor] = useState<User | null>(null);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

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
      phone: u.phoneNumber,
      customerStatus: u.customerStatus ?? 'active',
    });
    setEditUser(u);
  };

  const handleSaveEdit = () => {
    setEditUser(null);
    editForm.reset();
  };

  const detailVehicle = detailBooking ? vehicles.find((v) => v.id === detailBooking.vehicleId) : undefined;

  const filteredUsers = customerUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${u.firstName} ${u.lastName} ${u.email} ${u.phoneNumber ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (statusFilter) {
      const st = (u.customerStatus ?? 'active') as 'active' | 'inactive';
      if (st !== statusFilter) return false;
    }
    return true;
  });

  return (
    <Stack gap="xl" className="animate-fade-in">
      <Title order={2} fw={700}>
        {t('admin.manageCustomers')}
      </Title>

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
          onClick={() => {
            setSearch('');
            setStatusFilter(null);
          }}
        >
          {t('admin.filtersReset')}
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={700}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('admin.customerId')}</Table.Th>
              <Table.Th>{t('admin.fullName')}</Table.Th>
              <Table.Th>{t('admin.email')}</Table.Th>
              <Table.Th>{t('admin.phone')}</Table.Th>
              <Table.Th>{t('admin.totalBookings')}</Table.Th>
              <Table.Th>{t('admin.customerStatus')}</Table.Th>
              <Table.Th>{t('admin.carActions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredUsers.map((c) => {
              const count = getUserBookings(c.id).length;
              const st = c.customerStatus ?? 'active';
              return (
                <Table.Tr key={c.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>{c.id}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl" color="teal">
                        {c.avatar}
                      </Avatar>
                      <Text size="sm">{c.firstName} {c.lastName}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{c.email}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{c.phoneNumber}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge circle variant="light" color="teal">
                      {count}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={st === 'active' ? 'green' : 'gray'}
                      variant="light"
                      size="sm"
                    >
                      {st === 'active' ? t('admin.active') : t('admin.inactive')}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label={t('admin.viewAds')}>
                        <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => setAdsOpen(true)} aria-label={t('admin.viewAds')}>
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t('admin.editCustomer')}>
                        <ActionIcon variant="subtle" color="teal" size="sm" onClick={() => openEdit(c)} aria-label={t('admin.editCustomer')}>
                          <IconPencil size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t('admin.userBookings')}>
                        <ActionIcon variant="subtle" color="grape" size="sm" onClick={() => setBookingsFor(c)} aria-label={t('admin.userBookings')}>
                          <IconCalendar size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Modal opened={adsOpen} onClose={() => setAdsOpen(false)} title={t('admin.userAdsModalTitle')} size="lg" radius="md">
        <Text size="sm" c="dimmed" mb="md">
          {t('admin.userAdsModalSubtitle')}
        </Text>
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

      <Modal opened={!!editUser} onClose={() => setEditUser(null)} title={t('admin.editCustomer')} radius="md">
        <form
          onSubmit={editForm.onSubmit(() => handleSaveEdit())}
        >
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

      <Modal
        opened={!!bookingsFor}
        onClose={() => { setBookingsFor(null); setDetailBooking(null); }}
        title={bookingsFor ? `${t('admin.userBookings')} — ${bookingsFor.firstName} ${bookingsFor.lastName}` : ''}
        size="lg"
      >
        {bookingsFor && (
          <>
            {getUserBookings(bookingsFor.id).length === 0 ? (
              <Text c="dimmed" size="sm">{t('admin.noBookingsForCustomer')}</Text>
            ) : (
              <Table.ScrollContainer minWidth={500}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>{t('admin.bookingIdColumn')}</Table.Th>
                      <Table.Th>{t('admin.vehicle')}</Table.Th>
                      <Table.Th>{t('admin.dates')}</Table.Th>
                      <Table.Th>{t('admin.total')}</Table.Th>
                      <Table.Th>{t('admin.status')}</Table.Th>
                      <Table.Th>{t('admin.carActions')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {getUserBookings(bookingsFor.id).map((b) => (
                      <Table.Tr key={b.id}>
                        <Table.Td><Text size="sm" ff="monospace">{b.ref}</Text></Table.Td>
                        <Table.Td>{b.vehicleName}</Table.Td>
                        <Table.Td><Text size="xs">{formatBookingPeriod(b, t)}</Text></Table.Td>
                        <Table.Td>€{b.total.toLocaleString()}</Table.Td>
                        <Table.Td>
                          <Badge color={statusColors[b.status]} variant="light" size="sm">{t(bookingStatusKeys[b.status])}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <ActionIcon variant="subtle" color="teal" size="sm" onClick={() => setDetailBooking(b)} aria-label={t('admin.viewBookingDetails')}>
                            <IconEye size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </>
        )}
      </Modal>

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
                vehicleImageUrl={detailVehicle?.image ?? undefined}
                footer={
                  <Button variant="light" color="gray" onClick={() => setDetailBooking(null)} radius="xl" fullWidth mt="md">
                    {t('account.closeModal')}
                  </Button>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </Stack>
  );
}
