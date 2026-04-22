import {
    createContext, useContext, useState, useCallback, useEffect, useRef,
    type ReactNode,
} from 'react';
import * as signalR from '@microsoft/signalr';
import i18next from 'i18next';
import { useAuth } from './AuthContext';
import { get, del, getAccessToken } from '../utils/apiUtils';
import { notifications } from '@mantine/notifications';
import { showApiError, showApiSuccess } from '../utils/notifications';
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from '../data/storageKeys';
import {
    NOTIF_RECEIVE, NOTIF_READ, NOTIF_UNREAD, NOTIF_DELETED, NOTIF_ALL_READ,
} from '../constants/events';
import {
    NOTIF_LIST, NOTIF_UNREAD_COUNT, NOTIF_READ_ALL,
    NOTIF_READ as NOTIF_READ_ENDPOINT, NOTIF_UNREAD as NOTIF_UNREAD_ENDPOINT,
    NOTIF_BY_ID,
    NOTIF_ADMIN_LIST, NOTIF_ADMIN_READ, NOTIF_ADMIN_DELETE,
} from '../constants/notificationApi';
import type { UserNotificationDto, NotificationPagedResponse } from '../types/notification';
import { NOTIFICATIONS_PAGE_SIZE } from '../constants/pagination';

function deriveHubUrl(): string {
    const apiRoot = import.meta.env.VITE_API_ROOT as string;
    try {
        const url = new URL(apiRoot);
        return `${url.origin}/hubs/notifications`;
    } catch {
        const clean = apiRoot.replace(/\/api\/.*$/, '').replace(/\/+$/, '');
        return `${clean}/hubs/notifications`;
    }
}

interface NotificationsContextType {
    notifications: UserNotificationDto[];
    unreadCount: number;
    loading: boolean;
    page: number;
    totalPages: number;
    goToPage: (page: number) => Promise<void>;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAsUnread: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

async function patchRequest(endpoint: string): Promise<boolean> {
    const apiRoot = import.meta.env.VITE_API_ROOT as string;
    const token = getAccessToken();
    const language = i18next.language || localStorage.getItem(STORAGE_KEYS.LANGUAGE) || DEFAULT_LANGUAGE;

    const response = await fetch(`${apiRoot}${endpoint}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': language,
            'X-User-Language': language,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    const text = await response.text();
    if (!text) return true;

    try {
        const res = JSON.parse(text);
        if (res.success) {
            if (res.message) showApiSuccess(res.message);
            return true;
        }
        const msg =
            (Array.isArray(res.errors) && res.errors.length > 0 && res.errors[0]) ||
            res.message ||
            i18next.t('common.somethingWentWrong');
        showApiError(msg);
        return false;
    } catch {
        return false;
    }
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const { user, isAdmin, isLoggedIn } = useAuth();
    const [items, setItems] = useState<UserNotificationDto[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    const listEndpoint = isAdmin ? NOTIF_ADMIN_LIST : NOTIF_LIST;

    const fetchUnreadCount = useCallback(async () => {
        if (!isLoggedIn) return;
        try {
            const res = await get<number>(NOTIF_UNREAD_COUNT);
            if (res.success) setUnreadCount(res.data ?? 0);
        } catch { /* ignore */ }
    }, [isLoggedIn]);

    const fetchPage = useCallback(async (pageNum: number) => {
        if (!isLoggedIn) return;
        setLoading(true);
        try {
            const res = await get<NotificationPagedResponse<UserNotificationDto>>(
                listEndpoint,
                { pageNumber: pageNum, pageSize: NOTIFICATIONS_PAGE_SIZE },
            );
            if (res.success && res.data) {
                const list = Array.isArray(res.data.items)
                    ? res.data.items
                    : (res.data as any)?.$values ?? [];
                setItems(list);
                setPage(pageNum);
                setTotalPages(res.data.totalPages ?? 1);
            }
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, [isLoggedIn, listEndpoint]);

    const fetchNotifications = useCallback(() => fetchPage(1), [fetchPage]);

    const goToPage = useCallback((p: number) => fetchPage(p), [fetchPage]);

    const markAsRead = useCallback(async (id: string) => {
        const endpoint = isAdmin ? NOTIF_ADMIN_READ(id) : NOTIF_READ_ENDPOINT(id);
        const ok = await patchRequest(endpoint);
        if (ok) {
            setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount((c) => Math.max(0, c - 1));
        }
    }, [isAdmin]);

    const markAsUnread = useCallback(async (id: string) => {
        const ok = await patchRequest(NOTIF_UNREAD_ENDPOINT(id));
        if (ok) {
            setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: false } : n));
            setUnreadCount((c) => c + 1);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        const ok = await patchRequest(NOTIF_READ_ALL);
        if (ok) {
            setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        const endpoint = isAdmin ? NOTIF_ADMIN_DELETE(id) : NOTIF_BY_ID(id);
        try {
            await del(endpoint);
            setItems((prev) => {
                const removed = prev.find((n) => n.id === id);
                if (removed && !removed.isRead) setUnreadCount((c) => Math.max(0, c - 1));
                return prev.filter((n) => n.id !== id);
            });
        } catch { /* error already shown by del() */ }
    }, [isAdmin]);

    // SignalR connection lifecycle
    useEffect(() => {
        if (!isLoggedIn) {
            setItems([]);
            setUnreadCount(0);
            return;
        }

        const hubUrl = deriveHubUrl();
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => getAccessToken() ?? '',
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        connection.on(NOTIF_RECEIVE, (notification: UserNotificationDto) => {
            setItems((prev) => [notification, ...prev]);
            if (!notification.isRead) setUnreadCount((c) => c + 1);
            notifications.show({
                color: 'teal',
                title: i18next.t('notifications.newNotification'),
                message: notification.message,
                autoClose: 5000,
            });
        });

        connection.on(NOTIF_READ, (data: { notificationId: string }) => {
            setItems((prev) =>
                prev.map((n) => n.id === data.notificationId ? { ...n, isRead: true } : n),
            );
            setUnreadCount((c) => Math.max(0, c - 1));
        });

        connection.on(NOTIF_UNREAD, (data: { notificationId: string }) => {
            setItems((prev) =>
                prev.map((n) => n.id === data.notificationId ? { ...n, isRead: false } : n),
            );
            setUnreadCount((c) => c + 1);
        });

        connection.on(NOTIF_DELETED, (data: { notificationId: string }) => {
            setItems((prev) => {
                const removed = prev.find((n) => n.id === data.notificationId);
                if (removed && !removed.isRead) {
                    setUnreadCount((c) => Math.max(0, c - 1));
                }
                return prev.filter((n) => n.id !== data.notificationId);
            });
        });

        connection.on(NOTIF_ALL_READ, () => {
            setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        });

        connection.start().catch((err) => console.error('SignalR connect error:', err));
        connectionRef.current = connection;

        return () => {
            connection.stop();
            connectionRef.current = null;
        };
    }, [isLoggedIn, user?.id]);

    // Initial data fetch
    useEffect(() => {
        if (isLoggedIn) {
            fetchUnreadCount();
            fetchNotifications();
        }
    }, [isLoggedIn, fetchUnreadCount, fetchNotifications]);

    // Re-fetch on language change so messages appear in the new language
    useEffect(() => {
        const handler = () => {
            if (isLoggedIn) fetchNotifications();
        };
        i18next.on('languageChanged', handler);
        return () => { i18next.off('languageChanged', handler); };
    }, [isLoggedIn, fetchNotifications]);

    return (
        <NotificationsContext.Provider
            value={{
                notifications: items,
                unreadCount,
                loading,
                page,
                totalPages,
                goToPage,
                fetchNotifications,
                markAsRead,
                markAsUnread,
                markAllAsRead,
                deleteNotification,
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
    return ctx;
}
