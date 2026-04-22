export interface CompanyProfileDto {
  id?: string;
  name?: string;
  logoUrl?: string;
  tagline?: string;
  aboutText?: string;
  missionTitle?: string;
  missionDescription?: string;
  whyChooseUs?: string;
  email?: string;
  phone?: string;
  address?: string;
  workingHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twiterUrl?: string;
  youtubeUrl?: string;
  whatsAppNumber?: string;
  years: number;
  cars: number;
  cities: number;
  clients: number;
}

export interface WhyChooseUsItem {
  icon: string;
  title: string;
  description: string;
}

export interface WorkingHoursEntry {
  day: string;
  openTime: string;
  closeTime: string;
}

export interface PhonePrefix {
  id: string;
  countryName: string | null;
  phonePrefix: string | null;
  flag: string | null;
  phoneRegex: string | null;
}

export interface PhonePrefixFormValues {
  countryName: string;
  phonePrefix: string;
  flag: string;
  phoneRegex: string;
}

export interface PolicyItem {
  id?: number | string;
  title?: string;
  description?: string;
  icon?: string;
  color?: string;
}
