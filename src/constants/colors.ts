export const categoryColors: Record<string, string> = {
    Luksoze: 'yellow',
    SUV: 'green',
    Elektrike: 'blue',
    Ekonomike: 'gray',
};

export const bookingStatusColors: Record<string, string> = {
    accepted: 'orange',
    refused: 'red',
    done: 'teal',
    Accepted: 'orange',
    Refused: 'red',
    Done: 'teal',
    Pending: 'yellow',
    pending: 'yellow',
    Cancelled: 'red',
    cancelled: 'red',
};

export const customerStatusColors: Record<string, string> = {
    accepted: 'green',
    refused: 'red',
    finished: 'gray',
};

export const bookingStatusKeys: Record<string, string> = {
    accepted: 'account.accepted',
    refused: 'account.refused',
    done: 'account.done',
};

export const BOOKING_STATUS_INT: Record<number, string> = {
    1: 'Accepted',
    2: 'Refused',
    3: 'Done',
};

export const BOOKING_STATUS_CHART_COLOR: Record<string, string> = {
    Accepted: 'orange.6',
    Refused: 'red.6',
    Done: 'teal.6',
    Pending: 'yellow.6',
    Cancelled: 'red.4',
};

export const BOOKING_STATUS_I18N: Record<string, string> = {
    Accepted: 'status.accepted',
    Refused: 'status.refused',
    Done: 'status.done',
    Pending: 'status.pending',
    Cancelled: 'status.cancelled',
    Pranuar: 'status.accepted',
    Refuzuar: 'status.refused',
    Përfunduar: 'status.done',
    'Në Pritje': 'status.pending',
    Anuluar: 'status.cancelled',
    Anulluar: 'status.cancelled',
};

export const FLEET_CATEGORY_COLORS: Record<string, string> = {
    SUV: 'green.6',
    Sedan: 'blue.6',
    Hatchback: 'cyan.6',
    Coupe: 'grape.6',
    Convertible: 'orange.6',
    Minivan: 'indigo.6',
    Truck: 'red.6',
    Luxury: 'yellow.6',
    Luksoze: 'yellow.6',
    Elektrike: 'blue.6',
    Ekonomike: 'gray.6',
};

export const DEVICE_COLORS: Record<string, string> = {
    Desktop: 'teal.6',
    Mobile: 'cyan.6',
    Tablet: 'grape.6',
    Unknown: 'gray.6',
};

export const SPARKLINE_COLORS: Record<string, string> = {
    rentals: 'teal.5',
    cars: 'teal.5',
    revenue: 'green.5',
    bookings: 'orange.5',
};

export const bookingStatusGradients: Record<string, string> = {
    accepted: 'linear-gradient(135deg, #7A3B00 0%, #B35900 40%, #F08030 100%)',
    refused: 'linear-gradient(135deg, #7a1a1a 0%, #A32D2D 50%, #E24B4A 100%)',
    done: 'linear-gradient(135deg, #0D4D4D 0%, #1A7A7A 50%, #2AADAD 100%)',
};

export const bookingStatusDotColors: Record<string, string> = {
    accepted: '#FFD4A8',
    refused: '#F7C1C1',
    done: '#A8EDED',
};

export const occupiedDayTypeColors: Record<string, string> = {
    Booking: '#ef4444',
    Maintenance: '#f59e0b',
    PrivateUse: '#3b82f6',
    Other: '#8b5cf6',
};

export const occupiedDayTypeLabels: Record<string, string> = {
    Booking: 'occupiedDays.typeBooking',
    Maintenance: 'occupiedDays.typeMaintenance',
    PrivateUse: 'occupiedDays.typePrivateUse',
    Other: 'occupiedDays.typeOther',
};

export const vehicleStatusDotClass: Record<string, string> = {
    available: 'status-dot-available',
    maintenance: 'status-dot-maintenance',
    unavailable: 'status-dot-unavailable',
};
