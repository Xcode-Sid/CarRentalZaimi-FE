import type { TFunction } from 'i18next';
import type { Booking } from '../data/bookings';

export function formatBookingPeriod(b: Booking, t: TFunction): string {
  void t;
  return `${b.startDate}${b.endDate ? ` — ${b.endDate}` : ''}`;
}
