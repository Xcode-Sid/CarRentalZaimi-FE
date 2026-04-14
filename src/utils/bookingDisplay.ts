import type { TFunction } from 'i18next';
import type { Booking } from '../data/bookings';

export function formatBookingPeriod(b: Booking, t: TFunction): string {
  void t;
  const format = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return `${format(b.startDate)}${b.endDate ? ` — ${format(b.endDate)}` : ''}`;
}