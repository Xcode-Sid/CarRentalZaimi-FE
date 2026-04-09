export type BookingStatus = 'accepted' | 'refused' | 'finished';

export type AdditionalService = {
  id: string;
  name: string;
  pricePerDay: number;
  description?: string;
};

export interface Booking {
  id: string;
  ref: string;
  userId: string;
  vehicleId: number;
  vehicleName: string;
  vehicleIamge: string;
  paymentMethod: 'cash' | 'card';
  startDate: string;
  endDate?: string;
  total: number;
  status: BookingStatus;
  phoneNumber: string;
  refuzedBy: string;
  user: {
    firstName: string;
    lastName: string;
    image?: {
      imageData: string
    };
  };
  services: AdditionalService[]
}


const STATUS_MAP: Record<number, Booking['status']> = {
  1: 'accepted',
  2: 'refused',
  3: 'finished',
};

const PAYMENT_MAP: Record<string, 'cash' | 'card'> = {
  '0': 'cash',
  '1': 'card',
};

export function mapApiBooking(dto: any): Booking {
  return {
    id: dto.id,
    ref: dto.reference ?? dto.id,
    userId: dto.user?.id ?? '',
    vehicleId: dto.car?.id ?? '',
    vehicleName: dto.car?.title ?? '—',          // was `name` (always null)
    vehicleIamge: dto.car?.carImages?.[0] ?? '',  // was `image` (doesn't exist)
    startDate: dto.startDate,
    endDate: dto.endDate,
    total: Number(dto.totalPrice ?? 0),
    phoneNumber: dto.phoneNumber ?? '',
    paymentMethod: PAYMENT_MAP[dto.paymentMethod] ?? 'cash',  // was `.toLowerCase()` on "0"
    status: STATUS_MAP[dto.status] ?? 'pending',              // was `.toLowerCase()` on 1
    refuzedBy: dto.refuzedBy ?? null,
    user: {
      firstName: dto.user?.firstName ?? '',
      lastName: dto.user?.lastName ?? '',
      image: dto.user?.image ?? undefined,
    },
    services: (dto.bookingServices ?? []).map((bs: any) => ({  // was passing raw nested objects
      id: bs.additionalService?.id ?? bs.id,
      name: bs.additionalService?.name ?? '',
      pricePerDay: bs.additionalService?.pricePerDay ?? 0,
      description: bs.additionalService?.description,
    })),
  };
}

export const bookings: Booking[] = [
  {
    id: 'b1',
    ref: 'AZR-2026-00142',
    userId: 'user-1',
    vehicleId: 2,
    phoneNumber: '',
    refuzedBy: '',
    vehicleName: 'BMW X5',
    vehicleIamge: '',
    paymentMethod: 'cash',
    startDate: '2026-03-15',
    endDate: '2026-03-20',
    total: 570,
    status: 'finished',
    user: {
      firstName: "",
      lastName: "",
      image: {
        imageData: ""
      }
    },
    services: []
  },

];
