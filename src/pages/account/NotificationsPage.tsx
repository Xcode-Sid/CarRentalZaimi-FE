import { useCallback } from 'react';
import {
    Title, Text, Group, Stack, Box, Button, ActionIcon, Tooltip, Badge,
    ThemeIcon, Loader, Center, Pagination,
} from '@mantine/core';
import {
    IconBell, IconCheck, IconChecks, IconTrash, IconEyeOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NOTIFICATION_TYPE_META } from '../../types/notification';
import { EmptyState } from '../../components/common/EmptyState';
import { AnimatedSection } from '../../components/common/AnimatedSection';

function timeAgo(dateStr: string, t: (key: string) => string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return t('notifications.justNow');
    if (minutes < 60) return t('notifications.minutesAgo').replace('{{count}}', String(minutes));
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('notifications.hoursAgo').replace('{{count}}', String(hours));
    const days = Math.floor(hours / 24);
    return t('notifications.daysAgo').replace('{{count}}', String(days));
}

export default function NotificationsPage() {
    const { t } = useTranslation();
    const {
        notifications, unreadCount, loading, page, totalPages,
        goToPage, markAsRead, markAsUnread, markAllAsRead, deleteNotification,
    } = useNotifications();

    const handleMarkRead = useCallback(async (id: string) => {
        await markAsRead(id);
    }, [markAsRead]);

    const handleMarkUnread = useCallback(async (id: string) => {
        await markAsUnread(id);
    }, [markAsUnread]);

    const handleDelete = useCallback(async (id: string) => {
        await deleteNotification(id);
    }, [deleteNotification]);

    return (
        <AnimatedSection>
            <Stack gap="lg">
                <Group justify="space-between" align="center">
                    <Group gap="sm">
                        <IconBell size={28} color="var(--az-teal)" />
                        <Title order={2}>{t('account.notifications')}</Title>
                        {unreadCount > 0 && (
                            <Badge color="red" variant="filled" size="lg" circle>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                        )}
                    </Group>
                    {unreadCount > 0 && (
                        <Button
                            variant="light"
                            color="teal"
                            size="xs"
                            leftSection={<IconChecks size={16} />}
                            onClick={markAllAsRead}
                        >
                            {t('notifications.markAllRead')}
                        </Button>
                    )}
                </Group>

                {loading && notifications.length === 0 ? (
                    <Center py="xl">
                        <Loader color="teal" />
                    </Center>
                ) : notifications.length === 0 ? (
                    <EmptyState
                        icon={<IconBell size={40} />}
                        title={t('notifications.empty')}
                    />
                ) : (
                    <Stack gap="sm">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={page}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Stack gap="sm">
                                    {notifications.map((n) => {
                                        const meta = NOTIFICATION_TYPE_META[n.userNotificationType];
                                        const Icon = meta?.icon ?? IconBell;
                                        const color = meta?.color ?? 'gray';
                                        return (
                                            <motion.div
                                                key={n.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Box
                                                    className="glass-card card-gradient-border"
                                                    p="md"
                                                    style={{
                                                        opacity: n.isRead ? 0.7 : 1,
                                                        borderLeft: n.isRead
                                                            ? '3px solid transparent'
                                                            : `3px solid var(--mantine-color-${color}-6)`,
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => !n.isRead && handleMarkRead(n.id)}
                                                >
                                                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                                                        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                                                            <ThemeIcon
                                                                variant="light"
                                                                color={color}
                                                                size="lg"
                                                                radius="xl"
                                                            >
                                                                <Icon size={20} />
                                                            </ThemeIcon>
                                                            <Stack gap={2} style={{ flex: 1 }}>
                                                                <Text
                                                                    size="sm"
                                                                    fw={n.isRead ? 400 : 600}
                                                                    lineClamp={3}
                                                                >
                                                                    {n.message}
                                                                </Text>
                                                                <Text size="xs" c="dimmed">
                                                                    {timeAgo(n.createdOn, t)}
                                                                </Text>
                                                            </Stack>
                                                        </Group>
                                                        <Group gap={4} wrap="nowrap">
                                                            {n.isRead ? (
                                                                <Tooltip label={t('notifications.markUnread')}>
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="blue"
                                                                        size="sm"
                                                                        onClick={(e) => { e.stopPropagation(); handleMarkUnread(n.id); }}
                                                                    >
                                                                        <IconEyeOff size={14} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip label={t('notifications.markRead')}>
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="teal"
                                                                        size="sm"
                                                                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                                                                    >
                                                                        <IconCheck size={14} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip label={t('notifications.delete')}>
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="red"
                                                                    size="sm"
                                                                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                                                                >
                                                                    <IconTrash size={14} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                        </Group>
                                                    </Group>
                                                </Box>
                                            </motion.div>
                                        );
                                    })}
                                </Stack>
                            </motion.div>
                        </AnimatePresence>

                        {totalPages > 1 && (
                            <Center mt="md">
                                <Pagination
                                    value={page}
                                    onChange={goToPage}
                                    total={totalPages}
                                    color="teal"
                                    radius="md"
                                    withEdges
                                />
                            </Center>
                        )}
                    </Stack>
                )}
            </Stack>
        </AnimatedSection>
    );
}
