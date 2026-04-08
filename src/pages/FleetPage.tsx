import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container, Title, Text, SimpleGrid, Group, Stack, Select,
  ActionIcon, Pagination, Button, Box, TextInput, Drawer,
  RangeSlider, Chip, Badge, ThemeIcon, UnstyledButton, Loader, Center,
} from '@mantine/core';
import {
  IconLayoutGrid, IconList, IconFilter, IconSearch, IconDiamond,
  IconCar, IconBolt, IconPigMoney, IconRotateClockwise,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { VehicleCard } from '../components/common/VehicleCard';
import { EmptyState } from '../components/common/EmptyState';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/common/AnimatedSection';
import { get } from '../utils/api.utils';
import { type Vehicle, type GeneralData, mapApiCarToVehicle } from '../data/vehicles';
import Spinner from '../components/spinner/Spinner';

const ITEMS_PER_PAGE = 6;
const DEBOUNCE_MS = 400;

const categoryIcons: Record<string, typeof IconDiamond> = {
  Luksoze: IconDiamond, SUV: IconCar, Elektrike: IconBolt, Ekonomike: IconPigMoney,
};
const categoryColors: Record<string, string> = {
  Luksoze: 'yellow', SUV: 'green', Elektrike: 'blue', Ekonomike: 'gray',
};

const normalizeArray = <T,>(raw: any): T[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.$values)) return raw.$values;
  return [];
};


export default function FleetPage() {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 75em)');

  // ── Results from BE ─────────────────────────────────────────────────────────
  const [items, setItems] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Lookups ─────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<GeneralData[]>([]);
  const [fuelOptions, setFuelOptions] = useState<GeneralData[]>([]);
  const [transmissionOptions, setTransmissionOptions] = useState<GeneralData[]>([]);

  // ── Filter / UI state ───────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterFormKey, setFilterFormKey] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [gridView, setGridView] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [fuelTypeId, setFuelTypeId] = useState<string | null>(null);
  const [transmissionId, setTransmissionId] = useState<string | null>(null);
  const [seatsFilter, setSeatsFilter] = useState('');
  const [page, setPage] = useState(1);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Debounce search input ───────────────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, DEBOUNCE_MS);
  };

  // ── Fetch vehicles (called on every filter/page change) ─────────────────────
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        pageNr: String(page),
        pageSize: String(ITEMS_PER_PAGE),
        sortBy,
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (categoryId) params.set('categoryId', categoryId);
      if (seatsFilter) params.set('seats', seatsFilter);
      if (priceRange[0] > 0) params.set('priceMin', String(priceRange[0]));
      if (priceRange[1] < 200) params.set('priceMax', String(priceRange[1]));
      if (fuelTypeId) params.set('fuelTypeId', fuelTypeId);
      if (transmissionId) params.set('transmissionId', transmissionId);

      const res = await get(`Cars?${params.toString()}`);
      if (res.success) {
        setItems(res.data.items.map(mapApiCarToVehicle));
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
      } else {
        setError('Failed to load vehicles.');
      }
    } catch {
      setError('Failed to load vehicles. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, categoryId, sortBy, priceRange, fuelTypeId, transmissionId, seatsFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  // ── Reset page to 1 when any filter changes ─────────────────────────────────
  useEffect(() => { setPage(1); }, [debouncedSearch, categoryId, sortBy, priceRange, fuelTypeId, transmissionId, seatsFilter]);

  // ── Fetch lookups once ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [cats, fuels, trans] = await Promise.all([
          get<any>('CarCategory/getAll'),
          get<any>('CarFuel/getAll'),
          get<any>('CarTransmission/getAll'),
        ]);
        setCategories(normalizeArray<GeneralData>(cats.data));
        setFuelOptions(normalizeArray<GeneralData>(fuels.data));
        setTransmissionOptions(normalizeArray<GeneralData>(trans.data));
      } catch {
        notifications.show({ message: 'Failed to load filter options.', color: 'red' });
      }
    })();
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const startItem = (page - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(page * ITEMS_PER_PAGE, totalCount);

  const activeFilterCount = [
    categoryId,
    fuelTypeId,
    transmissionId,
    seatsFilter.length > 0,
    priceRange[0] > 0 || priceRange[1] < 200,
  ].filter(Boolean).length;

  const resetFleetToInitial = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategoryId(null);
    setSortBy('recommended');
    setGridView(true);
    setPriceRange([0, 200]);
    setFuelTypeId(null);
    setTransmissionId(null);
    setSeatsFilter('');
    setPage(1);
    setDrawerOpen(false);
    setFilterFormKey(k => k + 1);
  };

  // ── Filter panel ────────────────────────────────────────────────────────────
  const filterPanel = (
    <Stack gap="md" p="lg">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Group justify="space-between" mb={4}>
          <Group gap={8}>
            <Box style={{ width: 3, height: 18, borderRadius: 2, background: 'var(--az-teal)' }} />
            <Text fw={700} size="md" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
              {t('fleet.filters')}
            </Text>
          </Group>
          {activeFilterCount > 0 && (
            <Badge size="sm" variant="filled" color="teal" circle>{activeFilterCount}</Badge>
          )}
        </Group>
      </motion.div>

      {/* Category */}
      <motion.div className="filter-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('admin.category')}</Text>
        </div>
        <SimpleGrid cols={2} spacing="xs">
          {categories.map((cat, i) => {
            const Icon = categoryIcons[cat.name] ?? IconCar;
            const color = categoryColors[cat.name] ?? 'teal';
            const isActive = categoryId === cat.id;
            return (
              <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <UnstyledButton
                  onClick={() => { setCategoryId(isActive ? null : cat.id); setPage(1); }}
                  className={`filter-category-card ${isActive ? 'active' : ''}`}
                  p="sm" style={{ width: '100%', textAlign: 'center' }}
                >
                  <Stack align="center" gap={6}>
                    <motion.div animate={isActive ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.4 }}>
                      <ThemeIcon size={38} radius="xl" variant={isActive ? 'filled' : 'light'} color={isActive ? 'teal' : color}>
                        <Icon size={18} />
                      </ThemeIcon>
                    </motion.div>
                    <Text size="xs" fw={isActive ? 700 : 500}>{cat.name}</Text>
                  </Stack>
                </UnstyledButton>
              </motion.div>
            );
          })}
        </SimpleGrid>
      </motion.div>

      {/* Price Range */}
      <motion.div className="filter-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.priceRange')}</Text>
          <Text size="xs" c="teal" fw={600} ml="auto">€{priceRange[0]} — €{priceRange[1]}</Text>
        </div>
        <RangeSlider
          key={`fleet-price-${filterFormKey}`}
          value={priceRange}
          onChangeEnd={(val) => { setPriceRange(val); setPage(1); }}
          min={0} max={200} step={5} color="teal"
          marks={[{ value: 0, label: '€0' }, { value: 100, label: '€100' }, { value: 200, label: '€200' }]}
        />
      </motion.div>

      {/* Fuel Type */}
      <motion.div className="filter-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.fuelType')}</Text>
        </div>
        <Chip.Group key={`fleet-fuel-${filterFormKey}`} value={fuelTypeId}
          onChange={(v) => { setFuelTypeId(typeof v === 'string' ? v : ''); setPage(1); }}>
          <Group gap="xs">
            {fuelOptions.map(fuel => (
              <Chip key={fuel.id} value={fuel.id} variant="outline" color="teal">{fuel.name}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </motion.div>

      {/* Transmission */}
      <motion.div className="filter-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.transmission')}</Text>
        </div>
        <Chip.Group key={`fleet-trans-${filterFormKey}`} value={transmissionId}
          onChange={(v) => { setTransmissionId(typeof v === 'string' ? v : ''); setPage(1); }}>
          <Group gap="xs">
            {transmissionOptions.map(tr => (
              <Chip key={tr.id} value={tr.id} variant="outline" color="teal">{tr.name}</Chip>
            ))}
          </Group>
        </Chip.Group>
      </motion.div>

      {/* Seats */}
      <motion.div className="filter-section" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.seatsFilter')}</Text>
        </div>
        <Chip.Group key={`fleet-seats-${filterFormKey}`} value={seatsFilter}
          onChange={(v) => { setSeatsFilter(typeof v === 'string' ? v : ''); setPage(1); }}>
          <Group gap="xs">
            <Chip value="2" variant="outline" color="teal">2</Chip>
            <Chip value="4" variant="outline" color="teal">4</Chip>
            <Chip value="5" variant="outline" color="teal">5</Chip>
            <Chip value="7" variant="outline" color="teal">7+</Chip>
          </Group>
        </Chip.Group>
      </motion.div>

      {/* Reset */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Button variant="light" color="teal" fullWidth radius="lg"
          leftSection={<IconRotateClockwise size={16} />} onClick={resetFleetToInitial} style={{ fontWeight: 600 }}>
          {t('fleet.resetFilters')}
        </Button>
      </motion.div>
    </Stack>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <Spinner visible={loading} />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Container size="xl" py="xl">
          <AnimatedSection>
            <Box mb="xl" style={{ position: 'relative' }}>
              <Stack gap="xs">
                <Title order={1} fw={800}>{t('fleet.title')}</Title>
                <Text c="dimmed">{t('fleet.subtitle')}</Text>
              </Stack>
            </Box>
          </AnimatedSection>

          <AnimatedSection delay={0.1}>
            <Box className="glass-card card-gradient-border" p="xl" style={{ borderRadius: 'var(--mantine-radius-xl)' }}>
              <Group gap="md" mb="lg" wrap="wrap">
                <TextInput
                  key={`fleet-search-${filterFormKey}`}
                  placeholder={t('fleet.searchCars')}
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(e) => handleSearchChange(e.currentTarget.value)}
                  style={{ flex: 1, minWidth: 0 }}
                  w={{ base: '100%', sm: 'auto' }}
                  radius="xl"
                />
                <Group gap="xs" wrap="wrap">
                  <Select
                    key={`fleet-sort-${filterFormKey}`}
                    size="sm" w={{ base: '100%', xs: 180 }}
                    value={sortBy}
                    onChange={(v) => { if (v) { setSortBy(v); setPage(1); } }}
                    data={[
                      { value: 'recommended', label: t('fleet.recommended') },
                      { value: 'priceAsc', label: t('fleet.priceAsc') },
                      { value: 'priceDesc', label: t('fleet.priceDesc') },
                      { value: 'newest', label: t('fleet.newest') },
                    ]}
                    radius="xl"
                  />
                  <Group gap="xs">
                    <ActionIcon variant={gridView ? 'filled' : 'subtle'} color="teal" onClick={() => setGridView(true)} radius="xl" size="lg">
                      <IconLayoutGrid size={18} />
                    </ActionIcon>
                    <ActionIcon variant={!gridView ? 'filled' : 'subtle'} color="teal" onClick={() => setGridView(false)} radius="xl" size="lg">
                      <IconList size={18} />
                    </ActionIcon>
                  </Group>
                  {!isDesktop && (
                    <Button variant="light" color="teal" leftSection={<IconFilter size={16} />}
                      rightSection={activeFilterCount > 0 ? <Badge color="teal" size="xs" variant="filled" circle>{activeFilterCount}</Badge> : null}
                      onClick={() => setDrawerOpen(true)} radius="xl">
                      {t('fleet.filters')}
                    </Button>
                  )}
                </Group>
              </Group>

              {loading && <Center py="xl"><Loader color="teal" /></Center>}
              {!loading && error && <Text c="red" ta="center" py="xl">{error}</Text>}

              {!loading && !error && (
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {isDesktop && (
                    <AnimatedSection direction="left" delay={0.15}>
                      <Box className="filter-panel" style={{
                        width: 310, flexShrink: 0, position: 'sticky',
                        top: 90, maxHeight: 'calc(100vh - 110px)',
                        overflowY: 'auto', alignSelf: 'flex-start',
                      }}>
                        {filterPanel}
                      </Box>
                    </AnimatedSection>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Group justify="space-between" align="center" mb="md">
                      <Text size="sm" c="dimmed">
                        {totalCount > 0 ? (
                          <>
                            {t('admin.showing') ?? 'Showing'}{' '}
                            <Text component="span" size="sm" fw={500} c="default">
                              {startItem}–{endItem}
                            </Text>{' '}
                            {t('admin.of') ?? 'of'}{' '}
                            <Text component="span" size="sm" fw={500} c="default">
                              {totalCount}
                            </Text>{' '}
                            {t('fleet.results')}
                          </>
                        ) : (
                          <>{totalCount} {t('fleet.results')}</>
                        )}
                        {activeFilterCount > 0 && (
                          <>
                            {' · '}
                            <Text component="span" size="sm" c="teal" fw={500}>
                              {activeFilterCount} {t('fleet.activeFilters')}
                            </Text>
                            <Text component="span" size="sm" c="dimmed" ml={4}
                              style={{ cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={resetFleetToInitial}>
                              <IconRotateClockwise size={12} style={{ verticalAlign: 'middle' }} />{' '}
                              {t('fleet.resetFilters')}
                            </Text>
                          </>
                        )}
                      </Text>
                    </Group>

                    {items.length > 0 ? (
                      <>
                        <StaggerContainer stagger={0.08}>
                          <SimpleGrid cols={gridView ? { base: 1, sm: 2, lg: isDesktop ? 2 : 3 } : { base: 1 }} spacing="lg">
                            {items.map((vehicle, i) => (
                              <StaggerItem key={vehicle.carId} scale>
                                <VehicleCard vehicle={vehicle} index={i} />
                              </StaggerItem>
                            ))}
                          </SimpleGrid>
                        </StaggerContainer>

                        {totalPages > 1 && (
                          <AnimatedSection delay={0.2}>
                            <Group justify="center" mt="xl">
                              <Pagination
                                total={totalPages}
                                value={page}
                                onChange={setPage}
                                color="teal"
                                withEdges
                              />
                            </Group>
                          </AnimatedSection>
                        )}
                      </>
                    ) : (
                      <AnimatedSection>
                        <EmptyState title={t('fleet.noResults')} description={t('fleet.noResultsDesc')} />
                      </AnimatedSection>
                    )}
                  </div>
                </div>
              )}
            </Box>
          </AnimatedSection>

          <Drawer opened={drawerOpen && !isDesktop} onClose={() => setDrawerOpen(false)}
            title={t('fleet.filters')} position="left" size="sm">
            {filterPanel}
          </Drawer>
        </Container>
      </motion.div>
    </>
  );
}