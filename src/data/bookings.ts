import { toImagePath } from "../utils/general";

export type BookingStatus = 'accepted' | 'refused' | 'done';

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
  3: 'done',
};

const REFUSED_MAP: Record<number, Booking['refuzedBy']> = {
  1: 'none',
  2: 'user',
  3: 'admin',
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
    vehicleName: dto.car?.title ?? '—',     
    vehicleIamge: toImagePath(dto.car?.carImages?.[0].imagePath )?? '',  
    startDate: dto.startDate,
    endDate: dto.endDate,
    total: Number(dto.totalPrice ?? 0),
    phoneNumber: dto.phoneNumber ?? '',
    paymentMethod: PAYMENT_MAP[dto.paymentMethod] ?? 'cash',  
    status: STATUS_MAP[dto.status] ?? '-',          
    refuzedBy: REFUSED_MAP[dto.refuzedBy] ?? '-',
    user: {
      firstName: dto.user?.firstName ?? '',
      lastName: dto.user?.lastName ?? '',
      image: {
        imageData : dto.user?.image.imagePath ?? undefined,
      }
    },
    services: (dto.bookingServices ?? []).map((bs: any) => ({  
      id: bs.additionalService?.id ?? bs.id,
      name: bs.additionalService?.name ?? '',
      pricePerDay: bs.additionalService?.pricePerDay ?? 0,
      description: bs.additionalService?.description,
    })),
  };
}

