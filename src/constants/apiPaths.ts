/** Auth (relative to VITE_API_ROOT) */
export const AUTH_LOGIN = "Authentication/login";
export const AUTH_REFRESH = "Authentication/refresh";
export const AUTH_ME = "Authentication/me";

/** Bookings — relative to VITE_API_ROOT (e.g. https://localhost:7020/api/v1/) */
const BOOKINGS = "bookings";
export const BOOKINGS_CHECK_IN = (bookingId: string) => `${BOOKINGS}/${bookingId}/check-in`;
export const BOOKINGS_WAITLIST_JOIN = `${BOOKINGS}/waitlist/join`;
export const BOOKINGS_WAITLIST_LEAVE = `${BOOKINGS}/waitlist/leave`;
export const BOOKINGS_WAITLIST_MY = `${BOOKINGS}/waitlist/my`;
export const BOOKINGS_WAITLIST_FOR_SLOT = (fieldId: string) => `${BOOKINGS}/${fieldId}/waitlist`;
export const BOOKINGS_RECURRING = `${BOOKINGS}/recurring`;
export const BOOKINGS_RECURRING_ME = `${BOOKINGS}/recurring/me`;
export const BOOKINGS_RECURRING_CANCEL = (seriesId: string) => `${BOOKINGS}/recurring/${seriesId}/cancel`;
export const BOOKINGS_INVITE = (bookingId: string) => `${BOOKINGS}/${bookingId}/invite`;
export const BOOKINGS_INVITATIONS_ACCEPT = (invitationId: string) =>
  `${BOOKINGS}/invitations/${invitationId}/accept`;
export const BOOKINGS_INVITATIONS_DECLINE = (invitationId: string) =>
  `${BOOKINGS}/invitations/${invitationId}/decline`;
export const BOOKINGS_INVITATIONS_PENDING = `${BOOKINGS}/invitations/pending`;
export const BOOKINGS_CANCELLATION_POLICIES = `${BOOKINGS}/cancellation-policies`;
export const BOOKINGS_CANCELLATION_POLICY_BY_ID = (id: string) =>
  `${BOOKINGS}/cancellation-policies/${id}`;
export const BOOKINGS_CANCELLATION_POLICY_FOR_BOOKING = (bookingId: string) =>
  `${BOOKINGS}/cancellation-policies/for-booking/${bookingId}`;
export const BOOKINGS_USER = (userId: string) => `${BOOKINGS}/user/${userId}`;

/** Chat — relative to VITE_API_ROOT */
const CHAT = "chat";
export const CHAT_CONNECTIONS_DIRECT = `${CHAT}/connections/direct`;
export const CHAT_CONNECTIONS_ROOMS = `${CHAT}/connections/rooms`;
export const CHAT_CONNECTION_MESSAGES = (connectionId: string) =>
  `${CHAT}/connections/${connectionId}/messages`;
export const CHAT_ROOM_MESSAGES = (roomId: string) =>
  `${CHAT}/rooms/${roomId}/messages`;
export const CHAT_SEND = `${CHAT}/send`;
export const CHAT_MESSAGES = (messageId: string) => `${CHAT}/messages/${messageId}`;
export const CHAT_MESSAGES_PIN = (messageId: string) => `${CHAT}/messages/${messageId}/pin`;
export const CHAT_PINNED = `${CHAT}/pinned`;
export const CHAT_ARCHIVE = `${CHAT}/archive`;
export const CHAT_UNARCHIVE = `${CHAT}/unarchive`;
export const CHAT_BLOCK = `${CHAT}/block`;
export const CHAT_MESSAGES_REPORT = (messageId: string) => `${CHAT}/messages/${messageId}/report`;
export const CHAT_MEDIA_IMAGE = "chat/media/image";
export const CHAT_MEDIA_VOICE = "chat/media/voice";
export const CHAT_ROOMS_CREATE = `${CHAT}/rooms`;
export const CHAT_ROOMS_INVITE = (roomId: string) => `${CHAT}/rooms/${roomId}/invite`;
export const CHAT_ROOMS_BATCH_BAN = (roomId: string) =>
  `${CHAT}/rooms/${roomId}/batch/ban`;
export const CHAT_ROOMS_BATCH_INVITE = `${CHAT}/rooms/batch/invite`;
export const CHAT_INVITATIONS = `${CHAT}/invitations`;
export const CHAT_INVITATION_ACCEPT = (id: string) =>
  `${CHAT}/invitations/${id}/accept`;
export const CHAT_INVITATION_DECLINE = (id: string) =>
  `${CHAT}/invitations/${id}/decline`;
export const CHAT_INVITATIONS_SENT = `${CHAT}/invitations/sent`;
export const CHAT_INVITATIONS_BATCH_ACCEPT = `${CHAT}/invitations/batch/accept`;
export const CHAT_INVITATIONS_BATCH_DECLINE = `${CHAT}/invitations/batch/decline`;

/** Mark read / unread — single message */
export const CHAT_MESSAGE_READ = (messageId: string) =>
  `${CHAT}/messages/${messageId}/read`;
export const CHAT_MESSAGE_UNREAD = (messageId: string) =>
  `${CHAT}/messages/${messageId}/unread`;

/** Mark read / unread — bulk for a DM connection */
export const CHAT_CONNECTION_READ = (connectionId: string) =>
  `${CHAT}/connections/${connectionId}/read`;
export const CHAT_CONNECTION_UNREAD = (connectionId: string) =>
  `${CHAT}/connections/${connectionId}/unread`;

/** Mark read / unread — bulk for a room */
export const CHAT_ROOM_READ = (roomId: string) =>
  `${CHAT}/rooms/${roomId}/read`;
export const CHAT_ROOM_UNREAD = (roomId: string) =>
  `${CHAT}/rooms/${roomId}/unread`;

/** Users — relative to VITE_API_ROOT */
export const USERS_SEARCH = "users/search";

/** Profile field definitions — relative to VITE_API_ROOT */
export const PROFILE_FIELD_DEFINITIONS = "api/v1/ProfileFieldDefinitions";

/** Admin profile field definitions — relative to VITE_API_ROOT */
export const ADMIN_PROFILE_FIELD_DEFINITIONS = "api/v1/admin/profile-field-definitions";
export const ADMIN_PROFILE_FIELD_DEFINITIONS_BY_ID = (id: string | number) =>
  `api/v1/admin/profile-field-definitions/${id}`;
