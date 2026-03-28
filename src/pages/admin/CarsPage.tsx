import { useState } from 'react';
import {
  Title,
  TextInput,
  Select,
  Button,
  Table,
  Badge,
  Group,
  ActionIcon,
  Image,
  Stack,
  Modal,
  Textarea,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSearch, IconPlus, IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { vehicles as initialVehicles, type Vehicle } from '../../data/vehicles';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { VehicleDetailView } from '../../components/vehicle/VehicleDetailView';

const statusColors: Record<string, string> = {
  available: 'green',
  maintenance: 'orange',
  unavailable: 'red',
};

const categoryColors: Record<string, string> = {
  Luksoze: 'yellow',
  SUV: 'green',
  Elektrike: 'blue',
  Ekonomike: 'gray',
};

export default function CarsPage() {
  const { t } = useTranslation();
  const [cars, setCars] = useState<Vehicle[]>(initialVehicles);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Vehicle | null>(null);
  const [previewCarId, setPreviewCarId] = useState<number | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      year: 2024,
      category: 'Ekonomike' as Vehicle['category'],
      price: 0,
      status: 'available' as Vehicle['status'],
      description: '',
      image: '',
    },
  });

  const filtered = cars.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  const openAddModal = () => {
    setEditingCar(null);
    form.reset();
    setModalOpen(true);
  };

  const openEditModal = (car: Vehicle) => {
    setEditingCar(car);
    form.setValues({
      name: car.name,
      year: car.year,
      category: car.category,
      price: car.price,
      status: car.status,
      description: car.description,
      image: car.image,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (editingCar) {
      setCars((prev) =>
        prev.map((c) =>
          c.id === editingCar.id ? { ...c, ...form.values } : c,
        ),
      );
    } else {
      const newCar: Vehicle = {
        ...form.values,
        id: Math.max(...cars.map((c) => c.id)) + 1,
        images: [form.values.image],
        specs: { seats: 5, engine: '2.0L', transmission: 'Automatik', fuel: 'Benzinë', mileage: '0 km', color: 'E zezë', doors: 4 },
        features: [],
        isFeatured: false,
      };
      setCars((prev) => [...prev, newCar]);
    }
    setModalOpen(false);
    notifications.show({ message: t('admin.carSaved'), color: 'teal' });
  };

  const handleDelete = (id: number) => {
    setCars((prev) => prev.filter((c) => c.id !== id));
    notifications.show({ message: t('admin.carDeleted'), color: 'red' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Stack gap="xl">
        <AnimatedSection>
          <Group justify="space-between">
            <Title order={2} fw={700}>
              {t('admin.manageCars')}
            </Title>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                leftSection={<IconPlus size={16} />}
                variant="filled"
                color="teal"
                onClick={openAddModal}
                className="ripple-btn"
              >
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
              data={[
                { value: 'Luksoze', label: t('fleet.luxury') },
                { value: 'SUV', label: t('fleet.suv') },
                { value: 'Elektrike', label: t('fleet.electric') },
                { value: 'Ekonomike', label: t('fleet.economy') },
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              clearable
              w={160}
            />
            <Select
              placeholder={t('admin.carStatus')}
              data={[
                { value: 'available', label: t('admin.available') },
                { value: 'maintenance', label: t('admin.maintenance') },
                { value: 'unavailable', label: t('admin.unavailable') },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              w={180}
            />
          </Group>
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th></Table.Th>
                  <Table.Th>{t('admin.carName')}</Table.Th>
                  <Table.Th>{t('admin.category')}</Table.Th>
                  <Table.Th>{t('admin.pricePerDay')}</Table.Th>
                  <Table.Th>{t('admin.carStatus')}</Table.Th>
                  <Table.Th>{t('admin.carActions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filtered.map((car, idx) => (
                  <motion.tr
                    key={car.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.3 }}
                    style={{ transition: 'background 0.2s' }}
                  >
                    <Table.Td>#{String(car.id).padStart(3, '0')}</Table.Td>
                    <Table.Td>
                      <Image src={car.image} w={50} h={35} radius="sm" fit="cover" />
                    </Table.Td>
                    <Table.Td fw={500}>{car.name}</Table.Td>
                    <Table.Td>
                      <Badge color={categoryColors[car.category]} variant="light" size="sm">
                        {car.category}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      €{car.price}/{t('vehicle.perDay')}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={statusColors[car.status]} variant="light" size="sm">
                        {t(`admin.${car.status === 'available' ? 'available' : car.status === 'maintenance' ? 'maintenance' : 'unavailable'}`)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4}>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="sm"
                          aria-label={t('admin.previewVehicle')}
                          onClick={() => setPreviewCarId(car.id)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="yellow"
                          size="sm"
                          onClick={() => openEditModal(car)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          onClick={() => handleDelete(car.id)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </motion.tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </AnimatedSection>

        <Modal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCar ? t('admin.editCar') : t('admin.addCar')}
          size="lg"
          centered
        >
          <Stack gap="md">
            <TextInput label={t('admin.carName')} {...form.getInputProps('name')} required />
            <SimpleGrid cols={2}>
              <TextInput label={t('vehicle.year')} type="number" {...form.getInputProps('year')} />
              <TextInput label={`${t('admin.price')} (€/${t('vehicle.perDay')})`} type="number" {...form.getInputProps('price')} />
            </SimpleGrid>
            <SimpleGrid cols={2}>
              <Select
                label={t('admin.category')}
                data={['Luksoze', 'SUV', 'Elektrike', 'Ekonomike']}
                {...form.getInputProps('category')}
              />
              <Select
                label={t('admin.carStatus')}
                data={[
                  { value: 'available', label: t('admin.available') },
                  { value: 'maintenance', label: t('admin.maintenance') },
                  { value: 'unavailable', label: t('admin.unavailable') },
                ]}
                {...form.getInputProps('status')}
              />
            </SimpleGrid>
            <TextInput label={t('admin.imageUrl')} {...form.getInputProps('image')} />
            <Textarea label={t('admin.description')} minRows={3} {...form.getInputProps('description')} />
            <Button
              variant="filled"
              color="teal"
              onClick={handleSave}
              fullWidth
            >
              {t('admin.saveCar')}
            </Button>
          </Stack>
        </Modal>

        <Modal
          opened={previewCarId !== null}
          onClose={() => setPreviewCarId(null)}
          title={t('admin.previewVehicle')}
          size="xl"
          centered
          radius="xl"
          overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
          transitionProps={{ transition: 'pop', duration: 180 }}
          styles={{
            body: { padding: 0 },
          }}
        >
          {previewCarId !== null && (
            <div style={{ maxHeight: '75vh', overflow: 'auto' }}>
              <VehicleDetailView
                vehicleId={previewCarId}
                showBreadcrumbs={false}
                containerized={false}
              />
            </div>
          )}
        </Modal>
      </Stack>
    </motion.div>
  );
}
