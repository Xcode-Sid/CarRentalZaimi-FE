export interface ApiResponse<T> {
  success: boolean;
  // Some helpers (like GET) currently type responses without a message;
  // make it optional so they're compatible while backend still sends it.
  message?: string | null;
  data: T;
  // Optional array of backend validation / domain errors.
  errors?: string[] | null;
  // Allow extra metadata such as headers when needed.
  headers?: any;
}

export interface LoginUser {
  id: string;
  userName: string | null;
  email: string | null;
  phoneNumber: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  profilePictureUrl: string | null;
  status: number;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  isActive: boolean;
  // lastLoginAt: string | null;
}

export interface LoginRole {
  id: string;
  name: string;
  normalizedName: string;
}

// export enum PresenceStatus {
//   Online = 1,
//   Away = 2,
//   Busy = 3,
//   DoNotDisturb = 4,
//   Invisible = 5,
//   Offline = 6,
// }

// export interface LoginPresence {
//   status: PresenceStatus;
//   manualStatus: PresenceStatus | null;
//   customStatusText: string | null;
//   customStatusEmoji: string | null;
//   lastActiveAt: string | null;
//   lastConnectedAt: string | null;
//   lastDisconnectedAt: string | null;
//   id: string;
//   createdOn: string;
// }

export interface LoginTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: LoginUser | null;
  role: LoginRole | null;
  // presence: LoginPresence | null;
}

export interface CurrentUser {
  id: string;
  userName: string | null;
  email: string | null;
  phoneNumber: string | null;
  displayName: string | null;
  status: string;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  lastLoginAt: string;
  timeZone: string;
  preferredLanguage: string;
}

