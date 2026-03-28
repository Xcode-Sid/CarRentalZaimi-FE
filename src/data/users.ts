export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: 'admin' | 'user';
  avatar: string;
  savedVehicles: number[];
  /** Demo: shown in admin customers table */
  customerStatus?: 'active' | 'inactive';
}

export const users: User[] = [
  {
    id: 'admin-1',
    firstName: 'Admin',
    lastName: 'AutoZaimi',
    email: 'admin@autozaimi.al',
    password: 'admin123',
    phone: '+355 44 123 456',
    address: 'Rruga Durrësit 100',
    role: 'admin',
    avatar: 'AA',
    savedVehicles: [],
  },
  {
    id: 'user-1',
    firstName: 'Artan',
    lastName: 'Hoxha',
    email: 'user@autozaimi.al',
    password: 'user123',
    phone: '+355 69 123 4567',
    address: 'Rruga Myslym Shyri',
    role: 'user',
    avatar: 'AH',
    savedVehicles: [1, 3, 8],
  },
  {
    id: 'user-2',
    firstName: 'Elona',
    lastName: 'Kushi',
    email: 'elona@email.com',
    password: 'demo123',
    phone: '+355 69 234 5678',
    address: 'Rruga e Kavajës',
    role: 'user',
    avatar: 'EK',
    savedVehicles: [2],
  },
  {
    id: 'user-3',
    firstName: 'Dritan',
    lastName: 'Leka',
    email: 'dritan@email.com',
    password: 'demo123',
    phone: '+355 69 345 6789',
    address: 'Laprakë',
    role: 'user',
    avatar: 'DL',
    savedVehicles: [],
  },
  {
    id: 'user-4',
    firstName: 'Blerina',
    lastName: 'Topi',
    email: 'blerina@email.com',
    password: 'demo123',
    phone: '+355 69 456 7890',
    address: 'Kombinat',
    role: 'user',
    avatar: 'BT',
    savedVehicles: [4],
  },
  {
    id: 'user-5',
    firstName: 'Gentian',
    lastName: 'Muka',
    email: 'gentian@email.com',
    password: 'demo123',
    phone: '+355 69 567 8901',
    address: 'Fushë Krujë',
    role: 'user',
    avatar: 'GM',
    savedVehicles: [],
    customerStatus: 'inactive',
  },
];
