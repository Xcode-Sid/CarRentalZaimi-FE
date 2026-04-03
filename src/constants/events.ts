/** Custom DOM / internal events */
export const MUTATION_START = "mutation-start";
export const MUTATION_END = "mutation-end";
export const API_REQUEST_FAILED = "api-request-failed";
export const SESSION_EXPIRED = "session-expired";

/** Booking notification event names (from backend / SignalR) */
export const BOOKING_UPDATED = "BookingUpdated";
export const WAITLIST_SLOT_AVAILABLE = "WaitlistSlotAvailable";

/** Chat SignalR event names */
export const CHAT_MESSAGE_RECEIVED = "MessageReceived";
export const CHAT_PRIVATE_MESSAGE_RECEIVED = "PrivateMessageReceived";
export const CHAT_PRIVATE_MESSAGE_SENT = "PrivateMessageSent";
export const CHAT_USER_JOINED = "UserJoined";
export const CHAT_USER_LEFT = "UserLeft";
export const CHAT_USER_TYPING = "UserTyping";
export const CHAT_FRIEND_STATUS_CHANGED = "FriendStatusChanged";
export const CHAT_MESSAGE_MARKED_READ = "MessageMarkedAsRead";
export const CHAT_MESSAGE_MARKED_UNREAD = "MessageMarkedAsUnRead";
export const CHAT_ERROR = "Error";
