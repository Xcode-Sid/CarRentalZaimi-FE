import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SimpleGrid,
  Paper,
  Text,
  Group,
  Stack,
  Title,
  ThemeIcon,
  Box,
  Table,
  Badge,
  Button,
  Progress,
  Avatar,
  Tooltip,
} from '@mantine/core';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import {
  IconCar,
  IconCalendar,
  IconCurrencyEuro,
  IconClipboardList,
  IconTrendingUp,
  IconTool,
  IconClock,
  IconPlus,
  IconEye,
  IconFileExport,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
// import { useBookings } from '../../contexts/BookingsContext';
// import { vehicles } from '../../data/vehicles';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';

function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let current = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setValue(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  return <>{prefix}{value.toLocaleString()}{suffix}</>;
}

const revenueData = [
  { month: 'Jan', revenue: 18000 },
  { month: 'Shk', revenue: 22000 },
  { month: 'Mar', revenue: 19500 },
  { month: 'Pri', revenue: 25000 },
  { month: 'Maj', revenue: 23000 },
  { month: 'Qer', revenue: 28000 },
];

const bookingsChartData = [
  { week: 'Java 1', rentals: 12 },
  { week: 'Java 2', rentals: 15 },
  { week: 'Java 3', rentals: 10 },
  { week: 'Java 4', rentals: 18 },
];

const popularCarsData = [
  { car: 'BMW X5', bookings: 28 },
  { car: 'Audi A4', bookings: 22 },
  { car: 'Mercedes GLE', bookings: 19 },
  { car: 'VW Golf', bookings: 16 },
  { car: 'Audi Q7', bookings: 14 },
];

const fleetData = [
  { name: 'Luksoze', value: 20, color: 'yellow.6' },
  { name: 'SUV', value: 30, color: 'green.6' },
  { name: 'Elektrike', value: 15, color: 'blue.6' },
  { name: 'Ekonomike', value: 35, color: 'gray.6' },
];

const kpiSparklines: Record<string, { data: { x: string; y: number }[]; color: string }> = {
  rentals: {
    data: [
      { x: '1', y: 18 }, { x: '2', y: 22 }, { x: '3', y: 19 }, { x: '4', y: 24 },
      { x: '5', y: 21 }, { x: '6', y: 26 }, { x: '7', y: 24 },
    ],
    color: 'teal.5',
  },
  cars: {
    data: [
      { x: '1', y: 42 }, { x: '2', y: 44 }, { x: '3', y: 43 }, { x: '4', y: 45 },
      { x: '5', y: 44 }, { x: '6', y: 46 }, { x: '7', y: 45 },
    ],
    color: 'teal.5',
  },
  revenue: {
    data: [
      { x: '1', y: 95 }, { x: '2', y: 102 }, { x: '3', y: 98 }, { x: '4', y: 115 },
      { x: '5', y: 110 }, { x: '6', y: 120 }, { x: '7', y: 125 },
    ],
    color: 'green.5',
  },
  bookings: {
    data: [
      { x: '1', y: 12 }, { x: '2', y: 15 }, { x: '3', y: 10 }, { x: '4', y: 18 },
      { x: '5', y: 14 }, { x: '6', y: 16 }, { x: '7', y: 18 },
    ],
    color: 'orange.5',
  },
};

const statusColors: Record<string, string> = {
  accepted: 'green',
  refused: 'red',
  finished: 'gray',
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // const { bookings } = useBookings();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const dateStr = time.toLocaleDateString('sq-AL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeStr = time.toLocaleTimeString('sq-AL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const availableCount = 0;
  const maintenanceCount = 0;
  const unavailableCount = 0;
  const total = 0;

  const kpis = [
    {
      title: t('admin.activeRentals'),
      value: 24,
      change: '+12%',
      changeLabel: t('admin.fromLastMonth'),
      icon: IconCalendar,
      color: 'teal',
      changeIcon: IconTrendingUp,
      cardClass: 'kpi-card-teal',
      sparkKey: 'rentals' as const,
    },
    {
      title: t('admin.availableCars'),
      value: 45,
      change: '3',
      changeLabel: t('admin.inMaintenance'),
      icon: IconCar,
      color: 'teal',
      changeIcon: IconTool,
      cardClass: 'kpi-card-teal',
      sparkKey: 'cars' as const,
    },
    {
      title: t('admin.totalRevenue'),
      value: 125400,
      prefix: '€',
      change: '+8%',
      changeLabel: t('admin.fromLastMonth'),
      icon: IconCurrencyEuro,
      color: 'green',
      changeIcon: IconTrendingUp,
      cardClass: 'kpi-card-green',
      sparkKey: 'revenue' as const,
    },
    {
      title: t('admin.newBookings'),
      value: 18,
      change: '5',
      changeLabel: t('admin.pendingBookings'),
      icon: IconClipboardList,
      color: 'orange',
      changeIcon: IconClock,
      cardClass: 'kpi-card-orange',
      sparkKey: 'bookings' as const,
    },
  ];

  // const recentBookings = bookings.slice(0, 5);

  const cashTotal = 0;
  const cardTotal = 0;
  const paymentsTotal = cashTotal + cardTotal;
  const cashPct = paymentsTotal ? Math.round((cashTotal / paymentsTotal) * 100) : 0;
  const cardPct = paymentsTotal ? 100 - cashPct : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Stack gap="xl">
        {/* Greeting Header */}
        <AnimatedSection delay={0.05}>
          <Box>
            <Title order={2} fw={800}>
              <Text component="span" inherit c="teal">
                {t('admin.greetingAdmin')}
              </Text>{' '}
              <motion.span
                style={{ display: 'inline-block' }}
                animate={{ y: [0, -8, 0], rotate: [0, 14, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                👋
              </motion.span>
            </Title>
            <Group gap="sm" mt={4}>
              <Text c="dimmed" size="sm">{t('admin.todayIs')} {dateStr}</Text>
              <Text c="teal" size="sm" fw={600} ff="monospace">{timeStr}</Text>
            </Group>
          </Box>
        </AnimatedSection>

        {/* KPI Cards */}
        <StaggerContainer stagger={0.1} delay={0.15}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {kpis.map((kpi) => {
              const spark = kpiSparklines[kpi.sparkKey];
              return (
                <StaggerItem key={kpi.title} scale>
                  <motion.div
                    whileHover={{
                      y: -6,
                      rotateX: 2,
                      rotateY: -2,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                  >
                    <Paper
                      className={`glass-card kpi-card ${kpi.cardClass} card-shimmer`}
                      p="lg"
                      radius="lg"
                      style={{ cursor: 'default' }}
                    >
                      <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>{kpi.title}</Text>
                        <motion.div
                          whileHover={{ rotate: 15, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <ThemeIcon
                            variant="light"
                            color={kpi.color}
                            size="lg"
                            radius="md"
                          >
                            <kpi.icon size={20} />
                          </ThemeIcon>
                        </motion.div>
                      </Group>
                      <Text size="2rem" fw={800}>
                        <AnimatedNumber target={kpi.value} prefix={kpi.prefix || ''} />
                      </Text>
                      <Group gap={4} mt="xs">
                        <kpi.changeIcon size={14} color={`var(--mantine-color-${kpi.color}-6)`} />
                        <Text size="xs" c={kpi.color} fw={500}>{kpi.change}</Text>
                        <Text size="xs" c="dimmed">{kpi.changeLabel}</Text>
                      </Group>
                      <Box mt="sm" style={{ opacity: 0.6 }}>
                        <AreaChart
                          h={40}
                          data={spark.data}
                          dataKey="x"
                          series={[{ name: 'y', color: spark.color }]}
                          withXAxis={false}
                          withYAxis={false}
                          withDots={false}
                          withTooltip={false}
                          gridAxis="none"
                          curveType="natural"
                          fillOpacity={0.3}
                        />
                      </Box>
                    </Paper>
                  </motion.div>
                </StaggerItem>
              );
            })}
          </SimpleGrid>
        </StaggerContainer>

        {/* Payment split */}
        <AnimatedSection delay={0.22}>
          <Paper className="glass-card" p="lg" radius="lg">
            <Group justify="space-between" mb="md" wrap="wrap">
              <Text fw={600}>{t('admin.paymentSplitTitle')}</Text>
              <Text size="xs" c="dimmed">
                {t('admin.paymentSplitTotal')}{' '}
                <Text component="span" fw={700} c="teal">
                  €<AnimatedNumber target={paymentsTotal} />
                </Text>
              </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Box>
                <Group justify="space-between" mb={6}>
                  <Group gap={8}>
                    <Badge variant="light" color="teal">
                      {t('admin.paymentSplitCard')}
                    </Badge>
                    <Text size="xs" c="dimmed">{cardPct}%</Text>
                  </Group>
                  <Text fw={800}>
                    €<AnimatedNumber target={cardTotal} />
                  </Text>
                </Group>
                <Progress.Root size={14} radius="xl">
                  <Progress.Section value={paymentsTotal ? (cardTotal / paymentsTotal) * 100 : 0} color="teal" />
                </Progress.Root>
              </Box>

              <Box>
                <Group justify="space-between" mb={6}>
                  <Group gap={8}>
                    <Badge variant="light" color="gray">
                      {t('admin.paymentSplitCash')}
                    </Badge>
                    <Text size="xs" c="dimmed">{cashPct}%</Text>
                  </Group>
                  <Text fw={800}>
                    €<AnimatedNumber target={cashTotal} />
                  </Text>
                </Group>
                <Progress.Root size={14} radius="xl">
                  <Progress.Section value={paymentsTotal ? (cashTotal / paymentsTotal) * 100 : 0} color="gray" />
                </Progress.Root>
              </Box>
            </SimpleGrid>
          </Paper>
        </AnimatedSection>

        {/* Quick Actions */}
        <AnimatedSection delay={0.3}>
          <Paper className="glass-card" p="lg" radius="lg">
            <Text fw={600} mb="md">{t('admin.quickActions')}</Text>
            <Group gap="md" wrap="wrap">
              <Tooltip label={t('admin.addNewCar')}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    variant="filled"
                    color="teal"
                    onClick={() => navigate('/admin/cars')}
                    className="ripple-btn"
                  >
                    {t('admin.addNewCar')}
                  </Button>
                </motion.div>
              </Tooltip>
              <Tooltip label={t('admin.viewBookings')}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    leftSection={<IconEye size={16} />}
                    variant="outline"
                    color="teal"
                    onClick={() => navigate('/admin/bookings')}
                    className="ripple-btn"
                  >
                    {t('admin.viewBookings')}
                  </Button>
                </motion.div>
              </Tooltip>
              <Tooltip label={t('admin.exportReport')}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    leftSection={<IconFileExport size={16} />}
                    variant="outline"
                    color="gray"
                    onClick={() => navigate('/admin/reports')}
                    className="ripple-btn"
                  >
                    {t('admin.exportReport')}
                  </Button>
                </motion.div>
              </Tooltip>
            </Group>
          </Paper>
        </AnimatedSection>

        {/* Fleet Status Bar */}
        <AnimatedSection delay={0.35}>
          <Paper className="glass-card" p="lg" radius="lg">
            <Text fw={600} mb="md">{t('admin.fleetStatus')}</Text>
            <Progress.Root size={28} radius="xl">
              <Tooltip label={`${t('admin.available')}: ${availableCount}`}>
                <Progress.Section value={(availableCount / total) * 100} color="green">
                  <Progress.Label>{t('admin.available')} ({availableCount})</Progress.Label>
                </Progress.Section>
              </Tooltip>
              <Tooltip label={`${t('admin.maintenance')}: ${maintenanceCount}`}>
                <Progress.Section value={(maintenanceCount / total) * 100} color="orange">
                  <Progress.Label>{t('admin.maintenance')} ({maintenanceCount})</Progress.Label>
                </Progress.Section>
              </Tooltip>
              <Tooltip label={`${t('admin.unavailable')}: ${unavailableCount}`}>
                <Progress.Section value={(unavailableCount / total) * 100} color="red">
                  <Progress.Label>{t('admin.unavailable')} ({unavailableCount})</Progress.Label>
                </Progress.Section>
              </Tooltip>
            </Progress.Root>
          </Paper>
        </AnimatedSection>

        {/* Charts Row 1 */}
        <StaggerContainer stagger={0.15} delay={0.1}>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <StaggerItem direction="left">
              <Paper className="glass-card" p="lg" radius="lg">
                <Text fw={600} mb="md">{t('admin.revenueOverview')}</Text>
                <AreaChart
                  h={250}
                  data={revenueData}
                  dataKey="month"
                  series={[{ name: 'revenue', color: 'teal.6' }]}
                  curveType="natural"
                  gridAxis="xy"
                  withDots
                  withTooltip
                  tooltipAnimationDuration={200}
                  fillOpacity={0.3}
                />
              </Paper>
            </StaggerItem>

            <StaggerItem direction="right">
              <Paper className="glass-card" p="lg" radius="lg">
                <Text fw={600} mb="md">{t('admin.bookingsOverview')}</Text>
                <BarChart
                  h={250}
                  data={bookingsChartData}
                  dataKey="week"
                  series={[{ name: 'rentals', color: 'teal.6' }]}
                  withTooltip
                  tooltipAnimationDuration={200}
                  withLegend
                />
              </Paper>
            </StaggerItem>
          </SimpleGrid>
        </StaggerContainer>

        {/* Charts Row 2 */}
        <StaggerContainer stagger={0.15} delay={0.1}>
          <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
            <StaggerItem direction="left">
              <Paper className="glass-card" p="lg" radius="lg">
                <Text fw={600} mb="md">{t('admin.popularCars')}</Text>
                <BarChart
                  h={250}
                  data={popularCarsData}
                  dataKey="car"
                  series={[{ name: 'bookings', color: 'teal.6' }]}
                  orientation="vertical"
                  withTooltip
                  tooltipAnimationDuration={200}
                />
              </Paper>
            </StaggerItem>

            <StaggerItem direction="right">
              <Paper className="glass-card" p="lg" radius="lg">
                <Text fw={600} mb="md">{t('admin.fleetDistribution')}</Text>
                <Group justify="center">
                  <DonutChart
                    data={fleetData}
                    size={220}
                    thickness={30}
                    withLabelsLine
                    withLabels
                    tooltipDataSource="segment"
                  />
                </Group>
              </Paper>
            </StaggerItem>
          </SimpleGrid>
        </StaggerContainer>

        {/* Recent Bookings Table */}
        <AnimatedSection delay={0.15}>
          <Paper className="glass-card" p="lg" radius="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600}>{t('admin.recentBookings')}</Text>
              <Button
                variant="subtle"
                size="xs"
                color="teal"
                onClick={() => navigate('/admin/bookings')}
              >
                {t('admin.viewBookings')}
              </Button>
            </Group>
            {/* {recentBookings.length === 0 ? (
              <Stack align="center" py="xl" gap="md">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ThemeIcon size={60} variant="light" color="gray" radius="xl">
                    <IconCalendar size={30} />
                  </ThemeIcon>
                </motion.div>
                <Text c="dimmed" ta="center">{t('admin.noBookings')}</Text>
                <Button variant="light" color="teal" onClick={() => navigate('/admin/bookings')}>
                  {t('admin.viewBookings')}
                </Button>
              </Stack>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>ID</Table.Th>
                      <Table.Th>{t('admin.customer')}</Table.Th>
                      <Table.Th>{t('admin.vehicle')}</Table.Th>
                      <Table.Th>{t('admin.total')}</Table.Th>
                      <Table.Th>{t('admin.status')}</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    
                    {recentBookings.map((b, idx) => (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                        style={{ transition: 'background 0.2s', cursor: 'pointer' }}
                      >
                        <Table.Td>
                          <Text size="sm" fw={500}>{b.ref}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="sm">
                            <Avatar size="sm" radius="xl" color="teal">
                              {b.userId === 'user-1' ? 'AH' : '??'}
                            </Avatar>
                            <Text size="sm">
                              {b.userId === 'user-1' ? 'Artan Hoxha' : 'Guest'}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>{b.vehicleName}</Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={600}>€{b.total.toLocaleString()}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={statusColors[b.status]}
                            variant="light"
                            size="sm"
                            className={b.status === 'accepted' ? 'badge-pulse' : ''}
                          >
                            {t(`account.${b.status}`)}
                          </Badge>
                        </Table.Td>
                      </motion.tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )} */}
          </Paper>
        </AnimatedSection>
      </Stack>
    </motion.div>
  );
}
