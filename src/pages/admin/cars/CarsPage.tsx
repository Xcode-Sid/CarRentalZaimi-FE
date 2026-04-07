import { useState, useEffect, useCallback } from 'react';
import {
  Title, TextInput, Select, Button, Table, Badge,
  Group, ActionIcon, Image, Stack, Modal, Loader, Center, Text,
} from '@mantine/core';
import { IconSearch, IconPlus, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { type CarImage as UploadedCarImage } from '../../../components/car-image/CarImageUploadPanel';
import { CarFormModal, type Lookups } from './CarFormModal';
import { type Vehicle, type GeneralData, type FormValues, mapApiCarToVehicle } from '../../../data/vehicles';
import { del, get, post, put } from '../../../utils/api.utils';
import { AnimatedSection } from '../../../components/common/AnimatedSection';
import { toImagePath } from '../../../utils/general';
import { VehicleDetailView } from '../../../components/vehicle/VehicleDetailView';
import Spinner from '../../../components/spinner/Spinner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDisplayName(car: Vehicle): string {
  return car.title || car.carName || `Car #${car.carId}`;
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
      const params = new URLSearchParams({ pageNr: '1', pageSize: '100' });
      if (search) params.set('search', search);
      if (categoryFilter) params.set('categoryId', categoryFilter);

      const res = await get(`Cars?${params.toString()}`);
      if (res.success) {
        setCars(res.data.items.map(mapApiCarToVehicle));
      } else {
        setError('Failed to load cars.');
      }
    } catch {
      setError('Failed to load cars. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => { fetchCars(); }, [fetchCars]);
  useEffect(() => { fetchLookups(); }, []);

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
        notifications.show({ message: t('admin.carSaved'), color: 'teal' });
        await fetchCars();
      } else {
        notifications.show({ message: 'Save failed. Check API.', color: 'red' });
      }
    } catch(err) {
      notifications.show({ message: 'Save failed. Check API.', color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carId: string) => {
    try {
      const res = await del(`Cars/${carId}`);
      if (res.success) {
        setCars((prev) => prev.filter((c) => c.carId !== carId));
        notifications.show({ message: t('admin.carDeleted'), color: 'red' });
      } else {
        notifications.show({ message: 'Delete failed.', color: 'red' });
      }
    } catch {
      notifications.show({ message: 'Delete failed.', color: 'red' });
    }
  };

  return (
    <>
      <Spinner visible={loading} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Stack gap="xl">

          <AnimatedSection>
            <Group justify="space-between">
              <Title order={2} fw={700}>{t('admin.manageCars')}</Title>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button leftSection={<IconPlus size={16} />} variant="filled" color="teal" onClick={openAddModal}>
                  {t('admin.addCar')}
                </Button>
              </motion.div>
            </Group>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Group>
              <TextInput
                placeholder={t('admin.searchPlaceholder')}
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
                style={{ flex: 1, maxWidth: 300 }}
              />
              <Select
                placeholder={t('admin.category')}
                data={toSelectData(lookups.categories)}
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                clearable
                w={200}
              />
            </Group>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            {loading && <Center py="xl"><Loader color="teal" /></Center>}
            {error && <Text c="red">{error}</Text>}
            {!loading && !error && (
              <Table.ScrollContainer minWidth={800}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>#</Table.Th>
                      <Table.Th />
                      <Table.Th>{t('admin.carName')}</Table.Th>
                      <Table.Th>{t('admin.category')}</Table.Th>
                      <Table.Th>{t('admin.pricePerDay')}</Table.Th>
                      <Table.Th>{t('admin.carActions')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {cars.map((car, idx) => (
                      <motion.tr
                        key={car.carId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.3 }}
                      >
                        <Table.Td>#{String(idx + 1).padStart(3, '0')}</Table.Td>
                        <Table.Td>
                          <Image src={getPrimaryImageSrc(car)} w={50} h={35} radius="sm" fit="cover" fallbackSrc="/placeholder-car.png" />
                        </Table.Td>
                        <Table.Td fw={500}>{getDisplayName(car)}</Table.Td>
                        <Table.Td>
                          <Badge color="teal" variant="light" size="sm">
                            {car.categoryName ?? '—'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>€{car.pricePerDay}/{t('vehicle.perDay')}</Table.Td>
                        <Table.Td>
                          <Group gap={4}>
                            <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => setPreviewCar(car)}>
                              <IconEye size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="yellow" size="sm" onClick={() => openEditModal(car)}>
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleDelete(car.carId)}>
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </motion.tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </AnimatedSection>

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
            title={t('admin.previewVehicle')}
            size="xl" centered radius="xl"
            overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
            transitionProps={{ transition: 'pop', duration: 180 }}
            styles={{ body: { padding: 0 } }}
          >
            {previewCar !== null && (
              <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
                <VehicleDetailView
                  vehicle={previewCar}
                  showBreadcrumbs={false}
                  containerized={false}
                />
              </div>
            )}
          </Modal>

        </Stack>
      </motion.div>
    </>
  );
}