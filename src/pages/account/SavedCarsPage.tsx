import { useState, useEffect, useCallback } from 'react';
import {
  Title, SimpleGrid, Stack, Box, Text, Group, TextInput, Select, Button,
  Loader, Center, Pagination,
} from '@mantine/core';
import { IconDeviceFloppy, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { VehicleCard } from '../../components/common/VehicleCard';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { useAuth } from '../../contexts/AuthContext';
import { mapApiCarToVehicle, type Vehicle } from '../../data/vehicles';
import { get } from '../../utils/apiUtils';
import { SAVED_CARS_PAGE_SIZE as PAGE_SIZE } from '../../constants/pagination';

export default function SavedCarsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, category]);

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await get('CarCategory/getAll');
      if (!res.success) return;
      setCategories(res.data.map((cat: { id: string; name: string }) => ({
        value: cat.id,
        label: cat.name,
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.unknownError'));
    }
  }, [t]);

  const fetchSavedCars = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        UserId: user.id,
        PageNr: String(page),
        PageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());
      if (category) params.set('CategoryId', category);

      const res = await get(`SavedCar/getAll-savedCars?${params.toString()}`);
      if (!res.success) throw new Error(res.message || t('failedToLoadCars'));

      const mapped = res.data.items.map((item: any) => mapApiCarToVehicle(item.car));
      setVehicles(mapped);
      setTotalPages(res.data.totalPages);
      setTotalCount(res.data.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.unknownError'));
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, page, debouncedSearch, category]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchSavedCars(); }, [fetchSavedCars]);

  const handleReset = () => {
    setSearch('');
    setCategory(null);
    setPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Stack gap="lg">
        <AnimatedSection>
          <Group gap={10} align="flex-start">
            <Box
              style={{
                width: 4,
                height: 28,
                borderRadius: 4,
                background: 'var(--az-teal)',
                boxShadow: '0 0 12px rgba(45, 212, 168, 0.35)',
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div>
              <Title order={2} fw={800}>{t('account.savedCars')}</Title>
              <Text c="dimmed" size="sm" mt={4}>{t('account.carsSubtitle')}</Text>
              <Text c="dimmed" size="xs" mt={6} maw={520} style={{ lineHeight: 1.5 }}>
                {t('account.savedCarsPaymentNote')}
              </Text>
            </div>
          </Group>
        </AnimatedSection>

        <AnimatedSection delay={0.08}>
          <Group wrap="wrap" align="end" mb="sm">
            <TextInput
              placeholder={t('account.filterSearchSaved')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
            />
            <Select
              placeholder={t('account.filterCategory')}
              data={categories}
              value={category}
              onChange={setCategory}
              clearable
              w={190}
            />
            <Button variant="subtle" color="gray" onClick={handleReset}>
              {t('account.filtersReset')}
            </Button>
          </Group>
        </AnimatedSection>

        {loading ? (
          <Center py="xl">
            <Loader color="var(--az-teal)" size="md" />
          </Center>
        ) : error ? (
          <Center py="xl">
            <Text c="red" size="sm">{error}</Text>
          </Center>
        ) : vehicles.length > 0 ? (
          <AnimatedSection delay={0.1}>
            <Stack gap="md">
              <Box
                className="glass-card card-gradient-border"
                p={{ base: 'md', sm: 'xl' }}
                style={{ borderRadius: 'var(--mantine-radius-xl)' }}
              >
                <StaggerContainer stagger={0.07}>
                  <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                    {vehicles.map((v, i) => (
                      <StaggerItem key={v.carId} scale>
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, amount: 0.15 }}
                          transition={{ duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                        >
                          <VehicleCard vehicle={v} index={i} />
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </SimpleGrid>
                </StaggerContainer>
              </Box>

              {totalPages > 1 && (
                <Group justify="space-between" align="center" px={4}>
                  <Text size="xs" c="dimmed">
                    {t('admin.showing')}{' '}
                    <Text component="span" size="xs" fw={500} c="default">{startItem}–{endItem}</Text>{' '}
                    {t('admin.of')}{' '}
                    <Text component="span" size="xs" fw={500} c="default">{totalCount}</Text>{' '}
                    {t('account.savedCars')}
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
              icon={<IconDeviceFloppy size={40} />}
              title={t('account.noSavedCars')}
              actionLabel={t('account.browsFleet')}
              actionPath="/fleet"
            />
          </AnimatedSection>
        )}
      </Stack>
    </motion.div>
  );
}