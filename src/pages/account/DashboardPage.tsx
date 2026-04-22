import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SimpleGrid, Paper, Text, Group, Stack, Title, ThemeIcon, Box,
  Badge, Button, Image, Rating, Tooltip, Skeleton, Select,
} from '@mantine/core';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import {
  IconCalendar, IconCurrencyEuro, IconCar, IconHeart,
  IconStar, IconCalendarCheck, IconCalendarX,
  IconClipboardList,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { useAuth } from '../../contexts/AuthContext';
import { toImagePath } from '../../utils/general';
import { BOOKING_STATUS_CHART_COLOR, BOOKING_STATUS_I18N } from '../../constants/colors';
import type {
  UserDashboardKpis, UserBookingsByMonth, UserSpendingByMonth,
  UserBookingByStatus, UserUpcomingBooking, UserRecentReview, UserFavoriteCar,
} from '../../types/userDashboard';
import { userDashboardApi } from '../../services/userDashboardApi';
import { WidgetDateFilter, useWidgetDates } from '../../components/common/WidgetDateFilter';
import {
  cardHover3d, iconSpin, buttonPop, listItemSlide, emptyStateFloat,
  chartContainerVariants, badgePopIn, smoothEase,
} from '../../constants/animations';

const BOOKING_STATUSES = ['Pending', 'Accepted', 'Refused', 'Done', 'Cancelled'];
const DEFAULT_LIMIT = 5;
const LIMIT_STEP = 5;

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

function timeUntil(dateStr: string, t: (key: string) => string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return t('userDashboard.started');
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return t('userDashboard.today');
  if (days === 1) return t('userDashboard.tomorrow');
  return t('userDashboard.inDays').replace('{{count}}', String(days));
}

function WidgetSkeleton({ h = 180 }: { h?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Skeleton h={h} radius="lg" className="skeleton-shimmer" />
    </motion.div>
  );
}

export default function UserDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());

  // Per-widget date filters
  const kpisDates = useWidgetDates();
  const byMonthDates = useWidgetDates();
  const spendingDates = useWidgetDates();
  const byStatusDates = useWidgetDates();

  // Status filter
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Limits
  const [upcomingLimit, setUpcomingLimit] = useState(DEFAULT_LIMIT);
  const [reviewsLimit, setReviewsLimit] = useState(DEFAULT_LIMIT);
  const [favoritesLimit, setFavoritesLimit] = useState(DEFAULT_LIMIT);

  // Widget data
  const [kpis, setKpis] = useState<UserDashboardKpis | null>(null);
  const [bookingsByMonth, setBookingsByMonth] = useState<UserBookingsByMonth[] | null>(null);
  const [spendingByMonth, setSpendingByMonth] = useState<UserSpendingByMonth[] | null>(null);
  const [bookingsByStatus, setBookingsByStatus] = useState<UserBookingByStatus[] | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<UserUpcomingBooking[] | null>(null);
  const [recentReviews, setRecentReviews] = useState<UserRecentReview[] | null>(null);
  const [favoriteCars, setFavoriteCars] = useState<UserFavoriteCar[] | null>(null);

  // Loading per widget
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingByMonth, setLoadingByMonth] = useState(true);
  const [loadingSpending, setLoadingSpending] = useState(true);
  const [loadingByStatus, setLoadingByStatus] = useState(true);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Non-date widgets: fetch on mount
  useEffect(() => {
    setLoadingUpcoming(true);
    userDashboardApi.upcomingBookings(upcomingLimit).then(r => { if (r.success && r.data) setUpcomingBookings(r.data); }).catch(() => {}).finally(() => setLoadingUpcoming(false));

    setLoadingReviews(true);
    userDashboardApi.recentReviews(reviewsLimit).then(r => { if (r.success && r.data) setRecentReviews(r.data); }).catch(() => {}).finally(() => setLoadingReviews(false));

    setLoadingFavorites(true);
    userDashboardApi.favoriteCars(favoritesLimit).then(r => { if (r.success && r.data) setFavoriteCars(r.data); }).catch(() => {}).finally(() => setLoadingFavorites(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Per-widget date-driven fetches
  useEffect(() => {
    setLoadingKpis(true);
    userDashboardApi.kpis(kpisDates.params()).then(r => { if (r.success && r.data) setKpis(r.data); }).catch(() => {}).finally(() => setLoadingKpis(false));
  }, [kpisDates.range]);

  useEffect(() => {
    setLoadingByMonth(true);
    userDashboardApi.bookingsByMonth(byMonthDates.params()).then(r => { if (r.success && r.data) setBookingsByMonth(r.data); }).catch(() => {}).finally(() => setLoadingByMonth(false));
  }, [byMonthDates.range]);

  useEffect(() => {
    setLoadingSpending(true);
    userDashboardApi.spendingByMonth(spendingDates.params()).then(r => { if (r.success && r.data) setSpendingByMonth(r.data); }).catch(() => {}).finally(() => setLoadingSpending(false));
  }, [spendingDates.range]);

  useEffect(() => {
    setLoadingByStatus(true);
    userDashboardApi.bookingsByStatus({ ...byStatusDates.params(), status: statusFilter ?? undefined }).then(r => { if (r.success && r.data) setBookingsByStatus(r.data); }).catch(() => {}).finally(() => setLoadingByStatus(false));
  }, [byStatusDates.range, statusFilter]);

  // Limit-only re-fetches
  useEffect(() => {
    setLoadingUpcoming(true);
    userDashboardApi.upcomingBookings(upcomingLimit).then(r => { if (r.success && r.data) setUpcomingBookings(r.data); }).catch(() => {}).finally(() => setLoadingUpcoming(false));
  }, [upcomingLimit]);

  useEffect(() => {
    setLoadingReviews(true);
    userDashboardApi.recentReviews(reviewsLimit).then(r => { if (r.success && r.data) setRecentReviews(r.data); }).catch(() => {}).finally(() => setLoadingReviews(false));
  }, [reviewsLimit]);

  useEffect(() => {
    setLoadingFavorites(true);
    userDashboardApi.favoriteCars(favoritesLimit).then(r => { if (r.success && r.data) setFavoriteCars(r.data); }).catch(() => {}).finally(() => setLoadingFavorites(false));
  }, [favoritesLimit]);

  const dateStr = time.toLocaleDateString('sq-AL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = time.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const k = kpis;
  const firstName = user?.firstName ?? '';

  const kpiCards = k ? [
    { title: t('userDashboard.totalBookings'), value: k.totalBookings, icon: IconClipboardList, color: 'teal', cardClass: 'kpi-card-teal' },
    { title: t('userDashboard.activeBookings'), value: k.activeBookings, icon: IconCalendarCheck, color: 'cyan', cardClass: 'kpi-card-teal' },
    { title: t('userDashboard.totalSpent'), value: k.totalSpent, prefix: '€', icon: IconCurrencyEuro, color: 'green', cardClass: 'kpi-card-green' },
    { title: t('userDashboard.savedCars'), value: k.savedCarsCount, icon: IconHeart, color: 'red', cardClass: 'kpi-card-orange' },
  ] : [];

  const statusSelectData = [
    { value: '', label: t('userDashboard.allStatuses') },
    ...BOOKING_STATUSES.map(s => ({ value: s, label: t(BOOKING_STATUS_I18N[s] ?? `status.${s.toLowerCase()}`) })),
  ];

  return (
    <Stack gap="xl">
      {/* Greeting */}
      <AnimatedSection delay={0.05}>
        <Box>
          <Title order={2} fw={800}>
            {t('userDashboard.greeting')}{' '}
            <motion.span style={{ display: 'inline-block' }} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
              <Text component="span" inherit c="teal">{firstName}</Text>
            </motion.span>{' '}
            <motion.span style={{ display: 'inline-block', transformOrigin: '70% 70%' }} animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}>👋</motion.span>
          </Title>
          <Group gap="sm" mt={4}>
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}><Text c="dimmed" size="sm">{dateStr}</Text></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}><Text c="teal" size="sm" fw={600} ff="monospace">{timeStr}</Text></motion.div>
          </Group>
        </Box>
      </AnimatedSection>

      {/* KPI Cards */}
      <Box>
        <Group justify="flex-end" mb="sm">
          <WidgetDateFilter value={kpisDates.range} onChange={kpisDates.setRange} />
        </Group>
        {loadingKpis ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {[1, 2, 3, 4].map(i => <WidgetSkeleton key={i} h={120} />)}
          </SimpleGrid>
        ) : kpiCards.length > 0 && (
          <StaggerContainer stagger={0.12} delay={0.15}>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
              {kpiCards.map((kpi) => (
                <StaggerItem key={kpi.title} scale>
                  <motion.div {...cardHover3d}>
                    <Paper className={`glass-card kpi-card ${kpi.cardClass} card-shimmer animated-border-glow`} p="lg" radius="lg" style={{ cursor: 'default' }}>
                      <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>{kpi.title}</Text>
                        <motion.div {...iconSpin}><ThemeIcon variant="light" color={kpi.color} size="lg" radius="md"><kpi.icon size={20} /></ThemeIcon></motion.div>
                      </Group>
                      <Text size="2rem" fw={800}><AnimatedNumber target={kpi.value} prefix={kpi.prefix ?? ''} /></Text>
                    </Paper>
                  </motion.div>
                </StaggerItem>
              ))}
            </SimpleGrid>
          </StaggerContainer>
        )}
      </Box>

      {/* Secondary stats */}
      {loadingKpis ? (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {[1, 2, 3].map(i => <WidgetSkeleton key={i} h={70} />)}
        </SimpleGrid>
      ) : k && (
        <StaggerContainer stagger={0.1} delay={0.2}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {[
              { label: t('userDashboard.completedBookings'), val: k.completedBookings, icon: IconCalendar, color: 'teal' },
              { label: t('userDashboard.cancelledBookings'), val: k.cancelledBookings, icon: IconCalendarX, color: 'red' },
              { label: t('userDashboard.reviewsGiven'), val: k.reviewsGiven, icon: IconStar, color: 'yellow', rating: k.avgRatingGiven },
            ].map((item) => (
              <StaggerItem key={item.label} scale>
                <motion.div whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                  <Paper className="glass-card" p="md" radius="lg">
                    <Group gap="sm">
                      <motion.div {...iconSpin}><ThemeIcon variant="light" color={item.color} size="md" radius="md"><item.icon size={18} /></ThemeIcon></motion.div>
                      <Box>
                        <Text size="xs" c="dimmed">{item.label}</Text>
                        <Group gap={4}>
                          <Text fw={700} size="lg">{item.val}</Text>
                          {item.rating && item.rating > 0 && <Rating value={item.rating} fractions={2} readOnly size="xs" />}
                        </Group>
                      </Box>
                    </Group>
                  </Paper>
                </motion.div>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      )}

      {/* Upcoming Bookings */}
      <AnimatedSection delay={0.15}>
        <Paper className="glass-card chart-card" p="lg" radius="lg">
          <Group justify="space-between" mb="md" wrap="wrap">
            <Text fw={600}>{t('userDashboard.upcomingBookings')}</Text>
            <Group gap="sm">
              <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => setUpcomingLimit(prev => prev + LIMIT_STEP)}>{t('userDashboard.showMore')}</Button></motion.div>
              <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => navigate('/account/bookings')}>{t('userDashboard.viewAll')}</Button></motion.div>
            </Group>
          </Group>
          {loadingUpcoming ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : upcomingBookings && upcomingBookings.length > 0 ? (
            <Stack gap="sm">
              {upcomingBookings.map((b, i) => (
                <motion.div key={b.id} {...listItemSlide(i, 'left')}>
                  <Group justify="space-between" p="sm" className="list-row-animated" style={{ background: 'var(--mantine-color-dark-6)' }} wrap="nowrap">
                    <Group gap="md" wrap="nowrap">
                      {b.carImage ? (
                        <motion.div whileHover={{ scale: 1.08 }} transition={{ type: 'spring', stiffness: 400 }}><Image src={toImagePath(b.carImage)} w={60} h={40} radius="md" fit="cover" /></motion.div>
                      ) : (
                        <motion.div variants={{ animate: { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity } } }} animate="animate"><ThemeIcon variant="light" color="teal" size={40} radius="md"><IconCar size={22} /></ThemeIcon></motion.div>
                      )}
                      <Box>
                        <Text size="sm" fw={600}>{b.carName}</Text>
                        <Text size="xs" c="dimmed">{new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}</Text>
                      </Box>
                    </Group>
                    <Group gap="sm" wrap="nowrap">
                      <motion.div {...badgePopIn(i * 0.08 + 0.2)}><Badge variant="light" color="cyan" size="sm">{timeUntil(b.startDate, t)}</Badge></motion.div>
                      <motion.div {...badgePopIn(i * 0.08 + 0.3)}><Badge variant="light" color={BOOKING_STATUS_CHART_COLOR[b.status]?.replace('.6', '') ?? 'gray'} size="sm">{t(BOOKING_STATUS_I18N[b.status] ?? 'status.pending')}</Badge></motion.div>
                      <Text size="sm" fw={700}>€{b.total.toLocaleString()}</Text>
                    </Group>
                  </Group>
                </motion.div>
              ))}
            </Stack>
          ) : (
            <Stack align="center" py="xl" gap="md">
              <motion.div {...emptyStateFloat}><ThemeIcon size={60} variant="light" color="gray" radius="xl"><IconCalendar size={30} /></ThemeIcon></motion.div>
              <Text c="dimmed" ta="center">{t('userDashboard.noUpcoming')}</Text>
              <motion.div {...buttonPop}><Button variant="light" color="teal" onClick={() => navigate('/fleet')}>{t('userDashboard.browseFleet')}</Button></motion.div>
            </Stack>
          )}
        </Paper>
      </AnimatedSection>

      {/* Charts: Bookings by Status + Spending */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('userDashboard.bookingsByStatus')}</Text>
                  <Group gap="sm" wrap="wrap">
                    <WidgetDateFilter value={byStatusDates.range} onChange={byStatusDates.setRange} />
                    <Select size="xs" w={150} data={statusSelectData} value={statusFilter ?? ''} onChange={(val) => setStatusFilter(val || null)} placeholder={t('userDashboard.allStatuses')} clearable={false} />
                  </Group>
                </Group>
                {loadingByStatus ? <Skeleton h={220} radius="md" className="skeleton-shimmer" /> : bookingsByStatus && bookingsByStatus.length > 0 ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, ease: smoothEase }}>
                    <Group justify="center">
                      <DonutChart data={bookingsByStatus.map(s => ({ name: t(BOOKING_STATUS_I18N[s.name] ?? `status.${s.name.toLowerCase()}`), value: s.value, color: BOOKING_STATUS_CHART_COLOR[s.name] ?? 'gray.6' }))} size={200} thickness={28} withLabelsLine withLabels tooltipDataSource="segment" />
                    </Group>
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('userDashboard.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('userDashboard.spendingOverTime')}</Text>
                  <WidgetDateFilter value={spendingDates.range} onChange={spendingDates.setRange} />
                </Group>
                {loadingSpending ? <Skeleton h={220} radius="md" className="skeleton-shimmer" /> : spendingByMonth && spendingByMonth.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <AreaChart h={220} data={spendingByMonth.map(d => ({ ...d, [t('chartLabels.amount')]: d.amount }))} dataKey="month" series={[{ name: t('chartLabels.amount'), color: 'green.6' }]} curveType="natural" gridAxis="xy" withDots withTooltip tooltipAnimationDuration={200} fillOpacity={0.3} />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('userDashboard.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Bookings per Month */}
      <AnimatedSection delay={0.1}>
        <motion.div variants={chartContainerVariants}>
          <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
            <Group justify="space-between" mb="md" wrap="wrap">
              <Text fw={600}>{t('userDashboard.bookingsPerMonth')}</Text>
              <WidgetDateFilter value={byMonthDates.range} onChange={byMonthDates.setRange} />
            </Group>
            {loadingByMonth ? <Skeleton h={220} radius="md" className="skeleton-shimmer" /> : bookingsByMonth && bookingsByMonth.length > 0 ? (
              <motion.div initial={{ opacity: 0, scaleY: 0.8 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }} style={{ transformOrigin: 'bottom' }}>
                <BarChart h={220} data={bookingsByMonth.map(d => ({ ...d, [t('chartLabels.bookings')]: d.bookings }))} dataKey="month" series={[{ name: t('chartLabels.bookings'), color: 'teal.6' }]} withTooltip tooltipAnimationDuration={200} />
              </motion.div>
            ) : <Text c="dimmed" ta="center" py="xl">{t('userDashboard.noData')}</Text>}
          </Paper>
        </motion.div>
      </AnimatedSection>

      {/* Recent Reviews + Favorite Cars */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <Paper className="glass-card chart-card" p="lg" radius="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>{t('userDashboard.yourReviews')}</Text>
                <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => setReviewsLimit(prev => prev + LIMIT_STEP)}>{t('userDashboard.showMore')}</Button></motion.div>
              </Group>
              {loadingReviews ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : recentReviews && recentReviews.length > 0 ? (
                <Stack gap="sm">
                  {recentReviews.map((r, i) => (
                    <motion.div key={r.id} {...listItemSlide(i, 'left')}>
                      <Box p="xs" className="list-row-animated" style={{ background: 'var(--mantine-color-dark-6)' }}>
                        <Group justify="space-between" mb={4}>
                          <Text size="sm" fw={600}>{r.carName}</Text>
                          <motion.div {...badgePopIn(i * 0.05 + 0.2)}><Rating value={r.rating} readOnly size="xs" /></motion.div>
                        </Group>
                        <Text size="xs" c="dimmed" lineClamp={2}>{r.comment}</Text>
                      </Box>
                    </motion.div>
                  ))}
                </Stack>
              ) : (
                <Stack align="center" py="xl">
                  <motion.div {...emptyStateFloat}><ThemeIcon size={48} variant="light" color="gray" radius="xl"><IconStar size={24} /></ThemeIcon></motion.div>
                  <Text c="dimmed">{t('userDashboard.noReviews')}</Text>
                </Stack>
              )}
            </Paper>
          </StaggerItem>
          <StaggerItem direction="right">
            <Paper className="glass-card chart-card" p="lg" radius="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>{t('userDashboard.savedCarsTitle')}</Text>
                <Group gap="xs">
                  <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => setFavoritesLimit(prev => prev + LIMIT_STEP)}>{t('userDashboard.showMore')}</Button></motion.div>
                  <motion.div {...buttonPop}><Button variant="subtle" size="xs" color="teal" onClick={() => navigate('/account/saved')}>{t('userDashboard.viewAll')}</Button></motion.div>
                </Group>
              </Group>
              {loadingFavorites ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : favoriteCars && favoriteCars.length > 0 ? (
                <Stack gap="sm">
                  {favoriteCars.map((car, i) => (
                    <motion.div key={car.id} {...listItemSlide(i, 'right')}>
                      <Group justify="space-between" p="xs" className="list-row-animated" style={{ background: 'var(--mantine-color-dark-6)' }}>
                        <Group gap="sm" wrap="nowrap">
                          {car.image ? (
                            <motion.div whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}><Image src={toImagePath(car.image)} w={50} h={35} radius="md" fit="cover" /></motion.div>
                          ) : (
                            <ThemeIcon variant="light" color="teal" size={35} radius="md"><IconCar size={18} /></ThemeIcon>
                          )}
                          <Box><Text size="sm" fw={500}>{car.name}</Text><Text size="xs" c="dimmed">{car.category}</Text></Box>
                        </Group>
                        <Text size="sm" fw={700} c="teal">€{car.pricePerDay}/{t('vehicle.perDayShort')}</Text>
                      </Group>
                    </motion.div>
                  ))}
                </Stack>
              ) : (
                <Stack align="center" py="xl" gap="md">
                  <motion.div {...emptyStateFloat}><ThemeIcon size={48} variant="light" color="gray" radius="xl"><IconHeart size={24} /></ThemeIcon></motion.div>
                  <Text c="dimmed">{t('userDashboard.noSavedCars')}</Text>
                  <motion.div {...buttonPop}><Button variant="light" color="teal" size="xs" onClick={() => navigate('/fleet')}>{t('userDashboard.browseFleet')}</Button></motion.div>
                </Stack>
              )}
            </Paper>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>
    </Stack>
  );
}
