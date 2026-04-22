export interface Partner {
  id: string;
  name: string;
  initials: string;
  color: string;
  isActive: boolean;
}

export interface PartnerFormValues {
  name: string;
  initials: string;
  color: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  email: string | null;
  isUnsubscribed: boolean;
}

export interface Term {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  color: string;
  isActive: boolean;
}

export interface TermFormValues {
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface PrivacyPolicy {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  color: string;
  isActive: boolean;
}

export interface PrivacyPolicyFormValues {
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface OccupiedCarDays {
  id: string;
  car: {
    id: string;
    title: string;
  };
  startDate: string;
  endDate: string;
  type: string;
}

export interface OccupiedCarDaysFilterValues {
  carId: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface OccupiedCarDaysFormValues {
  carId: string;
  startDate: Date | null;
  endDate: Date | null;
  type: string;
}

export interface CarOption {
  id: string;
  title: string;
}

export interface OccupiedDateEntry {
  date: Date;
  type: string;
}

export interface AdsFormValues {
  title: string;
  imageName: string;
  videoName: string;
  imageData: string;
  videoData: string;
  linkUrl: string;
  position: 'top' | 'bottom' | '';
  isActive: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNr: number;
  pageSize: number;
}

export interface AdditionalService {
  id: string;
  name: string;
  icon: string | null;
  pricePerDay: number;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  title: string | null;
  description: string | null;
  code: string | null;
  discountPercentage: number;
  numberOfDays: number;
  isActive: boolean;
  carId: string | null;
  carCategoryId: string | null;
  carName?: string | null;
  carCategoryName?: string | null;
}

export interface PromotionCarCategory {
  id: string;
  name: string;
}

export interface PromotionCar {
  id: string;
  title: string | null;
  licensePlate: string;
}
