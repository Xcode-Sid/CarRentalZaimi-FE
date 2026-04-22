export enum DeviceType {
  Mobile = 1,
  Tablet = 2,
  Desktop = 3,
}

export interface DeviceInfo {
  deviceType: DeviceType;
  userAgent: string;
  operatingSystem: string;
  browser: string;
  lastIPAddress: string;
}

export interface PendingAuthData {
  token: string;
  user: Record<string, unknown>;
  role: { name: string } | string;
}
