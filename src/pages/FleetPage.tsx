import { useState, useMemo } from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Group,
  Stack,
  Select,
  ActionIcon,
  Pagination,
  Button,
  Box,
  TextInput,
  Drawer,
  RangeSlider,
  Chip,
  Badge,
  ThemeIcon,
  Divider,
  UnstyledButton,
} from '@mantine/core';
import {
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconSearch,
  IconDiamond,
  IconCar,
  IconBolt,
  IconPigMoney,
  IconRotateClockwise,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@mantine/hooks';
import { motion } from 'framer-motion';
import { vehicles } from '../data/vehicles';
import { VehicleCard } from '../components/common/VehicleCard';
import { EmptyState } from '../components/common/EmptyState';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/common/AnimatedSection';

const ITEMS_PER_PAGE = 6;

const categoryIcons: Record<string, typeof IconDiamond> = {
  Luksoze: IconDiamond,
  SUV: IconCar,
  Elektrike: IconBolt,
  Ekonomike: IconPigMoney,
};

const categoryColors: Record<string, string> = {
  Luksoze: 'yellow',
  SUV: 'green',
  Elektrike: 'blue',
  Ekonomike: 'gray',
};

const INITIAL_PRICE_RANGE: [number, number] = [0, 200];

export default function FleetPage() {
  const { t } = useTranslation();
  const isDesktop = useMediaQuery('(min-width: 75em)');
  const [drawerOpen, setDrawerOpen] = useState(false);
  /** Bumps when user hits Reset — remounts slider & chips so Mantine UI matches state */
  const [filterFormKey, setFilterFormKey] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('recommended');
  const [gridView, setGridView] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [...INITIAL_PRICE_RANGE]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [transmission, setTransmission] = useState<string[]>([]);
  const [seatsFilter, setSeatsFilter] = useState('');
  const [page, setPage] = useState(1);

  const categories = ['Luksoze', 'SUV', 'Elektrike', 'Ekonomike'];

  const activeFilterCount = [
    category,
    fuelTypes.length > 0,
    transmission.length > 0,
    seatsFilter.length > 0,
    priceRange[0] > 0 || priceRange[1] < 200,
  ].filter(Boolean).length;

  const resetFleetToInitial = () => {
    setSearch('');
    setCategory(null);
    setSortBy('recommended');
    setGridView(true);
    setPriceRange([...INITIAL_PRICE_RANGE]);
    setFuelTypes([]);
    setTransmission([]);
    setSeatsFilter('');
    setPage(1);
    setDrawerOpen(false);
    setFilterFormKey((k) => k + 1);
  };

  const filtered = useMemo(() => {
    let result = [...vehicles];

    if (search) {
      result = result.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category) {
      result = result.filter((v) => v.category === category);
    }
    if (fuelTypes.length > 0) {
      result = result.filter((v) => fuelTypes.includes(v.specs.fuel));
    }
    if (transmission.length > 0) {
      result = result.filter((v) => transmission.includes(v.specs.transmission));
    }
    if (seatsFilter) {
      const seats = parseInt(seatsFilter);
      if (seats === 7) {
        result = result.filter((v) => v.specs.seats >= 7);
      } else {
        result = result.filter((v) => v.specs.seats === seats);
      }
    }
    result = result.filter((v) => v.price >= priceRange[0] && v.price <= priceRange[1]);

    switch (sortBy) {
      case 'recommended':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceAsc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => b.year - a.year);
        break;
    }

    return result;
  }, [search, category, sortBy, priceRange, fuelTypes, transmission, seatsFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const filterPanel = (
    <Stack gap="md" p="lg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
      <motion.div
        className="filter-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('admin.category')}</Text>
        </div>
        <SimpleGrid cols={2} spacing="xs">
          {categories.map((cat, i) => {
            const Icon = categoryIcons[cat];
            const catActive = category === cat;
            return (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
              >
                <UnstyledButton
                  onClick={() => { setCategory(catActive ? null : cat); setPage(1); }}
                  className={`filter-category-card ${catActive ? 'active' : ''}`}
                  p="sm"
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  <Stack align="center" gap={6}>
                    <motion.div
                      animate={catActive ? { rotate: [0, -8, 8, 0], scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <ThemeIcon
                        size={38}
                        radius="xl"
                        variant={catActive ? 'filled' : 'light'}
                        color={catActive ? 'teal' : categoryColors[cat]}
                      >
                        <Icon size={18} />
                      </ThemeIcon>
                    </motion.div>
                    <Text size="xs" fw={catActive ? 700 : 500}>
                      {t(`fleet.${cat.toLowerCase() === 'luksoze' ? 'luxury' : cat.toLowerCase() === 'elektrike' ? 'electric' : cat.toLowerCase() === 'ekonomike' ? 'economy' : 'suv'}`)}
                    </Text>
                  </Stack>
                </UnstyledButton>
              </motion.div>
            );
          })}
        </SimpleGrid>
      </motion.div>

      {/* Price Range */}
      <motion.div
        className="filter-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.priceRange')}</Text>
          <Text size="xs" c="teal" fw={600} ml="auto">€{priceRange[0]} — €{priceRange[1]}</Text>
        </div>
        <RangeSlider
          key={`fleet-price-${filterFormKey}`}
          value={priceRange}
          onChange={(val) => { setPriceRange(val); setPage(1); }}
          min={0}
          max={200}
          step={5}
          color="teal"
          marks={[
            { value: 0, label: '€0' },
            { value: 100, label: '€100' },
            { value: 200, label: '€200' },
          ]}
        />
      </motion.div>

      {/* Fuel Type */}
      <motion.div
        className="filter-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.fuelType')}</Text>
        </div>
        <Chip.Group
          key={`fleet-fuel-${filterFormKey}`}
          multiple
          value={fuelTypes}
          onChange={(v) => { setFuelTypes(v); setPage(1); }}
        >
          <Group gap="xs">
            <Chip value="Benzinë" variant="outline" color="teal">{t('fleet.fuelPetrol')}</Chip>
            <Chip value="Diesel" variant="outline" color="teal">{t('fleet.fuelDiesel')}</Chip>
            <Chip value="Elektrik" variant="outline" color="teal">{t('fleet.fuelElectric')}</Chip>
            <Chip value="Hibrid" variant="outline" color="teal">{t('fleet.fuelHybrid')}</Chip>
          </Group>
        </Chip.Group>
      </motion.div>

      {/* Transmission */}
      <motion.div
        className="filter-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.transmission')}</Text>
        </div>
        <Chip.Group
          key={`fleet-trans-${filterFormKey}`}
          multiple
          value={transmission}
          onChange={(v) => { setTransmission(v); setPage(1); }}
        >
          <Group gap="xs">
            <Chip value="Manual" variant="outline" color="teal">{t('fleet.manual')}</Chip>
            <Chip value="Automatik" variant="outline" color="teal">{t('fleet.automatic')}</Chip>
            <Chip value="CVT" variant="outline" color="teal">{t('fleet.cvt')}</Chip>
          </Group>
        </Chip.Group>
      </motion.div>

      {/* Seats */}
      <motion.div
        className="filter-section"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <div className="filter-section-label">
          <span className="label-dot" />
          <Text fw={600} size="sm">{t('fleet.seatsFilter')}</Text>
        </div>
        <Chip.Group
          key={`fleet-seats-${filterFormKey}`}
          value={seatsFilter}
          onChange={(v) => { setSeatsFilter(typeof v === 'string' ? v : ''); setPage(1); }}
        >
          <Group gap="xs">
            <Chip value="2" variant="outline" color="teal">2</Chip>
            <Chip value="4" variant="outline" color="teal">4</Chip>
            <Chip value="5" variant="outline" color="teal">5</Chip>
            <Chip value="7" variant="outline" color="teal">7+</Chip>
          </Group>
        </Chip.Group>
      </motion.div>

      {/* Reset all filters to initial page state */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Button
          variant="light"
          color="teal"
          fullWidth
          radius="lg"
          leftSection={<IconRotateClockwise size={16} />}
          onClick={resetFleetToInitial}
          style={{ fontWeight: 600 }}
        >
          {t('fleet.resetFilters')}
        </Button>
      </motion.div>
    </Stack>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Container size="xl" py="xl">
        <AnimatedSection>
          <Box mb="xl" style={{ position: 'relative' }}>
            <Stack gap="xs">
              <Title order={1} fw={800}>
                {t('fleet.title')}
              </Title>
              <Text c="dimmed">{t('fleet.subtitle')}</Text>
            </Stack>
          </Box>
        </AnimatedSection>

        {/* Main content wrapper with border */}
        <AnimatedSection delay={0.1}>
          <Box
            className="glass-card card-gradient-border"
            p="xl"
            style={{ borderRadius: 'var(--mantine-radius-xl)' }}
          >
            {/* Search & controls bar */}
            <Group gap="md" mb="lg" wrap="wrap">
              <TextInput
                key={`fleet-search-${filterFormKey}`}
                placeholder={t('fleet.searchCars')}
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => { setSearch(e.currentTarget.value); setPage(1); }}
                style={{ flex: 1, minWidth: 0 }}
                w={{ base: '100%', sm: 'auto' }}
                radius="xl"
              />
              <Group gap="xs" wrap="wrap">
                <Select
                  key={`fleet-sort-${filterFormKey}`}
                  size="sm"
                  w={{ base: '100%', xs: 180 }}
                  value={sortBy}
                  onChange={(v) => v && setSortBy(v)}
                  data={[
                    { value: 'recommended', label: t('fleet.recommended') },
                    { value: 'priceAsc', label: t('fleet.priceAsc') },
                    { value: 'priceDesc', label: t('fleet.priceDesc') },
                    { value: 'newest', label: t('fleet.newest') },
                  ]}
                  radius="xl"
                />
                <Group gap="xs">
                  <ActionIcon
                    variant={gridView ? 'filled' : 'subtle'}
                    color="teal"
                    onClick={() => setGridView(true)}
                    radius="xl"
                    size="lg"
                  >
                    <IconLayoutGrid size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant={!gridView ? 'filled' : 'subtle'}
                    color="teal"
                    onClick={() => setGridView(false)}
                    radius="xl"
                    size="lg"
                  >
                    <IconList size={18} />
                  </ActionIcon>
                </Group>
                {!isDesktop && (
                  <Button
                    variant="light"
                    color="teal"
                    leftSection={<IconFilter size={16} />}
                    rightSection={
                      activeFilterCount > 0 ? (
                        <Badge color="teal" size="xs" variant="filled" circle>
                          {activeFilterCount}
                        </Badge>
                      ) : null
                    }
                    onClick={() => setDrawerOpen(true)}
                    radius="xl"
                  >
                    {t('fleet.filters')}
                  </Button>
                )}
              </Group>
            </Group>

            {/* Filter sidebar + results grid */}
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {isDesktop && (
                <AnimatedSection direction="left" delay={0.15}>
                  <Box
                    className="filter-panel"
                    style={{
                      width: 310,
                      flexShrink: 0,
                      position: 'sticky',
                      top: 90,
                      maxHeight: 'calc(100vh - 110px)',
                      overflowY: 'auto',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {filterPanel}
                  </Box>
                </AnimatedSection>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" c="dimmed" mb="md">
                  {filtered.length} {t('fleet.results')}
                  {activeFilterCount > 0 && (
                    <>
                      {' · '}
                      <Text component="span" size="sm" c="teal" fw={500}>
                        {activeFilterCount} {t('fleet.activeFilters')}
                      </Text>
                      <Text
                        component="span"
                        size="sm"
                        c="dimmed"
                        ml={4}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={resetFleetToInitial}
                  >
                    <IconRotateClockwise size={12} style={{ verticalAlign: 'middle' }} /> {t('fleet.resetFilters')}
                      </Text>
                    </>
                  )}
                </Text>

                {paged.length > 0 ? (
                  <>
                    <StaggerContainer stagger={0.08}>
                      <SimpleGrid
                        cols={gridView ? { base: 1, sm: 2, lg: isDesktop ? 2 : 3 } : { base: 1 }}
                        spacing="lg"
                      >
                        {paged.map((vehicle, i) => (
                          <StaggerItem key={vehicle.id} scale>
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
                          />
                        </Group>
                      </AnimatedSection>
                    )}
                  </>
                ) : (
                  <AnimatedSection>
                    <EmptyState
                      title={t('fleet.noResults')}
                      description={t('fleet.noResultsDesc')}
                    />
                  </AnimatedSection>
                )}
              </div>
            </div>
          </Box>
        </AnimatedSection>

        <Drawer
          opened={drawerOpen && !isDesktop}
          onClose={() => setDrawerOpen(false)}
          title={t('fleet.filters')}
          position="left"
          size="sm"
        >
          {filterPanel}
        </Drawer>
      </Container>
    </motion.div>
  );
}
