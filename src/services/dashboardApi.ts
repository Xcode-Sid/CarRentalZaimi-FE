import { get } from '../utils/apiUtils';
import type {
  DashboardKpis, DashboardSparkline, PaymentSplit, FleetStatus,
  RevenuePoint, BookingsChartPoint, PopularCar, FleetCategory,
  BookingsByStatus, CustomerGrowthPoint, TopCustomer, RecentReview,
  TodayActivity, RecentBooking, DashboardSummary,
} from '../types/dashboard';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

interface LimitParams extends DateRangeParams {
  limit?: number;
}

interface BookingsFilterParams extends DateRangeParams {
  status?: string;
  limit?: number;
}

function cleanParams<T extends object>(params: T): Record<string, string> | undefined {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = String(v);
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

export const dashboardApi = {
  summary: () =>
    get<DashboardSummary>('Dashboard/summary'),

  kpis: (p: DateRangeParams = {}) =>
    get<DashboardKpis>('Dashboard/kpis', cleanParams(p)),

  sparklines: (days?: number) =>
    get<Record<string, DashboardSparkline>>('Dashboard/sparklines', cleanParams({ days })),

  paymentSplit: (p: DateRangeParams = {}) =>
    get<PaymentSplit>('Dashboard/payment-split', cleanParams(p)),

  fleetStatus: () =>
    get<FleetStatus>('Dashboard/fleet-status'),

  revenueChart: (p: DateRangeParams = {}) =>
    get<RevenuePoint[]>('Dashboard/revenue-chart', cleanParams(p)),

  bookingsChart: (p: DateRangeParams = {}) =>
    get<BookingsChartPoint[]>('Dashboard/bookings-chart', cleanParams(p)),

  popularCars: (p: LimitParams = {}) =>
    get<PopularCar[]>('Dashboard/popular-cars', cleanParams(p)),

  fleetDistribution: () =>
    get<FleetCategory[]>('Dashboard/fleet-distribution'),

  bookingsByStatus: (p: { startDate?: string; endDate?: string; status?: string } = {}) =>
    get<BookingsByStatus[]>('Dashboard/bookings-by-status', cleanParams(p)),

  customerGrowth: (p: DateRangeParams = {}) =>
    get<CustomerGrowthPoint[]>('Dashboard/customer-growth', cleanParams(p)),

  topCustomers: (p: LimitParams = {}) =>
    get<TopCustomer[]>('Dashboard/top-customers', cleanParams(p)),

  recentReviews: (limit?: number) =>
    get<RecentReview[]>('Dashboard/recent-reviews', cleanParams({ limit })),

  todayActivity: () =>
    get<TodayActivity>('Dashboard/today-activity'),

  recentBookings: (p: BookingsFilterParams = {}) =>
    get<RecentBooking[]>('Dashboard/recent-bookings', cleanParams({ limit: p.limit, status: p.status })),
};
