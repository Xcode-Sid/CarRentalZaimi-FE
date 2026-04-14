
export const ROLES = [
  {
    name: "Admin",
  },
  {
    name: "User",
  },
] as const;

export interface UserImage {
  id?: string;
  imageName: string | null;
  imagePath: string | null;
}

export interface UserRole {
  id?: string;
  name: string | null;
  normalizedName: string | null;
  concurrencyStamp?: string | null;
}


export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string | null;
  dateOfBirth: Date | null;
  role: UserRole | null;          // ← was: 'admin' | 'user'
  image: UserImage | null;
  avatar: string | null;    
  location: string | null;
  savedVehicles: number[];
  customerStatus?: 'active' | 'inactive';
}
export const users: User[] = [
  
];
