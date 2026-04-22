import { useState, useEffect } from 'react';
import {
  Title, Stack, SimpleGrid, Paper, Text, Group, ThemeIcon, Progress,
  Rating, Badge, Skeleton, Button, Box,
} from '@mantine/core';
import { AreaChart, BarChart, DonutChart } from '@mantine/charts';
import {
  IconUsers, IconCalendar, IconCurrencyEuro, IconRepeat,
  IconStar, IconTrendingUp, IconBrowser, IconDeviceLaptop, IconMail,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { DEVICE_COLORS } from '../../constants/colors';
import type {
  AnalyticsKpis, DeviceBreakdown, BrowserStat, OsStat,
  BookingsByDay, RevenueByCategory, BookingsByHour,
  RegistrationTrend, TopRatedCar, SubscriberTrend,
} from '../../types/analytics';
import { analyticsApi } from '../../services/analyticsApi';
import { WidgetDateFilter, useWidgetDates } from '../../components/common/WidgetDateFilter';
import {
  cardHover3d, iconSpin, listItemSlide, chartContainerVariants,
  badgePopIn, smoothEase,
} from '../../constants/animations';

const DEFAULT_LIMIT = 5;
const LIMIT_STEP = 5;

function WidgetSkeleton({ h = 180 }: { h?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Skeleton h={h} radius="lg" className="skeleton-shimmer" />
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const kpisDates = useWidgetDates();
  const byDayDates = useWidgetDates();
  const revCatDates = useWidgetDates();
  const byHourDates = useWidgetDates();
  const regTrendDates = useWidgetDates();
  const subTrendDates = useWidgetDates();

  const [browsersLimit, setBrowsersLimit] = useState(DEFAULT_LIMIT);
  const [osLimit, setOsLimit] = useState(DEFAULT_LIMIT);
  const [topRatedLimit, setTopRatedLimit] = useState(DEFAULT_LIMIT);

  const [kpis, setKpis] = useState<AnalyticsKpis | null>(null);
  const [deviceBreakdown, setDeviceBreakdown] = useState<DeviceBreakdown[] | null>(null);
  const [topBrowsers, setTopBrowsers] = useState<BrowserStat[] | null>(null);
  const [topOs, setTopOs] = useState<OsStat[] | null>(null);
  const [bookingsByDay, setBookingsByDay] = useState<BookingsByDay[] | null>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<RevenueByCategory[] | null>(null);
  const [bookingsByHour, setBookingsByHour] = useState<BookingsByHour[] | null>(null);
  const [registrationTrend, setRegistrationTrend] = useState<RegistrationTrend[] | null>(null);
  const [topRatedCars, setTopRatedCars] = useState<TopRatedCar[] | null>(null);
  const [subscriberTrend, setSubscriberTrend] = useState<SubscriberTrend[] | null>(null);

  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [loadingBrowsers, setLoadingBrowsers] = useState(true);
  const [loadingOs, setLoadingOs] = useState(true);
  const [loadingByDay, setLoadingByDay] = useState(true);
  const [loadingRevCat, setLoadingRevCat] = useState(true);
  const [loadingByHour, setLoadingByHour] = useState(true);
  const [loadingRegTrend, setLoadingRegTrend] = useState(true);
  const [loadingTopRated, setLoadingTopRated] = useState(true);
  const [loadingSubTrend, setLoadingSubTrend] = useState(true);

  // Non-date widgets: device breakdown, top browsers, top OS, top rated cars
  useEffect(() => {
    setLoadingDevices(true);
    analyticsApi.deviceBreakdown()
      .then(r => { if (r.success && r.data) setDeviceBreakdown(r.data); })
      .catch(() => {})
      .finally(() => setLoadingDevices(false));

    setLoadingBrowsers(true);
    analyticsApi.topBrowsers({ limit: browsersLimit })
      .then(r => { if (r.success && r.data) setTopBrowsers(r.data); })
      .catch(() => {})
      .finally(() => setLoadingBrowsers(false));

    setLoadingOs(true);
    analyticsApi.topOs({ limit: osLimit })
      .then(r => { if (r.success && r.data) setTopOs(r.data); })
      .catch(() => {})
      .finally(() => setLoadingOs(false));

    setLoadingTopRated(true);
    analyticsApi.topRatedCars({ limit: topRatedLimit })
      .then(r => { if (r.success && r.data) setTopRatedCars(r.data); })
      .catch(() => {})
      .finally(() => setLoadingTopRated(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Limit-based re-fetches
  useEffect(() => {
    setLoadingBrowsers(true);
    analyticsApi.topBrowsers({ limit: browsersLimit })
      .then(r => { if (r.success && r.data) setTopBrowsers(r.data); })
      .catch(() => {})
      .finally(() => setLoadingBrowsers(false));
  }, [browsersLimit]);

  useEffect(() => {
    setLoadingOs(true);
    analyticsApi.topOs({ limit: osLimit })
      .then(r => { if (r.success && r.data) setTopOs(r.data); })
      .catch(() => {})
      .finally(() => setLoadingOs(false));
  }, [osLimit]);

  useEffect(() => {
    setLoadingTopRated(true);
    analyticsApi.topRatedCars({ limit: topRatedLimit })
      .then(r => { if (r.success && r.data) setTopRatedCars(r.data); })
      .catch(() => {})
      .finally(() => setLoadingTopRated(false));
  }, [topRatedLimit]);

  // Date-filterable widgets
  useEffect(() => {
    setLoadingKpis(true);
    analyticsApi.kpis(kpisDates.params())
      .then(r => { if (r.success && r.data) setKpis(r.data); })
      .catch(() => {})
      .finally(() => setLoadingKpis(false));
  }, [kpisDates.range]);

  useEffect(() => {
    setLoadingByDay(true);
    analyticsApi.bookingsByDay(byDayDates.params())
      .then(r => { if (r.success && r.data) setBookingsByDay(r.data); })
      .catch(() => {})
      .finally(() => setLoadingByDay(false));
  }, [byDayDates.range]);

  useEffect(() => {
    setLoadingRevCat(true);
    analyticsApi.revenueByCategory(revCatDates.params())
      .then(r => { if (r.success && r.data) setRevenueByCategory(r.data); })
      .catch(() => {})
      .finally(() => setLoadingRevCat(false));
  }, [revCatDates.range]);

  useEffect(() => {
    setLoadingByHour(true);
    analyticsApi.bookingsByHour(byHourDates.params())
      .then(r => { if (r.success && r.data) setBookingsByHour(r.data); })
      .catch(() => {})
      .finally(() => setLoadingByHour(false));
  }, [byHourDates.range]);

  useEffect(() => {
    setLoadingRegTrend(true);
    analyticsApi.registrationTrend(regTrendDates.params())
      .then(r => { if (r.success && r.data) setRegistrationTrend(r.data); })
      .catch(() => {})
      .finally(() => setLoadingRegTrend(false));
  }, [regTrendDates.range]);

  useEffect(() => {
    setLoadingSubTrend(true);
    analyticsApi.subscriberTrend(subTrendDates.params())
      .then(r => { if (r.success && r.data) setSubscriberTrend(r.data); })
      .catch(() => {})
      .finally(() => setLoadingSubTrend(false));
  }, [subTrendDates.range]);

  const k = kpis;

  const kpiCards = k ? [
    { label: t('analytics.totalUsers'), value: k.totalUsers.toLocaleString(), sub: `+${k.newUsersThisMonth} ${t('analytics.thisMonth')}`, icon: IconUsers, color: 'teal' as const },
    { label: t('analytics.totalBookings'), value: k.totalBookings.toLocaleString(), sub: `+${k.bookingsThisMonth} ${t('analytics.thisMonth')}`, icon: IconCalendar, color: 'green' as const },
    { label: t('analytics.avgBookingValue'), value: `€${k.avgBookingValue.toLocaleString()}`, sub: t('analytics.perBooking'), icon: IconCurrencyEuro, color: 'yellow' as const },
    { label: t('analytics.conversionRate'), value: `${k.conversionRate.toFixed(1)}%`, sub: t('analytics.usersWhoBooked'), icon: IconTrendingUp, color: 'cyan' as const },
    { label: t('analytics.repeatCustomers'), value: `${k.repeatCustomerRate.toFixed(1)}%`, sub: t('analytics.bookedMoreThanOnce'), icon: IconRepeat, color: 'grape' as const },
    { label: t('analytics.avgRating'), value: k.avgRating.toFixed(1), sub: t('analytics.acrossAllReviews'), icon: IconStar, color: 'yellow' as const },
  ] : [];

  return (
    <Stack gap="xl">
      {/* Header */}
      <AnimatedSection delay={0.05}>
        <div>
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
            <Title order={2} fw={800}>{t('analytics.title')}</Title>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, duration: 0.4 }}>
            <Text c="dimmed" size="sm" mt={4}>{t('analytics.subtitle')}</Text>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* KPI Cards */}
      <AnimatedSection delay={0.08}>
        <Group justify="space-between" mb="md" wrap="wrap">
          <Text fw={600}>{t('analytics.kpis')}</Text>
          <WidgetDateFilter value={kpisDates.range} onChange={kpisDates.setRange} />
        </Group>
      </AnimatedSection>
      {loadingKpis ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          {[1, 2, 3, 4, 5, 6].map(i => <WidgetSkeleton key={i} h={120} />)}
        </SimpleGrid>
      ) : kpiCards.length > 0 && (
        <StaggerContainer stagger={0.09} delay={0.1}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {kpiCards.map((kpi) => (
              <StaggerItem key={kpi.label} scale>
                <motion.div {...cardHover3d}>
                  <Paper className="glass-card card-shimmer animated-border-glow" p="lg" radius="lg">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" c="dimmed" fw={500}>{kpi.label}</Text>
                      <motion.div {...iconSpin}>
                        <ThemeIcon variant="light" color={kpi.color} size="lg" radius="md">
                          <kpi.icon size={20} />
                        </ThemeIcon>
                      </motion.div>
                    </Group>
                    <Text size="1.75rem" fw={800}>{kpi.value}</Text>
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <Text size="xs" c="dimmed" mt={4}>{kpi.sub}</Text>
                    </motion.div>
                  </Paper>
                </motion.div>
              </StaggerItem>
            ))}
          </SimpleGrid>
        </StaggerContainer>
      )}

      {/* Device Breakdown + Browser/OS */}
      <StaggerContainer stagger={0.12} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
          {/* Device donut */}
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg" h="100%">
                <Text fw={600} mb="md">{t('analytics.deviceBreakdown')}</Text>
                {loadingDevices ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : deviceBreakdown && deviceBreakdown.length > 0 ? (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0, rotate: -15 }}
                    whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Group justify="center">
                      <DonutChart
                        data={deviceBreakdown.map(d => ({ ...d, color: DEVICE_COLORS[d.name] ?? 'gray.6' }))}
                        size={200} thickness={28}
                        withLabelsLine withLabels tooltipDataSource="segment"
                      />
                    </Group>
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>

          {/* Top Browsers */}
          <StaggerItem>
            <Paper className="glass-card chart-card" p="lg" radius="lg" h="100%">
              <Group justify="space-between" mb="md">
                <Text fw={600}>{t('analytics.topBrowsers')}</Text>
                <Button variant="subtle" size="xs" color="teal" onClick={() => setBrowsersLimit(prev => prev + LIMIT_STEP)}>
                  {t('admin.showMore')}
                </Button>
              </Group>
              {loadingBrowsers ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : topBrowsers && topBrowsers.length > 0 ? (
                <Stack gap="sm">
                  {topBrowsers.map((b, i) => {
                    const max = topBrowsers[0]?.count ?? 1;
                    return (
                      <motion.div key={b.browser} {...listItemSlide(i, 'left')}>
                        <Group justify="space-between" mb={4}>
                          <Group gap="xs">
                            <motion.div {...iconSpin}>
                              <ThemeIcon variant="light" color="teal" size="sm" radius="md"><IconBrowser size={14} /></ThemeIcon>
                            </motion.div>
                            <Text size="sm">{b.browser}</Text>
                          </Group>
                          <Text size="sm" fw={600}>{b.count.toLocaleString()}</Text>
                        </Group>
                        <motion.div
                          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                          style={{ transformOrigin: 'left' }}
                        >
                          <Progress value={(b.count / max) * 100} color="teal" size="sm" radius="xl" />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </Stack>
              ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
            </Paper>
          </StaggerItem>

          {/* Top OS */}
          <StaggerItem direction="right">
            <Paper className="glass-card chart-card" p="lg" radius="lg" h="100%">
              <Group justify="space-between" mb="md">
                <Text fw={600}>{t('analytics.topOS')}</Text>
                <Button variant="subtle" size="xs" color="teal" onClick={() => setOsLimit(prev => prev + LIMIT_STEP)}>
                  {t('admin.showMore')}
                </Button>
              </Group>
              {loadingOs ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : topOs && topOs.length > 0 ? (
                <Stack gap="sm">
                  {topOs.map((o, i) => {
                    const max = topOs[0]?.count ?? 1;
                    return (
                      <motion.div key={o.os} {...listItemSlide(i, 'right')}>
                        <Group justify="space-between" mb={4}>
                          <Group gap="xs">
                            <motion.div {...iconSpin}>
                              <ThemeIcon variant="light" color="grape" size="sm" radius="md"><IconDeviceLaptop size={14} /></ThemeIcon>
                            </motion.div>
                            <Text size="sm">{o.os}</Text>
                          </Group>
                          <Text size="sm" fw={600}>{o.count.toLocaleString()}</Text>
                        </Group>
                        <motion.div
                          initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
                          style={{ transformOrigin: 'left' }}
                        >
                          <Progress value={(o.count / max) * 100} color="grape" size="sm" radius="xl" />
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </Stack>
              ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
            </Paper>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Bookings Trend + Revenue by Category */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('analytics.bookingsTrend')}</Text>
                  <WidgetDateFilter value={byDayDates.range} onChange={byDayDates.setRange} />
                </Group>
                {loadingByDay ? <Skeleton h={260} radius="md" className="skeleton-shimmer" /> : bookingsByDay && bookingsByDay.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <AreaChart
                      h={260} data={bookingsByDay.map(d => ({ ...d, [t('chartLabels.bookings')]: d.bookings }))} dataKey="date"
                      series={[{ name: t('chartLabels.bookings'), color: 'teal.6' }]}
                      curveType="natural" gridAxis="xy" withDots={false} withTooltip
                      tooltipAnimationDuration={200} fillOpacity={0.3}
                    />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('analytics.revenueByCategory')}</Text>
                  <WidgetDateFilter value={revCatDates.range} onChange={revCatDates.setRange} />
                </Group>
                {loadingRevCat ? <Skeleton h={260} radius="md" className="skeleton-shimmer" /> : revenueByCategory && revenueByCategory.length > 0 ? (
                  <motion.div initial={{ opacity: 0, scaleY: 0.8 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }} style={{ transformOrigin: 'bottom' }}>
                    <BarChart
                      h={260} data={revenueByCategory.map(d => ({ ...d, [t('chartLabels.revenue')]: d.revenue }))} dataKey="category"
                      series={[{ name: t('chartLabels.revenue'), color: 'green.6' }]}
                      withTooltip tooltipAnimationDuration={200}
                    />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Bookings by Hour + Registrations Trend */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('analytics.peakBookingHours')}</Text>
                  <WidgetDateFilter value={byHourDates.range} onChange={byHourDates.setRange} />
                </Group>
                {loadingByHour ? <Skeleton h={260} radius="md" className="skeleton-shimmer" /> : bookingsByHour && bookingsByHour.length > 0 ? (
                  <motion.div initial={{ opacity: 0, scaleY: 0.8 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }} style={{ transformOrigin: 'bottom' }}>
                    <BarChart
                      h={260} data={bookingsByHour.map(d => ({ ...d, [t('chartLabels.bookings')]: d.bookings }))} dataKey="hour"
                      series={[{ name: t('chartLabels.bookings'), color: 'cyan.6' }]}
                      withTooltip tooltipAnimationDuration={200}
                    />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Text fw={600}>{t('analytics.registrationTrend')}</Text>
                  <WidgetDateFilter value={regTrendDates.range} onChange={regTrendDates.setRange} />
                </Group>
                {loadingRegTrend ? <Skeleton h={260} radius="md" className="skeleton-shimmer" /> : registrationTrend && registrationTrend.length > 0 ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
                    <AreaChart
                      h={260} data={registrationTrend.map(d => ({ ...d, [t('chartLabels.users')]: d.users }))} dataKey="month"
                      series={[{ name: t('chartLabels.users'), color: 'grape.6' }]}
                      curveType="natural" gridAxis="xy" withDots withTooltip
                      tooltipAnimationDuration={200} fillOpacity={0.3}
                    />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>

      {/* Top Rated Cars + Subscriber Trend */}
      <StaggerContainer stagger={0.15} delay={0.1}>
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          <StaggerItem direction="left">
            <Paper className="glass-card chart-card" p="lg" radius="lg">
              <Group justify="space-between" mb="md">
                <Text fw={600}>{t('analytics.topRatedCars')}</Text>
                <Button variant="subtle" size="xs" color="teal" onClick={() => setTopRatedLimit(prev => prev + LIMIT_STEP)}>
                  {t('admin.showMore')}
                </Button>
              </Group>
              {loadingTopRated ? <Skeleton h={200} radius="md" className="skeleton-shimmer" /> : topRatedCars && topRatedCars.length > 0 ? (
                <Stack gap="sm">
                  {topRatedCars.map((car, i) => (
                    <motion.div key={car.carName} {...listItemSlide(i, 'left')}>
                      <Group justify="space-between" p="xs" className="list-row-animated" style={{ background: 'var(--mantine-color-dark-6)' }}>
                        <Group gap="sm">
                          <motion.div {...badgePopIn(i * 0.08 + 0.1)}>
                            <Badge variant="light" color="teal" size="lg" circle>{i + 1}</Badge>
                          </motion.div>
                          <div>
                            <Text size="sm" fw={600}>{car.carName}</Text>
                            <Text size="xs" c="dimmed">{car.reviewCount} {t('analytics.reviews')}</Text>
                          </div>
                        </Group>
                        <Group gap="xs">
                          <Text size="sm" fw={700} c="yellow">{car.avgRating.toFixed(1)}</Text>
                          <motion.div {...badgePopIn(i * 0.08 + 0.2)}>
                            <Rating value={car.avgRating} fractions={2} readOnly size="xs" />
                          </motion.div>
                        </Group>
                      </Group>
                    </motion.div>
                  ))}
                </Stack>
              ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
            </Paper>
          </StaggerItem>
          <StaggerItem direction="right">
            <motion.div variants={chartContainerVariants}>
              <Paper className="glass-card chart-card animated-border-glow" p="lg" radius="lg">
                <Group justify="space-between" mb="md" wrap="wrap">
                  <Group gap={8}>
                    <Text fw={600}>{t('analytics.subscriberTrend')}</Text>
                    <motion.div {...badgePopIn(0.1)}>
                      <Badge variant="light" color="teal" size="xs">{t('analytics.subscribed')}</Badge>
                    </motion.div>
                    <motion.div {...badgePopIn(0.2)}>
                      <Badge variant="light" color="red" size="xs">{t('analytics.unsubscribed')}</Badge>
                    </motion.div>
                  </Group>
                  <WidgetDateFilter value={subTrendDates.range} onChange={subTrendDates.setRange} />
                </Group>
                {loadingSubTrend ? <Skeleton h={260} radius="md" className="skeleton-shimmer" /> : subscriberTrend && subscriberTrend.length > 0 ? (
                  <motion.div initial={{ opacity: 0, scaleY: 0.8 }} whileInView={{ opacity: 1, scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: smoothEase }} style={{ transformOrigin: 'bottom' }}>
                    <BarChart
                      h={260} data={subscriberTrend.map(d => ({ ...d, [t('chartLabels.subscribers')]: d.subscribers, [t('chartLabels.unsubscribes')]: d.unsubscribes }))} dataKey="month"
                      series={[
                        { name: t('chartLabels.subscribers'), color: 'teal.6' },
                        { name: t('chartLabels.unsubscribes'), color: 'red.6' },
                      ]}
                      withTooltip tooltipAnimationDuration={200} withLegend
                    />
                  </motion.div>
                ) : <Text c="dimmed" ta="center" py="xl">{t('analytics.noData')}</Text>}
              </Paper>
            </motion.div>
          </StaggerItem>
        </SimpleGrid>
      </StaggerContainer>
    </Stack>
  );
}
