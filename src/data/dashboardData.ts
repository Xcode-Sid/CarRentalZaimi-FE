import type { DashboardSummary, DashboardSparkline } from '../types/dashboard';

export const FALLBACK_SPARKLINES: Record<string, DashboardSparkline> = {
    rentals: {
        data: [
            { x: '1', y: 0 }, { x: '2', y: 0 }, { x: '3', y: 0 }, { x: '4', y: 0 },
            { x: '5', y: 0 }, { x: '6', y: 0 }, { x: '7', y: 0 },
        ],
    },
    cars: {
        data: [
            { x: '1', y: 0 }, { x: '2', y: 0 }, { x: '3', y: 0 }, { x: '4', y: 0 },
            { x: '5', y: 0 }, { x: '6', y: 0 }, { x: '7', y: 0 },
        ],
    },
    revenue: {
        data: [
            { x: '1', y: 0 }, { x: '2', y: 0 }, { x: '3', y: 0 }, { x: '4', y: 0 },
            { x: '5', y: 0 }, { x: '6', y: 0 }, { x: '7', y: 0 },
        ],
    },
    bookings: {
        data: [
            { x: '1', y: 0 }, { x: '2', y: 0 }, { x: '3', y: 0 }, { x: '4', y: 0 },
            { x: '5', y: 0 }, { x: '6', y: 0 }, { x: '7', y: 0 },
        ],
    },
};

export const FALLBACK_DASHBOARD: DashboardSummary = {
    kpis: {
        activeRentals: 0,
        activeRentalsChange: 0,
        availableCars: 0,
        carsInMaintenance: 0,
        totalRevenue: 0,
        revenueChange: 0,
        newBookings: 0,
        pendingBookings: 0,
        totalCustomers: 0,
        activePromotions: 0,
        subscriberCount: 0,
        averageRating: 0,
    },
    sparklines: FALLBACK_SPARKLINES,
    paymentSplit: { cashTotal: 0, cardTotal: 0 },
    fleetStatus: { available: 0, maintenance: 0, unavailable: 0, total: 0 },
    revenueChart: [],
    bookingsChart: [],
    popularCars: [],
    fleetDistribution: [],
    bookingsByStatus: [],
    customerGrowth: [],
    topCustomers: [],
    recentReviews: [],
    todayActivity: { pickups: 0, returns: 0 },
    recentBookings: [],
};
