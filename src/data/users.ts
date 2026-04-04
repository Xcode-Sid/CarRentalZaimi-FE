export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: Date | null;
  username: string | null;
  name: string | null;
  date: string;
  role: 'admin' | 'user';
  location: string | null;
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
    phoneNumber: '+355 44 123 456',
    address: 'Rruga Durrësit 100',
    role: 'admin',
    dateOfBirth: null,
    username: "test",
    name: '',
    date: '',
    location: '',
    savedVehicles: [],
  },
  {
    id: 'user-1',
    firstName: 'Artan',
    lastName: 'Hoxha',
    email: 'user@autozaimi.al',
    password: 'user123',
    phoneNumber: '+355 69 123 4567',
    address: 'Rruga Myslym Shyri',
    dateOfBirth: null,
    username: "test",
    name: '',
    date: '',
    role: 'user',
    location: '',
    savedVehicles: [1, 3, 8],
  },
];
