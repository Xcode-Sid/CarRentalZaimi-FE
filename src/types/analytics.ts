export interface AnalyticsKpis {
    totalUsers: number;
    newUsersThisMonth: number;
    totalBookings: number;
    bookingsThisMonth: number;
    conversionRate: number;
    avgBookingValue: number;
    repeatCustomerRate: number;
    avgRating: number;
}

export interface DeviceBreakdown {
    name: string;
    value: number;
}

export interface BrowserStat {
    browser: string;
    count: number;
}

export interface OsStat {
    os: string;
    count: number;
}

export interface BookingsByDay {
    date: string;
    bookings: number;
}

export interface RevenueByCategory {
    category: string;
    revenue: number;
}

export interface BookingsByHour {
    hour: string;
    bookings: number;
}

export interface RegistrationTrend {
    month: string;
    users: number;
}

export interface TopRatedCar {
    carName: string;
    avgRating: number;
    reviewCount: number;
}

export interface SubscriberTrend {
    month: string;
    subscribers: number;
    unsubscribes: number;
}

export interface AnalyticsSummary {
    kpis: AnalyticsKpis;
    deviceBreakdown: DeviceBreakdown[];
    topBrowsers: BrowserStat[];
    topOperatingSystems: OsStat[];
    bookingsByDay: BookingsByDay[];
    revenueByCategory: RevenueByCategory[];
    bookingsByHour: BookingsByHour[];
    registrationTrend: RegistrationTrend[];
    topRatedCars: TopRatedCar[];
    subscriberTrend: SubscriberTrend[];
}

export const FALLBACK_ANALYTICS: AnalyticsSummary = {
    kpis: {
        totalUsers: 0,
        newUsersThisMonth: 0,
        totalBookings: 0,
        bookingsThisMonth: 0,
        conversionRate: 0,
        avgBookingValue: 0,
        repeatCustomerRate: 0,
        avgRating: 0,
    },
    deviceBreakdown: [],
    topBrowsers: [],
    topOperatingSystems: [],
    bookingsByDay: [],
    revenueByCategory: [],
    bookingsByHour: [],
    registrationTrend: [],
    topRatedCars: [],
    subscriberTrend: [],
};
