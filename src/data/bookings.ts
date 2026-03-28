export interface Booking {
  id: string;
  ref: string;
  userId: string;
  vehicleId: number;
  vehicleName: string;
  paymentMethod: 'cash' | 'card';
  startDate: string;
  endDate?: string;
  total: number;
  status: 'accepted' | 'refused' | 'finished';
  addons?: string[];
}

export const bookings: Booking[] = [
  {
    id: 'b1',
    ref: 'AZR-2026-00142',
    userId: 'user-1',
    vehicleId: 2,
    vehicleName: 'BMW X5',
    paymentMethod: 'cash',
    startDate: '2026-03-15',
    endDate: '2026-03-20',
    total: 570,
    status: 'finished',
  },
  {
    id: 'b2',
    ref: 'AZR-2026-00087',
    userId: 'user-1',
    vehicleId: 3,
    vehicleName: 'Tesla Model 3',
    paymentMethod: 'cash',
    startDate: '2026-03-02',
    endDate: '2026-03-08',
    total: 450,
    status: 'accepted',
  },
  {
    id: 'b3',
    ref: 'AZR-2026-00198',
    userId: 'user-1',
    vehicleId: 4,
    vehicleName: 'Audi A4',
    paymentMethod: 'card',
    startDate: '2026-03-28',
    endDate: '2026-04-02',
    total: 270,
    status: 'accepted',
  },
  {
    id: 'b4',
    ref: 'AZR-2026-00156',
    userId: 'user-1',
    vehicleId: 6,
    vehicleName: 'Mercedes-Benz GLE',
    paymentMethod: 'cash',
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    total: 360,
    status: 'refused',
  },
  {
    id: 'b5',
    ref: 'AZR-2026-00201',
    userId: 'user-1',
    vehicleId: 3,
    vehicleName: 'Tesla Model 3',
    paymentMethod: 'card',
    startDate: '2026-04-05',
    endDate: '2026-04-06',
    total: 150,
    status: 'accepted',
  },
];
