import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { bookings as initialBookings, type Booking } from '../data/bookings';

interface BookingsContextType {
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  getUserBookings: (userId: string) => Booking[];
}

const BookingsContext = createContext<BookingsContextType | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookingsList, setBookingsList] = useState<Booking[]>(initialBookings);

  const addBooking = useCallback((booking: Booking) => {
    setBookingsList((prev) => [booking, ...prev]);
  }, []);

  const updateBookingStatus = useCallback((id: string, status: Booking['status']) => {
    setBookingsList((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  }, []);

  const getUserBookings = useCallback(
    (userId: string) => bookingsList.filter((b) => b.userId === userId),
    [bookingsList],
  );

  return (
    <BookingsContext.Provider
      value={{ bookings: bookingsList, addBooking, updateBookingStatus, getUserBookings }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
