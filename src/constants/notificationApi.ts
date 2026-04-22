const BASE = 'Notification';

export const NOTIF_LIST = BASE;
export const NOTIF_UNREAD_COUNT = `${BASE}/unread-count`;
export const NOTIF_READ_ALL = `${BASE}/read-all`;
export const NOTIF_BY_ID = (id: string) => `${BASE}/${id}`;
export const NOTIF_READ = (id: string) => `${BASE}/${id}/read`;
export const NOTIF_UNREAD = (id: string) => `${BASE}/${id}/unread`;

const ADMIN = `${BASE}/admin`;

export const NOTIF_ADMIN_LIST = ADMIN;
export const NOTIF_ADMIN_BY_ID = (id: string) => `${ADMIN}/${id}`;
export const NOTIF_ADMIN_READ = (id: string) => `${ADMIN}/${id}/read`;
export const NOTIF_ADMIN_DELETE = (id: string) => `${ADMIN}/${id}`;
