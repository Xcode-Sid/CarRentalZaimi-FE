import { get } from '../utils/apiUtils';
import type {
  UserDashboardKpis, UserBookingsByMonth, UserSpendingByMonth,
  UserBookingByStatus, UserUpcomingBooking, UserRecentReview,
  UserFavoriteCar, UserDashboardSummary,
} from '../types/userDashboard';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

function cleanParams<T extends object>(params: T): Record<string, string> | undefined {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = String(v);
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

export const userDashboardApi = {
  summary: () =>
    get<UserDashboardSummary>('Dashboard/user-summary'),

  kpis: (p: DateRangeParams = {}) =>
    get<UserDashboardKpis>('Dashboard/user-kpis', cleanParams(p)),

  bookingsByMonth: (p: DateRangeParams = {}) =>
    get<UserBookingsByMonth[]>('Dashboard/user-bookings-by-month', cleanParams(p)),

  spendingByMonth: (p: DateRangeParams = {}) =>
    get<UserSpendingByMonth[]>('Dashboard/user-spending-by-month', cleanParams(p)),

  bookingsByStatus: (p: DateRangeParams & { status?: string } = {}) =>
    get<UserBookingByStatus[]>('Dashboard/user-bookings-by-status', cleanParams(p)),

  upcomingBookings: (limit?: number) =>
    get<UserUpcomingBooking[]>('Dashboard/user-upcoming-bookings', cleanParams({ limit })),

  recentReviews: (limit?: number) =>
    get<UserRecentReview[]>('Dashboard/user-recent-reviews', cleanParams({ limit })),

  favoriteCars: (limit?: number) =>
    get<UserFavoriteCar[]>('Dashboard/user-favorite-cars', cleanParams({ limit })),
};
