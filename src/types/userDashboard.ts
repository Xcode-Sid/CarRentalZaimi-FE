export interface UserDashboardKpis {
    totalBookings: number;
    activeBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalSpent: number;
    savedCarsCount: number;
    reviewsGiven: number;
    avgRatingGiven: number;
}

export interface UserBookingsByMonth {
    month: string;
    bookings: number;
}

export interface UserSpendingByMonth {
    month: string;
    amount: number;
}

export interface UserBookingByStatus {
    name: string;
    value: number;
}

export interface UserUpcomingBooking {
    id: string;
    ref: string;
    carName: string;
    carImage: string | null;
    startDate: string;
    endDate: string;
    total: number;
    status: string;
}

export interface UserRecentReview {
    id: string;
    carName: string;
    rating: number;
    comment: string;
    createdOn: string;
}

export interface UserFavoriteCar {
    id: string;
    name: string;
    image: string | null;
    category: string;
    pricePerDay: number;
}

export interface UserDashboardSummary {
    kpis: UserDashboardKpis;
    bookingsByMonth: UserBookingsByMonth[];
    spendingByMonth: UserSpendingByMonth[];
    bookingsByStatus: UserBookingByStatus[];
    upcomingBookings: UserUpcomingBooking[];
    recentReviews: UserRecentReview[];
    favoriteCars: UserFavoriteCar[];
}

export const FALLBACK_USER_DASHBOARD: UserDashboardSummary = {
    kpis: {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        totalSpent: 0,
        savedCarsCount: 0,
        reviewsGiven: 0,
        avgRatingGiven: 0,
    },
    bookingsByMonth: [],
    spendingByMonth: [],
    bookingsByStatus: [],
    upcomingBookings: [],
    recentReviews: [],
    favoriteCars: [],
};
