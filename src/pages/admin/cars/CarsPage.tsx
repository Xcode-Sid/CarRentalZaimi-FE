import { useState, useEffect, useCallback } from 'react';
import {
  Title, TextInput, Select, Button, Table, Badge,
  Group, ActionIcon, Image, Stack, Modal, Loader, Center, Text,
  ThemeIcon,
  Tooltip,
  Paper,
  Alert,
  Pagination,
} from '@mantine/core';
import { IconSearch, IconPlus, IconEye, IconEdit, IconTrash, IconCar, IconInfoCircle, IconX, IconFilter } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { type CarImage as UploadedCarImage } from '../../../components/car-image/CarImageUploadPanel';
import { CarFormModal, type Lookups } from './CarFormModal';
import { type Vehicle, type GeneralData, type FormValues, mapApiCarToVehicle } from '../../../data/vehicles';
import { PAGE_SIZE } from '../../../constants/pagination';
import { del, get, post, put } from '../../../utils/api.utils';
import { AnimatedSection } from '../../../components/common/AnimatedSection';
import { toImagePath } from '../../../utils/general';
import { VehicleDetailView } from '../../../components/vehicle/VehicleDetailView';
import Spinner from '../../../components/spinner/Spinner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDisplayName(car: Vehicle | null): string {
  return car?.title ?? (car?.carId ? `Car #${car.carId}` : 'Unknown');
}

function getPrimaryImageSrc(car: Vehicle): string {
  const primary = car.carImages?.find((img) => img.isPrimary) ?? car.carImages?.[0];
  if (!primary?.data) return '';
  return primary.data;
}

const normalizeArray = <T,>(raw: any): T[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.$values)) return raw.$values;
  return [];
};

const toSelectData = (items: GeneralData[]) =>
  items.map((x) => ({ value: x.id, label: x.name }));


// ── Page ─────────────────────────────────────────────────────────────────────

export default function CarsPage() {
  const { t } = useTranslation();
  const [cars, setCars] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Vehicle | null>(null);
  const [previewCar, setPreviewCar] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [lookups, setLookups] = useState<Lookups>({
    categories: [], companyNames: [], companyModels: [],
    exteriorColors: [], interiorColors: [], transmissions: [], fuels: [],
  });
  const [lookupsLoading, setLookupsLoading] = useState(false);

  const fetchLookups = async () => {
    setLookupsLoading(true);
    try {
      const [cats, names, models, extColors, intColors, trans, fuels] = await Promise.all([
        get<any>('CarCategory/getAll'),
        get<any>('CarCompanyName/getAll'),
        get<any>('CarCompanyModel/getAll'),
        get<any>('CarExteriorColor/getAll'),
        get<any>('CarInteriorColor/getAll'),
        get<any>('CarTransmission/getAll'),
        get<any>('CarFuel/getAll'),
      ]);
      setLookups({
        categories: normalizeArray(cats.data),
        companyNames: normalizeArray(names.data),
        companyModels: normalizeArray(models.data),
        exteriorColors: normalizeArray(extColors.data),
        interiorColors: normalizeArray(intColors.data),
        transmissions: normalizeArray(trans.data),
        fuels: normalizeArray(fuels.data),
      });
    } catch {
      notifications.show({ message: 'Failed to load lookup data.', color: 'red' });
    } finally {
      setLookupsLoading(false);
    }
  };

  const fetchCars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pageNr: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('categoryId', categoryFilter);

      const res = await get(`Cars?${params.toString()}`);
      if (res.success) {
        setCars(res.data.items.map(mapApiCarToVehicle));
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
      } else {
        setError('Failed to load cars.');
      }
    } catch {
      setError('Failed to load cars. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => { fetchCars(); }, [fetchCars]);
  useEffect(() => { fetchLookups(); }, []);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, categoryFilter]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingCar(null);
    setModalOpen(true);
  };

  const openEditModal = (car: Vehicle) => {
    setEditingCar(car);
    setModalOpen(true);
  };

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        carImages: values.carImages.map((img) => ({
          name: img.name,
          data: img.data?.startsWith('http')
            ? null
            : img.data?.includes(',')
              ? img.data.split(',')[1] ?? null
              : img.data,
          isPrimary: img.isPrimary,
        })),
      };

      const res =
        editingCar
          ? await put(`Cars/update/${editingCar.carId}`, payload)
          : await post('Cars/create', payload);
      if (res.success) {
        setModalOpen(false);
        notifications.show({ title: t('success'), message: t('admin.carSaved'), color: 'teal' });
        await fetchCars();
      } else {
        notifications.show({ title: t('error'), message: 'Save failed. Check API.', color: 'red' });
      }
    } catch (err) {
      notifications.show({ title: t('error'), message: 'Save failed. Check API.', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await del(`Cars/${deleteTarget.carId}`);
      if (res.success) {
        setCars((prev) => prev.filter((c) => c.carId !== deleteTarget.carId));
        notifications.show({ message: t('admin.carDeleted'), color: 'red' });
        setDeleteTarget(null);
      } else {
        notifications.show({ message: 'Delete failed.', color: 'red' });
      }
    } catch {
      notifications.show({ message: 'Delete failed.', color: 'red' });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <Spinner visible={loading} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Stack gap="xl">

          {/* ── Header ─────────────────────────────────────────── */}
          <AnimatedSection>
            <Group justify="space-between" align="center">
              <Stack gap={2}>
                <Title order={2} fw={500} style={{ letterSpacing: '-0.01em' }}>
                  {t('admin.manageCars')}
                </Title>
                <Text size="sm" c="dimmed">
                  {totalCount} {t('admin.carsTotal') ?? 'vehicles listed'}
                </Text>
              </Stack>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  leftSection={<IconPlus size={15} />}
                  variant="filled"
                  color="teal"
                  radius="md"
                  size="sm"
                  onClick={openAddModal}
                  styles={{
                    root: {
                      transition: 'box-shadow 0.15s',
                      '&:hover': { boxShadow: '0 4px 14px rgba(15,110,86,0.25)' },
                    },
                  }}
                >
                  {t('admin.addCar')}
                </Button>
              </motion.div>
            </Group>
          </AnimatedSection>

          {/* ── Filters ────────────────────────────────────────── */}
          <AnimatedSection delay={0.08}>
            <Paper
              radius="md"
              p="sm"
              withBorder
              style={{ borderColor: 'var(--mantine-color-default-border)' }}
            >
              <Group gap="sm">
                <TextInput
                  placeholder={t('admin.searchPlaceholder')}
                  leftSection={<IconSearch size={15} />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  radius="md"
                  style={{ flex: 1, maxWidth: 320 }}
                  styles={{
                    input: {
                      transition: 'border-color 0.18s, box-shadow 0.18s',
                      '&:focus': { boxShadow: '0 0 0 3px rgba(29,158,117,0.12)' },
                    },
                  }}
                />
                <Select
                  placeholder={t('admin.category')}
                  data={toSelectData(lookups.categories)}
                  value={categoryFilter}
                  onChange={(val) => setCategoryFilter(val)}
                  clearable
                  radius="md"
                  w={200}
                  leftSection={<IconFilter size={15} />}
                  styles={{
                    input: {
                      transition: 'border-color 0.18s, box-shadow 0.18s',
                      '&:focus': { boxShadow: '0 0 0 3px rgba(29,158,117,0.12)' },
                    },
                  }}
                />
                {(search || categoryFilter) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      radius="md"
                      onClick={() => { setSearch(''); setCategoryFilter(null); }}
                      title="Clear filters"
                    >
                      <IconX size={15} />
                    </ActionIcon>
                  </motion.div>
                )}
              </Group>
            </Paper>
          </AnimatedSection>

          {/* ── Table ──────────────────────────────────────────── */}
          <AnimatedSection delay={0.14}>
            {loading && (
              <Center py="xl">
                <Loader color="teal" size="sm" />
              </Center>
            )}
            {error && (
              <Alert icon={<IconInfoCircle size={15} />} color="red" radius="md" variant="light">
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <Stack gap="md">
                <Paper radius="lg" withBorder style={{ overflow: 'hidden', borderColor: 'var(--mantine-color-default-border)' }}>
                  <Table.ScrollContainer minWidth={800}>
                    <Table
                      highlightOnHover
                      verticalSpacing="sm"
                      horizontalSpacing="md"
                      styles={{
                        thead: {
                          background: 'var(--mantine-color-default-hover)',
                          borderBottom: '0.5px solid var(--mantine-color-default-border)',
                        },
                        th: { fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--mantine-color-dimmed)' },
                      }}
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th w={60}>#</Table.Th>
                          <Table.Th w={70} />
                          <Table.Th>{t('admin.carName')}</Table.Th>
                          <Table.Th>{t('admin.category')}</Table.Th>
                          <Table.Th>{t('admin.pricePerDay')}</Table.Th>
                          <Table.Th w={110}>{t('admin.carActions')}</Table.Th>
                        </Table.Tr>
                      </Table.Thead>

                      <Table.Tbody>
                        {cars.length === 0 && (
                          <Table.Tr>
                            <Table.Td colSpan={6}>
                              <Center py="xl">
                                <Stack align="center" gap="xs">
                                  <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                    <IconCar size={20} />
                                  </ThemeIcon>
                                  <Text size="sm" c="dimmed">
                                    {t('admin.noCarsFound') ?? 'No cars found'}
                                  </Text>
                                </Stack>
                              </Center>
                            </Table.Td>
                          </Table.Tr>
                        )}

                        {cars.map((car, idx) => (
                          <motion.tr
                            key={car.carId}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03, duration: 0.25, ease: 'easeOut' }}
                            style={{ cursor: 'default' }}
                          >
                            <Table.Td>
                              <Text size="xs" c="dimmed" fw={500}>
                                #{String((page - 1) * PAGE_SIZE + idx + 1).padStart(3, '0')}
                              </Text>
                            </Table.Td>

                            <Table.Td>
                              <Image
                                src={getPrimaryImageSrc(car)}
                                w={52}
                                h={36}
                                radius="md"
                                fit="cover"
                                fallbackSrc="/placeholder-car.png"
                                style={{ border: '0.5px solid var(--mantine-color-default-border)' }}
                              />
                            </Table.Td>

                            <Table.Td>
                              <Text size="sm" fw={500}>
                                {getDisplayName(car)}
                              </Text>
                            </Table.Td>

                            <Table.Td>
                              <Badge
                                color="teal"
                                variant="light"
                                size="sm"
                                radius="md"
                              >
                                {car.categoryName ?? '—'}
                              </Badge>
                            </Table.Td>

                            <Table.Td>
                              <Group gap={2} align="baseline">
                                <Text size="sm" fw={500}>€{car.pricePerDay}</Text>
                                <Text size="xs" c="dimmed">/{t('vehicle.perDay')}</Text>
                              </Group>
                            </Table.Td>

                            <Table.Td>
                              <Group gap={4}>
                                <Tooltip label={t('admin.preview')} withArrow position="top" fz="xs">
                                  <ActionIcon
                                    variant="subtle"
                                    color="blue"
                                    size="sm"
                                    radius="md"
                                    onClick={() => setPreviewCar(car)}
                                  >
                                    <IconEye size={15} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label={t('admin.edit')} withArrow position="top" fz="xs">
                                  <ActionIcon
                                    variant="subtle"
                                    color="yellow"
                                    size="sm"
                                    radius="md"
                                    onClick={() => openEditModal(car)}
                                  >
                                    <IconEdit size={15} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label={t('admin.delete')} withArrow position="top" fz="xs">
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    radius="md"
                                    onClick={() => setDeleteTarget(car)}
                                  >
                                    <IconTrash size={15} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </motion.tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Paper>

                {/* ── Pagination ─────────────────────────────────── */}
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
                      {t('admin.cars') ?? 'cars'}
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
          </AnimatedSection>

          {/* ── Modals ─────────────────────────────────────────── */}
          <CarFormModal
            opened={modalOpen}
            onClose={() => setModalOpen(false)}
            editingCar={editingCar}
            lookups={lookups}
            lookupsLoading={lookupsLoading}
            onSave={handleSave}
            saving={saving}
          />

          <Modal
            opened={previewCar !== null}
            onClose={() => setPreviewCar(null)}
            title={
              <Group gap={10}>
                <ThemeIcon color="teal" variant="light" size={32} radius="md">
                  <IconEye size={16} />
                </ThemeIcon>
                <Text fw={500} size="md">{t('admin.previewVehicle')}</Text>
              </Group>
            }
            size="xl"
            centered
            radius="lg"
            overlayProps={{ backgroundOpacity: 0.55, blur: 6 }}
            transitionProps={{ transition: 'pop', duration: 200 }}
            styles={{
              body: { padding: 0 },
              header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
            }}
          >
            {previewCar !== null && (
              <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <VehicleDetailView
                  vehicle={previewCar}
                  showBreadcrumbs={false}
                  containerized={false}
                />
              </div>
            )}
          </Modal>

          {/* ── Delete Confirm Modal ───────────────────────────── */}
          <Modal
            opened={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            title={
              <Group gap={10}>
                <ThemeIcon color="red" variant="light" size={32} radius="md">
                  <IconTrash size={16} />
                </ThemeIcon>
                <Text fw={500} size="md">{t('admin.deleteTitle')}</Text>
              </Group>
            }
            size="sm"
            centered
            radius="lg"
            overlayProps={{ backgroundOpacity: 0.55, blur: 6 }}
            transitionProps={{ transition: 'pop', duration: 200 }}
            styles={{
              header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
              body: { padding: '20px 24px 24px' },
            }}
          >
            <Stack gap="lg" align="center">
              <Paper
                radius="md"
                p="md"
                w="100%"
                style={{
                  background: 'var(--mantine-color-red-light)',
                  border: '0.5px solid var(--mantine-color-red-light-hover)',
                }}
              >
                <Stack gap={4} align="center">
                  <Text size="sm" ta="center" fw={500} c="red.8">
                    {t('admin.deleteWarning', { name: getDisplayName(deleteTarget!) })}
                  </Text>
                  <Text size="xs" ta="center" c="dimmed">
                    {t('admin.deleteUndone')}
                  </Text>
                </Stack>
              </Paper>

              <Group w="100%" gap="sm">
                <Button
                  variant="default"
                  flex={1}
                  radius="md"
                  onClick={() => setDeleteTarget(null)}
                  disabled={saving}
                >
                  {t('cancel')}
                </Button>
                <Button
                  color="red"
                  flex={1}
                  radius="md"
                  loading={saving}
                  leftSection={<IconTrash size={15} />}
                  onClick={handleDelete}
                >
                  {t('delete')}
                </Button>
              </Group>
            </Stack>
          </Modal>
        </Stack>
      </motion.div>
    </>
  );
}
