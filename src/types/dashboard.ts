export interface DashboardKpis {
    activeRentals: number;
    activeRentalsChange: number;
    availableCars: number;
    carsInMaintenance: number;
    totalRevenue: number;
    revenueChange: number;
    newBookings: number;
    pendingBookings: number;
    totalCustomers: number;
    activePromotions: number;
    subscriberCount: number;
    averageRating: number;
}

export interface DashboardSparkline {
    data: { x: string; y: number }[];
}

export interface PaymentSplit {
    cashTotal: number;
    cardTotal: number;
}

export interface FleetStatus {
    available: number;
    maintenance: number;
    unavailable: number;
    total: number;
}

export interface RevenuePoint {
    month: string;
    revenue: number;
}

export interface BookingsChartPoint {
    week: string;
    rentals: number;
}

export interface PopularCar {
    car: string;
    bookings: number;
}

export interface FleetCategory {
    name: string;
    value: number;
}

export interface BookingsByStatus {
    name: string;
    value: number;
}

export interface CustomerGrowthPoint {
    month: string;
    customers: number;
}

export interface TopCustomer {
    name: string;
    initials: string;
    totalBookings: number;
    totalSpent: number;
}

export interface RecentReview {
    id: string;
    carName: string;
    rating: number;
    comment: string;
    userName: string;
    createdOn: string;
}

export interface TodayActivity {
    pickups: number;
    returns: number;
}

export interface RecentBooking {
    id: string;
    ref: string;
    customerName: string;
    customerInitials: string;
    vehicleName: string;
    total: number;
    status: number | null;
    isCanceled?: boolean;
}

export interface DashboardSummary {
    kpis: DashboardKpis;
    sparklines: Record<string, DashboardSparkline>;
    paymentSplit: PaymentSplit;
    fleetStatus: FleetStatus;
    revenueChart: RevenuePoint[];
    bookingsChart: BookingsChartPoint[];
    popularCars: PopularCar[];
    fleetDistribution: FleetCategory[];
    bookingsByStatus: BookingsByStatus[];
    customerGrowth: CustomerGrowthPoint[];
    topCustomers: TopCustomer[];
    recentReviews: RecentReview[];
    todayActivity: TodayActivity;
    recentBookings: RecentBooking[];
}
