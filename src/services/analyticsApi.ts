import { get } from '../utils/apiUtils';
import type {
  AnalyticsKpis, DeviceBreakdown, BrowserStat, OsStat,
  BookingsByDay, RevenueByCategory, BookingsByHour,
  RegistrationTrend, TopRatedCar, SubscriberTrend, AnalyticsSummary,
} from '../types/analytics';

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

interface LimitParams {
  limit?: number;
}

function cleanParams<T extends object>(params: T): Record<string, string> | undefined {
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') cleaned[k] = String(v);
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

export const analyticsApi = {
  summary: () =>
    get<AnalyticsSummary>('Analytics/summary'),

  kpis: (p: DateRangeParams = {}) =>
    get<AnalyticsKpis>('Analytics/kpis', cleanParams(p)),

  deviceBreakdown: () =>
    get<DeviceBreakdown[]>('Analytics/device-breakdown'),

  topBrowsers: (p: LimitParams = {}) =>
    get<BrowserStat[]>('Analytics/top-browsers', cleanParams(p)),

  topOs: (p: LimitParams = {}) =>
    get<OsStat[]>('Analytics/top-os', cleanParams(p)),

  bookingsByDay: (p: DateRangeParams = {}) =>
    get<BookingsByDay[]>('Analytics/bookings-by-day', cleanParams(p)),

  revenueByCategory: (p: DateRangeParams = {}) =>
    get<RevenueByCategory[]>('Analytics/revenue-by-category', cleanParams(p)),

  bookingsByHour: (p: DateRangeParams = {}) =>
    get<BookingsByHour[]>('Analytics/bookings-by-hour', cleanParams(p)),

  registrationTrend: (p: DateRangeParams = {}) =>
    get<RegistrationTrend[]>('Analytics/registration-trend', cleanParams(p)),

  topRatedCars: (p: LimitParams = {}) =>
    get<TopRatedCar[]>('Analytics/top-rated-cars', cleanParams(p)),

  subscriberTrend: (p: DateRangeParams = {}) =>
    get<SubscriberTrend[]>('Analytics/subscriber-trend', cleanParams(p)),
};
