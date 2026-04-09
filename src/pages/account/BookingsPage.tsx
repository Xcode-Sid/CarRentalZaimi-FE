import { useState, type CSSProperties } from 'react';
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
  Select,
} from '@mantine/core';
import { IconCalendar, IconCar, IconChevronRight, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../contexts/BookingsContext';
import type { Booking } from '../../data/bookings';
import { vehicles } from '../../data/vehicles';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { formatBookingPeriod } from '../../utils/bookingDisplay';
import {
  BookingDetailContent,
  bookingStatusColors,
  bookingStatusKeys,
} from '../../components/booking/BookingDetailContent';

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

export default function BookingsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getUserBookings } = useBookings();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Booking['status'] | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<'cash' | 'card' | null>(null);

  const userBookings = user ? getUserBookings(user.id) : [];

  const selectedVehicle = selected ? vehicles.find((v) => v.id === selected.vehicleId) : undefined;

  const filteredBookings = userBookings.filter((b) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${b.ref} ${b.vehicleName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (statusFilter && b.status !== statusFilter) return false;
    if (paymentFilter && b.paymentMethod !== paymentFilter) return false;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Stack gap="lg">
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

        {userBookings.length > 0 ? (
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
                onChange={(v) => setStatusFilter((v as Booking['status'] | null) ?? null)}
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
                {t('account.filtersReset')}
              </Button>
            </Group>

            <Text size="xs" c="dimmed" mb="xs" style={{ letterSpacing: '0.02em' }}>
              {t('account.clickRowForDetails')}
            </Text>
            <Box
              className="glass-card card-gradient-border account-rentals-shell"
              p={{ base: 'md', sm: 'xl' }}
              style={{ borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden' }}
            >
              <Table.ScrollContainer minWidth={720} type="native">
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
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredBookings.map((b, i) => {
                      const vehicle = vehicles.find((v) => v.id === b.vehicleId);
                      const refused = b.status === 'refused';
                      return (
                        <Table.Tr
                          key={b.id}
                          className="account-rental-row animate-stagger-up"
                          style={{ '--stagger-delay': `${i * 0.06}s` } as CSSProperties}
                          onClick={() => setSelected(b)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelected(b);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`${t('account.bookingDetailsTitle')}: ${b.ref}`}
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
                              <VehicleThumb imageUrl={vehicle?.image ?? undefined} />
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
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Box>
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

      <Modal
        opened={!!selected}
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
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            >
              <BookingDetailContent
                booking={selected}
                vehicleImageUrl={selectedVehicle?.image ?? undefined}
                footer={
                  <Group mt="xl" grow>
                    <Button variant="light" color="gray" onClick={() => setSelected(null)} radius="xl">
                      {t('account.closeModal')}
                    </Button>
                    {selectedVehicle && (
                      <Button
                        component={Link}
                        to={`/fleet/${selectedVehicle.id}`}
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
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </motion.div>
  );
}
