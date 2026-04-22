import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SimpleGrid, Paper, Text, Group, Stack, Title, ThemeIcon, Box, Table,
  Badge, Button, Progress, Avatar, Tooltip, Rating, Skeleton, Select,
} from '@mantine/core';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import {
  IconCar, IconCalendar, IconCurrencyEuro, IconClipboardList,
  IconTool, IconClock, IconPlus, IconEye, IconFileExport,
  IconUsers, IconRosetteDiscount, IconMail, IconStar, IconArrowUpRight,
  IconArrowDownRight, IconCalendarEvent, IconCalendarCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import {
  BOOKING_STATUS_INT, BOOKING_STATUS_CHART_COLOR, BOOKING_STATUS_I18N,
  FLEET_CATEGORY_COLORS, SPARKLINE_COLORS,
} from '../../constants/colors';
import { FALLBACK_SPARKLINES } from '../../data/dashboardData';
import type {
  DashboardKpis, DashboardSparkline, PaymentSplit, FleetStatus,
  RevenuePoint, BookingsChartPoint, PopularCar, FleetCategory,
  BookingsByStatus, CustomerGrowthPoint, TopCustomer, RecentReview,
  TodayActivity, RecentBooking,
} from '../../types/dashboard';
import { dashboardApi } from '../../services/dashboardApi';
import { WidgetDateFilter, useWidgetDates } from '../../components/common/WidgetDateFilter';
import {
  cardHover3d, iconSpin, buttonPop, listItemSlide, emptyStateFloat,
  chartContainerVariants, badgePopIn, smoothEase,
} from '../../constants/animations';

const BOOKING_STATUSES = ['Pending', 'Accepted', 'Refused', 'Done', 'Cancelled'];
const DEFAULT_LIMIT = 5;
const LIMIT_STEP = 5;

function resolveBookingStatus(status: number | null, isCanceled?: boolean): string {
  if (isCanceled) return 'Cancelled';
  if (status === null || status === undefined) return 'Pending';
  return BOOKING_STATUS_INT[status] ?? 'Pending';
}

function AnimatedNumber({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const frames = 1500 / 16;
    const step = target / frames;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      setValue(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{value.toLocaleString()}{suffix}</>;
}

function WidgetSkeleton({ h = 180 }: { h?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Skeleton h={h} radius="lg" className="skeleton-shimmer" />
    </motion.div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  // Per-widget date filters
  const kpisDates = useWidgetDates();
  const paymentDates = useWidgetDates();
  const revenueDates = useWidgetDates();
  const bookingsChartDates = useWidgetDates();
  const popularDates = useWidgetDates();
  const byStatusDates = useWidgetDates();
  const growthDates = useWidgetDates();
  const topCustDates = useWidgetDates();

  // Status filters
  const [bookingsStatusFilter, setBookingsStatusFilter] = useState<string | null>(null);
  const [recentBookingsStatus, setRecentBookingsStatus] = useState<string | null>(null);

  // Limits
  const [popularCarsLimit, setPopularCarsLimit] = useState(DEFAULT_LIMIT);
  const [topCustomersLimit, setTopCustomersLimit] = useState(DEFAULT_LIMIT);
  const [recentReviewsLimit, setRecentReviewsLimit] = useState(DEFAULT_LIMIT);
  const [recentBookingsLimit, setRecentBookingsLimit] = useState(DEFAULT_LIMIT);

  // Widget data
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [sparklines, setSparklines] = useState<Record<string, DashboardSparkline>>(FALLBACK_SPARKLINES);
  const [paymentSplit, setPaymentSplit] = useState<PaymentSplit | null>(null);
  const [fleetStatus, setFleetStatus] = useState<FleetStatus | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[] | null>(null);
  const [bookingsChart, setBookingsChart] = useState<BookingsChartPoint[] | null>(null);
  const [popularCars, setPopularCars] = useState<PopularCar[] | null>(null);
  const [fleetDistribution, setFleetDistribution] = useState<FleetCategory[] | null>(null);
  const [bookingsByStatus, setBookingsByStatus] = useState<BookingsByStatus[] | null>(null);
  const [customerGrowth, setCustomerGrowth] = useState<CustomerGrowthPoint[] | null>(null);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[] | null>(null);
  const [recentReviews, setRecentReviews] = useState<RecentReview[] | null>(null);
  const [todayActivity, setTodayActivity] = useState<TodayActivity | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[] | null>(null);

  // Loading states
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingSparklines, setLoadingSparklines] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingBookingsChart, setLoadingBookingsChart] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingDistribution, setLoadingDistribution] = useState(true);
  const [loadingByStatus, setLoadingByStatus] = useState(true);
  const [loadingGrowth, setLoadingGrowth] = useState(true);
  const [loadingTopCustomers, setLoadingTopCustomers] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingRecentBookings, setLoadingRecentBookings] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Non-date widgets: fetch once on mount
  useEffect(() => {
    setLoadingSparklines(true);
    dashboardApi.sparklines().then(r => { if (r.success && r.data) setSparklines(r.data); }).catch(() => {}).finally(() => setLoadingSparklines(false));

    setLoadingFleet(true);
    dashboardApi.fleetStatus().then(r => { if (r.success && r.data) setFleetStatus(r.data); }).catch(() => {}).finally(() => setLoadingFleet(false));

    setLoadingDistribution(true);
    dashboardApi.fleetDistribution().then(r => { if (r.success && r.data) setFleetDistribution(r.data); }).catch(() => {}).finally(() => setLoadingDistribution(false));

    setLoadingToday(true);
    dashboardApi.todayActivity().then(r => { if (r.success && r.data) setTodayActivity(r.data); }).catch(() => {}).finally(() => setLoadingToday(false));
  }, []);

  // Per-widget date-driven fetches
  useEffect(() => {
    setLoadingKpis(true);
    dashboardApi.kpis(kpisDates.params()).then(r => { if (r.success && r.data) setKpis(r.data); }).catch(() => {}).finally(() => setLoadingKpis(false));
  }, [kpisDates.range]);

  useEffect(() => {
    setLoadingPayment(true);
    dashboardApi.paymentSplit(paymentDates.params()).then(r => { if (r.success && r.data) setPaymentSplit(r.data); }).catch(() => {}).finally(() => setLoadingPayment(false));
  }, [paymentDates.range]);

  useEffect(() => {
    setLoadingRevenue(true);
    dashboardApi.revenueChart(revenueDates.params()).then(r => { if (r.success && r.data) setRevenueChart(r.data); }).catch(() => {}).finally(() => setLoadingRevenue(false));
  }, [revenueDates.range]);

  useEffect(() => {
    setLoadingBookingsChart(true);
    dashboardApi.bookingsChart(bookingsChartDates.params()).then(r => { if (r.success && r.data) setBookingsChart(r.data); }).catch(() => {}).finally(() => setLoadingBookingsChart(false));
  }, [bookingsChartDates.range]);

  useEffect(() => {
    setLoadingPopular(true);
    dashboardApi.popularCars({ ...popularDates.params(), limit: popularCarsLimit }).then(r => { if (r.success && r.data) setPopularCars(r.data); }).catch(() => {}).finally(() => setLoadingPopular(false));
  }, [popularDates.range, popularCarsLimit]);

  useEffect(() => {
    setLoadingByStatus(true);
    dashboardApi.bookingsByStatus({ ...byStatusDates.params(), status: bookingsStatusFilter ?? undefined }).then(r => { if (r.success && r.data) setBookingsByStatus(r.data); }).catch(() => {}).finally(() => setLoadingByStatus(false));
  }, [byStatusDates.range, bookingsStatusFilter]);

  useEffect(() => {
    setLoadingGrowth(true);
    dashboardApi.customerGrowth(growthDates.params()).then(r => { if (r.success && r.data) setCustomerGrowth(r.data); }).catch(() => {}).finally(() => setLoadingGrowth(false));
  }, [growthDates.range]);

  useEffect(() => {
    setLoadingTopCustomers(true);
    dashboardApi.topCustomers({ ...topCustDates.params(), limit: topCustomersLimit }).then(r => { if (r.success && r.data) setTopCustomers(r.data); }).catch(() => {}).finally(() => setLoadingTopCustomers(false));
  }, [topCustDates.range, topCustomersLimit]);

  // Limit-only widgets
  useEffect(() => {
    setLoadingReviews(true);
    dashboardApi.recentReviews(recentReviewsLimit).then(r => { if (r.success && r.data) setRecentReviews(r.data); }).catch(() => {}).finally(() => setLoadingReviews(false));
  }, [recentReviewsLimit]);

  useEffect(() => {
    setLoadingRecentBookings(true);
    dashboardApi.recentBookings({ limit: recentBookingsLimit, status: recentBookingsStatus ?? undefined }).then(r => { if (r.success && r.data) setRecentBookings(r.data); }).catch(() => {}).finally(() => setLoadingRecentBookings(false));
  }, [recentBookingsLimit, recentBookingsStatus]);

  const dateStr = time.toLocaleDateString('sq-AL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = time.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const k = kpis;
  const paymentsTotal = paymentSplit ? paymentSplit.cashTotal + paymentSplit.cardTotal : 0;
  const cashPct = paymentsTotal ? Math.round((paymentSplit!.cashTotal / paymentsTotal) * 100) : 0;
  const cardPct = paymentsTotal ? 100 - cashPct : 0;

  const kpiCards = k ? [
    { title: t('admin.activeRentals'), value: k.activeRentals, change: k.activeRentalsChange > 0 ? `+${k.activeRentalsChange}%` : `${k.activeRentalsChange}%`, changeLabel: t('admin.fromLastMonth'), icon: IconCalendar, color: 'teal', changeIcon: k.activeRentalsChange >= 0 ? IconArrowUpRight : IconArrowDownRight, cardClass: 'kpi-card-teal', sparkKey: 'rentals' },
    { title: t('admin.availableCars'), value: k.availableCars, change: String(k.carsInMaintenance), changeLabel: t('admin.inMaintenance'), icon: IconCar, color: 'teal', changeIcon: IconTool, cardClass: 'kpi-card-teal', sparkKey: 'cars' },
    { title: t('admin.totalRevenue'), value: k.totalRevenue, prefix: '€', change: k.revenueChange > 0 ? `+${k.revenueChange}%` : `${k.revenueChange}%`, changeLabel: t('admin.fromLastMonth'), icon: IconCurrencyEuro, color: 'green', changeIcon: k.revenueChange >= 0 ? IconArrowUpRight : IconArrowDownRight, cardClass: 'kpi-card-green', sparkKey: 'revenue' },
    { title: t('admin.newBookings'), value: k.newBookings, change: String(k.pendingBookings), changeLabel: t('admin.pendingBookings'), icon: IconClipboardList, color: 'orange', changeIcon: IconClock, cardClass: 'kpi-card-orange', sparkKey: 'bookings' },
  ] : [];

  const statusSelectData = [
    { value: '', label: t('admin.allStatuses') },
    ...BOOKING_STATUSES.map(s => ({ value: s, label: t(BOOKING_STATUS_I18N[s] ?? `status.${s.toLowerCase()}`) })),
  ];

  return (
    <Stack gap="xl">
      {/* Greeting Header */}
      <AnimatedSection delay={0.05}>
        <Box>
          <Title order={2} fw={800}>
            <motion.span style={{ display: 'inline-block' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <Text component="span" inherit c="teal">{t('admin.greetingAdmin')}</Text>
            </motion.span>{' '}
            <motion.span style={{ display: 'inline-block', transformOrigin: '70% 70%' }} animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}>👋</motion.span>
          </Title>
          <Group gap="sm" mt={4}>
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Text c="dimmed" size="sm">{t('admin.todayIs')} {dateStr}</Text>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}>
              <Text c="teal" size="sm" fw={600} ff="monospace">{timeStr}</Text>
            </motion.div>
          </Group>
        </Box>
      </AnimatedSection>

      {/* KPI Cards */}
      <Box>
        <Group justify="flex-end" mb="sm">
          <WidgetDateFilter value={kpisDates.range} onChange={kpisDates.setRange} />
        </Group>
        {loadingKpis || loadingSparklines ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {[1, 2, 3, 4].map(i => <WidgetSkeleton key={i} />)}
          </SimpleGrid>
        ) : kpiCards.length > 0 && (
          <StaggerContainer stagger={0.12} delay={0.15}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              {kpiCards.map((kpi) => {
                const spark = sparklines[kpi.sparkKey] ?? FALLBACK_SPARKLINES.rentals;
                const sparkColor = SPARKLINE_COLORS[kpi.sparkKey] ?? 'teal.5';
                return (
                  <StaggerItem key={kpi.title} scale>
                    <motion.div {...cardHover3d}>
                      <Paper className={`glass-card kpi-card ${kpi.cardClass} card-shimmer animated-border-glow`} p="lg" radius="lg" style={{ cursor: 'default' }}>
                        <Group justify="space-between" mb="xs">
                          <Text size="sm" c="dimmed" fw={500}>{kpi.title}</Text>
                          <motion.div {...iconSpin}><ThemeIcon variant="light" color={kpi.color} size="lg" radius="md"><kpi.icon size={20} /></ThemeIcon></motion.div>
                        </Group>
                        <Text size="2rem" fw={800}><AnimatedNumber target={kpi.value} prefix={kpi.prefix || ''} /></Text>
                        <Group gap={4} mt="xs">
                          <kpi.changeIcon size={14} color={`var(--mantine-color-${kpi.color}-6)`} />
                          <Text size="xs" c={kpi.color} fw={500}>{kpi.change}</Text>
                          <Text size="xs" c="dimmed">{kpi.changeLabel}</Text>
                        </Group>
                        <Box mt="sm" style={{ opacity: 0.6 }}>
                          <AreaChart h={40} data={spark.data} dataKey="x" series={[{ name: 'y', color: sparkColor }]} withXAxis={false} withYAxis={false} withDots={false} withTooltip={false} gridAxis="none" curveType="natural" fillOpacity={0.3} />
                        </Box>
                      </Paper>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </SimpleGrid>
          </StaggerContainer>
        )}
      </Box>

      {/* Today's Activity + Mini Stats */}
      {loadingToday || loadingKpis ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {[1, 2, 3, 4].map(i => <WidgetSkeleton key={i} h={100} />)}
        </SimpleGrid>
      ) : k && todayActivity && (
        <StaggerContainer stagger={0.1} delay={0.1}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {[
              { label: t('admin.todayPickups'), value: todayActivity.pickups, icon: IconCalendarEvent, color: 'cyan' },
              { label: t('admin.todayReturns'), value: todayActivity.returns, icon: IconCalendarCheck, color: 'indigo' },
              { label: t('admin.avgRating'), value: k.averageRating, icon: IconStar, color: 'yellow', isRating: true },
              { label: t('admin.totalCustomers'), value: k.totalCustomers, icon: IconUsers, color: 'grape' },
            ].map((item) => (
              <StaggerItem key={item.label} scale>
                <motion.div whileHover={{ y: -5, boxShadow: '0 12px 28px rgba(0,0,0,0.1)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Paper className="glass-card animated-border-glow" p="lg" radius="lg" h="100%">
                    <Group gap="sm" mb="xs">
                      <motion.div {...iconSpin}><ThemeIcon variant="light" color={item.color} size="lg" radius="md"><item.icon size={20} /></ThemeIcon></motion.div>
                      <Text size="sm" c="dimmed" fw={500}>{item.label}</Text>
                    </Group>
                    {item.isRating ? (
                      <Group gap="xs" align="baseline">
                        <Text size="2rem" fw={800} c={item.color}>{(item.value as number).toFixed(1)}</Text>
                        <Rating value={item.value as number} fractions={2} readOnly size="sm" />
                      </Group>
                    ) : (
                      <Text size="2rem" fw={800} c={item.color}><AnimatedNumber target={item.value as number} /></Text>
                    )}
                  </Paper>
                </motion.div>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      )}

      {/* Mini KPI badges */}
      {loadingKpis ? (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {[1, 2, 3].map(i => <WidgetSkeleton key={i} h={70} />)}
        </SimpleGrid>
      ) : k && (
        <StaggerContainer stagger={0.1} delay={0.12}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {[
              { label: t('admin.activePromotions'), val: k.activePromotions, icon: IconRosetteDiscount, color: 'teal' },
              { label: t('admin.subscribers'), val: k.subscriberCount, icon: IconMail, color: 'blue' },
              { label: t('admin.pendingBookings'), val: k.pendingBookings, icon: IconClock, color: 'orange' },
            ].map((item) => (
              <StaggerItem key={item.label} scale>
                <motion.div whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Paper className="glass-card" p="md" radius="lg">
                    <Group gap="sm">
                      <motion.div {...iconSpin}><ThemeIcon variant="light" color={item.color} size="md" radius="md"><item.icon size={18} /></ThemeIcon></motion.div>
                      <Box>
                        <Text size="xs" c="dimmed">{item.label}</Text>
                        <Text fw={700} size="lg">{item.val}</Text>
                      </Box>
                    </Group>
                  </Paper>
                </motion.div>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      )}

      {/* Payment split */}
      {loadingPayment ? <WidgetSkeleton h={120} /> : paymentSplit && (
        <AnimatedSection delay={0.15}>
          <Paper className="glass-card chart-card" p="lg" radius="lg">
            <Group justify="space-between" mb="md" wrap="wrap">
              <Text fw={600}>{t('admin.paymentSplitTitle')}</Text>
              <Group gap="md" wrap="wrap">
                <WidgetDateFilter value={paymentDates.range} onChange={paymentDates.setRange} />
                <Text size="xs" c="dimmed">{t('admin.paymentSplitTotal')}{' '}<Text component="span" fw={700} c="teal">€<AnimatedNumber target={paymentsTotal} /></Text></Text>
              </Group>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <Box>
                <Group justify="space-between" mb={6}>
                  <Group gap={8}><motion.div {...badgePopIn(0.1)}><Badge variant="light" color="teal">{t('admin.paymentSplitCard')}</Badge></motion.div><Text size="xs" c="dimmed">{cardPct}%</Text></Group>
                  <Text fw={800}>€<AnimatedNumber target={paymentSplit.cardTotal} /></Text>
                </Group>
                <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }} style={{ transformOrigin: 'left' }}>
                  <Progress.Root size={14} radius="xl"><Progress.Section value={paymentsTotal ? (paymentSplit.cardTotal / paymentsTotal) * 100 : 0} color="teal" /></Progress.Root>
                </motion.div>
              </Box>
              <Box>
                <Group justify="space-between" mb={6}>
                  <Group gap={8}><motion.div {...badgePopIn(0.2)}><Badge variant="light" color="gray">{t('admin.paymentSplitCash')}</Badge></motion.div><Text size="xs" c="dimmed">{cashPct}%</Text></Group>
                  <Text fw={800}>€<AnimatedNumber target={paymentSplit.cashTotal} /></Text>
                </Group>
                <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1, ease: [0.34, 1.56, 0.64, 1] }} style={{ transformOrigin: 'left' }}>
                  <Progress.Root size={14} radius="xl"><Progress.Section value={paymentsTotal ? (paymentSplit.cashTotal / paymentsTotal) * 100 : 0} color="gray" /></Progress.Root>
                </motion.div>
              </Box>
            </SimpleGrid>
          </Paper>
        </AnimatedSection>
      )}

      {/* Quick Actions */}
      <AnimatedSection delay={0.18}>
        <Paper className="glass-card" p="lg" radius="lg">
          <Text fw={600} mb="md">{t('admin.quickActions')}</Text>
          <Group gap="md" wrap="wrap">
            {[
              { label: t('admin.addNewCar'), icon: <IconPlus size={16} />, variant: 'filled' as const, color: 'teal', to: '/admin/cars' },
              { label: t('admin.viewBookings'), icon: <IconEye size={16} />, variant: 'outline' as const, color: 'teal', to: '/admin/bookings' },
              { label: t('admin.exportReport'), icon: <IconFileExport size={16} />, variant: 'outline' as const, color: 'gray', to: '/admin/reports' },
            ].map((action) => (
              <motion.div key={action.to} {...buttonPop}>
                <Tooltip label={action.label}><Button leftSection={action.icon} variant={action.variant} color={action.color} onClick={() => navigate(action.to)} className="ripple-btn">{action.label}</Button></Tooltip>
              </motion.div>
            ))}
          </Group>
        </Paper>
      </AnimatedSection>

      {/* Fleet Status Bar */}
      {loadingFleet ? <WidgetSkeleton h={90} /> : fleetStatus && (
        <AnimatedSection delay={0.2}>
          <Paper className="glass-card chart-card" p="lg" radius="lg">
            <Text fw={600} mb="md">{t('admin.fleetStatus')}</Text>
            {fleetStatus.total > 0 ? (
              <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }} style={{ transformOrigin: 'left' }}>
                <Progress.Root size={28} radius="xl">
                  <Tooltip label={`${t('admin.available')}: ${fleetStatus.available}`}><Progress.Section value={(fleetStatus.available / fleetStatus.total) * 100} color="green"><Progress.Label>{t('admin.available')} ({fleetStatus.available})</Progress.Label></Progress.Section></Tooltip>
                  <Tooltip label={`${t('admin.maintenance')}: ${fleetStatus.maintenance}`}><Progress.Section value={(fleetStatus.maintenance / fleetStatus.total) * 100} color="orange"><Progress.Label>{t('admin.maintenance')} ({fleetStatus.maintenance})</Progress.Label></Progress.Section></Tooltip>
                  <Tooltip label={`${t('admin.unavailable')}: ${fleetStatus.unavailable}`}><Progress.Section value={(fleetStatus.unavailable / fleetStatus.total) * 100} color="red"><Progress.Label>{t('admin.unavailable')} ({fleetStatus.unavailable})</Progress.Label></Progress.Section></Tooltip>
                </Progress.Root>
              </motion.div>
            ) : <Text c="dimmed" ta="center" py="md">{t('admin.noFleetData')}</Text>}
          </Paper>
        </AnimatedSection>
      )}

      {/* Charts Row 1: Revenue + Bookings */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('admin.revenueOverview')}</Text>
                  <WidgetDateFilter value={revenueDates.range} onChange={revenueDates.setRange} />
                </Group>
                {loadingRevenue ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : revenueChart && revenueChart.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <AreaChart h={250} data={revenueChart.map(d => ({ ...d, [t('chartLabels.revenue')]: d.revenue }))} dataKey="month" series={[{ name: t('chartLabels.revenue'), color: 'teal.6' }]} curveType="natural" gridAxis="xy" withDots withTooltip tooltipAnimationDuration={200} fillOpacity={0.3} />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('admin.bookingsOverview')}</Text>
                  <WidgetDateFilter value={bookingsChartDates.range} onChange={bookingsChartDates.setRange} />
                </Group>
                {loadingBookingsChart ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : bookingsChart && bookingsChart.length > 0 ? (
                  <motion.div initial={{ opacity: 0, scaleY: 0.8 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }} style={{ transformOrigin: 'bottom' }}>
                    <BarChart h={250} data={bookingsChart.map(d => ({ ...d, [t('chartLabels.rentals')]: d.rentals }))} dataKey="week" series={[{ name: t('chartLabels.rentals'), color: 'teal.6' }]} withTooltip tooltipAnimationDuration={200} withLegend />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Charts Row 2: Popular Cars + Bookings by Status */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('admin.popularCars')}</Text>
                  <Group gap="sm" wrap="wrap">
                    <WidgetDateFilter value={popularDates.range} onChange={popularDates.setRange} />
                    <Button variant="subtle" size="xs" color="teal" onClick={() => setPopularCarsLimit(prev => prev + LIMIT_STEP)}>{t('admin.showMore')}</Button>
                  </Group>
                </Group>
                {loadingPopular ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : popularCars && popularCars.length > 0 ? (
                  <motion.div initial={{ opacity: 0, scaleX: 0.8 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }} style={{ transformOrigin: 'left' }}>
                    <BarChart h={250} data={popularCars.map(d => ({ ...d, [t('chartLabels.bookings')]: d.bookings }))} dataKey="car" series={[{ name: t('chartLabels.bookings'), color: 'teal.6' }]} orientation="vertical" withTooltip tooltipAnimationDuration={200} />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('admin.bookingsByStatus')}</Text>
                  <Group gap="sm" wrap="wrap">
                    <WidgetDateFilter value={byStatusDates.range} onChange={byStatusDates.setRange} />
                    <Select size="xs" w={150} data={statusSelectData} value={bookingsStatusFilter ?? ''} onChange={(val) => setBookingsStatusFilter(val || null)} placeholder={t('admin.allStatuses')} clearable={false} />
                  </Group>
                </Group>
                {loadingByStatus ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : bookingsByStatus && bookingsByStatus.length > 0 ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: smoothEase }}>
                    <Group justify="center">
                      <DonutChart data={bookingsByStatus.map(s => ({ name: t(BOOKING_STATUS_I18N[s.name] ?? `status.${s.name.toLowerCase()}`), value: s.value, color: BOOKING_STATUS_CHART_COLOR[s.name] ?? 'gray.6' }))} size={220} thickness={30} withLabelsLine withLabels tooltipDataSource="segment" />
                    </Group>
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Charts Row 3: Fleet Distribution + Customer Growth */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Text fw={600} mb="md">{t('admin.fleetDistribution')}</Text>
                {loadingDistribution ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : fleetDistribution && fleetDistribution.length > 0 ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0, rotate: -10 }} whileInView={{ scale: 1, opacity: 1, rotate: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: smoothEase }}>
                    <Group justify="center">
                      <DonutChart data={fleetDistribution.map(c => ({ ...c, color: FLEET_CATEGORY_COLORS[c.name] ?? 'gray.6' }))} size={220} thickness={30} withLabelsLine withLabels tooltipDataSource="segment" />
                    </Group>
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('admin.customerGrowth')}</Text>
                  <WidgetDateFilter value={growthDates.range} onChange={growthDates.setRange} />
                </Group>
                {loadingGrowth ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : customerGrowth && customerGrowth.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <AreaChart h={250} data={customerGrowth.map(d => ({ ...d, [t('chartLabels.customers')]: d.customers }))} dataKey="month" series={[{ name: t('chartLabels.customers'), color: 'grape.6' }]} curveType="natural" gridAxis="xy" withDots withTooltip tooltipAnimationDuration={200} fillOpacity={0.3} />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Top Customers + Recent Reviews */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <Paper className="glass-card chart-card" p="lg" radius="lg">
              <Group justify="space-between" mb="md" wrap="wrap">
                <Text fw={600}>{t('admin.topCustomers')}</Text>
                <Group gap="xs" wrap="wrap">
                  <WidgetDateFilter value={topCustDates.range} onChange={topCustDates.setRange} />
                  <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => setTopCustomersLimit(prev => prev + LIMIT_STEP)}>{t('admin.showMore')}</Button></motion.div>
                  <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => navigate('/admin/customers')}>{t('admin.viewAll')}</Button></motion.div>
                </Group>
              </Group>
              {loadingTopCustomers ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : topCustomers && topCustomers.length > 0 ? (
                <Stack gap="sm">
                  {topCustomers.map((c, i) => (
                    <motion.div key={c.name} {...listItemSlide(i, 'left')}>
                      <Group justify="space-between" p="xs" className="list-row-animated" style={{ background: 'var(--mantine-color-dark-6)', opacity: 0.9 }}>
                        <Group gap="sm"><Avatar size="sm" radius="xl" color="teal">{c.initials}</Avatar><Box><Text size="sm" fw={500}>{c.name}</Text><Text size="xs" c="dimmed">{c.totalBookings} {t('admin.rentals').toLowerCase()}</Text></Box></Group>
                        <Text size="sm" fw={700} c="teal">€{c.totalSpent.toLocaleString()}</Text>
                      </Group>
                    </motion.div>
                  ))}
                </Stack>
              ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
            </Paper>
          </StaggerItem>
          <StaggerItem direction="right">
            <Paper className="glass-card chart-card" p="lg" radius="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>{t('admin.recentReviews')}</Text>
                <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => setRecentReviewsLimit(prev => prev + LIMIT_STEP)}>{t('admin.showMore')}</Button></motion.div>
              </Group>
              {loadingReviews ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : recentReviews && recentReviews.length > 0 ? (
                <Stack gap="sm">
                  {recentReviews.map((r, i) => (
                    <motion.div key={r.id} {...listItemSlide(i, 'right')}>
                      <Box p="xs" className="list-row-animated" style={{ background: 'var(--mantine-color-dark-6)', opacity: 0.9 }}>
                        <Group justify="space-between" mb={4}><Group gap="xs"><Text size="sm" fw={600}>{r.carName}</Text><Text size="xs" c="dimmed">— {r.userName}</Text></Group><motion.div {...badgePopIn(i * 0.05 + 0.1)}><Rating value={r.rating} readOnly size="xs" /></motion.div></Group>
                        <Text size="xs" c="dimmed" lineClamp={2}>{r.comment}</Text>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              ) : <Text c="dimmed" ta="center" py="xl">{t('admin.noDataYet')}</Text>}
            </Paper>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Recent Bookings Table */}
      <AnimatedSection delay={0.1}>
        <Paper className="glass-card chart-card" p="lg" radius="lg">
          <Group justify="space-between" mb="md" wrap="wrap">
            <Text fw={600}>{t('admin.recentBookings')}</Text>
            <Group gap="sm">
              <Select size="xs" w={150} data={statusSelectData} value={recentBookingsStatus ?? ''} onChange={(val) => setRecentBookingsStatus(val || null)} placeholder={t('admin.allStatuses')} clearable={false} />
              <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => setRecentBookingsLimit(prev => prev + LIMIT_STEP)}>{t('admin.showMore')}</Button></motion.div>
              <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => navigate('/admin/bookings')}>{t('admin.viewBookings')}</Button></motion.div>
            </Group>
          </Group>
          {loadingRecentBookings ? <Skeleton h={250} radius="md" className="skeleton-shimmer" /> : recentBookings && recentBookings.length > 0 ? (
            <Table.ScrollContainer minWidth={600}>
              <Table striped highlightOnHover>
                <Table.Thead><Table.Tr><Table.Th>{t('admin.bookingIdColumn')}</Table.Th><Table.Th>{t('admin.customer')}</Table.Th><Table.Th>{t('admin.vehicle')}</Table.Th><Table.Th>{t('admin.total')}</Table.Th><Table.Th>{t('admin.status')}</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>
                  {recentBookings.map((b, idx) => {
                    const statusName = resolveBookingStatus(b.status, b.isCanceled);
                    const statusColor = BOOKING_STATUS_CHART_COLOR[statusName]?.replace('.6', '') ?? 'gray';
                    return (
                      <motion.tr key={b.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.06, duration: 0.35, ease: smoothEase }} style={{ cursor: 'pointer' }}>
                        <Table.Td><Text size="sm" fw={500}>{b.ref}</Text></Table.Td>
                        <Table.Td><Group gap="sm"><Avatar size="sm" radius="xl" color="teal">{b.customerInitials}</Avatar><Text size="sm">{b.customerName}</Text></Group></Table.Td>
                        <Table.Td>{b.vehicleName}</Table.Td>
                        <Table.Td><Text size="sm" fw={600}>€{b.total.toLocaleString()}</Text></Table.Td>
                        <Table.Td><motion.div {...badgePopIn(idx * 0.06 + 0.2)}><Badge color={statusColor} variant="light" size="sm">{t(BOOKING_STATUS_I18N[statusName] ?? 'status.pending')}</Badge></motion.div></Table.Td>
                      </motion.tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Stack align="center" py="xl" gap="md">
              <motion.div {...emptyStateFloat}><ThemeIcon size={60} variant="light" color="gray" radius="xl"><IconCalendar size={30} /></ThemeIcon></motion.div>
              <Text c="dimmed" ta="center">{t('admin.noBookings')}</Text>
            </Stack>
          )}
        </Paper>
      </AnimatedSection>
    </Stack>
  );
}
