import { useState, useEffect, useCallback } from 'react';
import {
    Title, Stack, Box, Text, Group, TextInput, Button,
    Loader, Center, Pagination, ThemeIcon, Paper, Badge,
    ActionIcon, Tooltip, Table,
} from '@mantine/core';
import {
    IconSearch, IconTrash, IconMail, IconRefresh,
    IconCheck, IconBan, IconInbox,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { PAGE_SIZE } from '../../constants/pagination';
import { get, del } from '../../utils/api.utils';
import Spinner from '../../components/spinner/Spinner';


interface Subscription {
    id: string;
    email: string | null;
    isUnsubscribed: boolean;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SubscriptionsPage() {
    const { t } = useTranslation();

    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const startItem = (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchSubscriptions = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                PageNr: String(page),
                PageSize: String(PAGE_SIZE),
            });
            if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());

            const res = await get(`Subscribe/getPagedSubscription?${params.toString()}`);
            if (!res.success) throw new Error(res.message || t('subscriptions.failedToLoad'));

            setSubscriptions(res.data.items ?? []);
            setTotalPages(res.data.totalPages ?? 1);
            setTotalCount(res.data.totalCount ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setSubscriptions([]);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
       <>
       <Spinner visible={loading} />
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        >
            <Stack gap="lg">

                {/* Header */}
                <AnimatedSection>
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                        <Group gap={10} align="flex-start">
                            <Box
                                style={{
                                    width: 4,
                                    height: 28,
                                    borderRadius: 4,
                                    background: 'var(--az-teal)',
                                    boxShadow: '0 0 12px rgba(45, 212, 168, 0.35)',
                                    flexShrink: 0,
                                    marginTop: 4,
                                }}
                            />
                            <div>
                                <Title order={2} fw={800}>{t('subscriptions.title')}</Title>
                                <Text c="dimmed" size="sm" mt={4}>
                                    {t('subscriptions.subtitle')}
                                </Text>
                            </div>
                        </Group>

                        {/* Summary badges */}
                        <Group gap={8}>
                            <Badge
                                color="teal"
                                variant="light"
                                size="lg"
                                radius="md"
                                leftSection={<IconMail size={13} />}
                            >
                                {totalCount} {t('subscriptions.totalLabel')}
                            </Badge>
                        </Group>
                    </Group>
                </AnimatedSection>

                {/* Filters */}
                <AnimatedSection delay={0.08}>
                    <Group wrap="wrap" align="end" gap="sm" mb="sm">
                        <TextInput
                            placeholder={t('subscriptions.searchPlaceholder')}
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
                        />
                        <Tooltip label={t('subscriptions.refresh')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                size="lg"
                                radius="md"
                                onClick={fetchSubscriptions}
                                loading={loading}
                            >
                                <IconRefresh size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </AnimatedSection>

                {/* Content */}
                {loading ? (
                    <Center py="xl">
                        <Loader color="var(--az-teal)" size="md" />
                    </Center>
                ) : error ? (
                    <Center py="xl">
                        <Text c="red" size="sm">{error}</Text>
                    </Center>
                ) : (
                    <AnimatedSection delay={0.1}>
                        <Stack gap="md">
                            <Paper
                                radius="lg"
                                withBorder
                                style={{ overflow: 'hidden', borderColor: 'var(--mantine-color-default-border)' }}
                            >
                                <Table.ScrollContainer minWidth={500}>
                                    <Table
                                        highlightOnHover
                                        verticalSpacing="sm"
                                        horizontalSpacing="md"
                                        styles={{
                                            thead: {
                                                background: 'var(--mantine-color-default-hover)',
                                                borderBottom: '0.5px solid var(--mantine-color-default-border)',
                                            },
                                            th: {
                                                fontWeight: 500,
                                                fontSize: 12,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                color: 'var(--mantine-color-dimmed)',
                                            },
                                        }}
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th w={60}>#</Table.Th>
                                                <Table.Th>{t('subscriptions.table.email')}</Table.Th>
                                                <Table.Th>{t('subscriptions.table.status')}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>

                                        <Table.Tbody>
                                            {/* Skeleton rows while loading */}
                                            {loading &&
                                                [1, 2, 3, 4].map((i) => (
                                                    <Table.Tr key={i}>
                                                        {[8, 50, 12, 8].map((w, j) => (
                                                            <Table.Td key={j}>
                                                                <Box
                                                                    style={{
                                                                        height: 12,
                                                                        borderRadius: 6,
                                                                        background: 'var(--mantine-color-default-border)',
                                                                        opacity: 0.5,
                                                                        width: `${w}%`,
                                                                    }}
                                                                />
                                                            </Table.Td>
                                                        ))}
                                                    </Table.Tr>
                                                ))}

                                            {/* Empty state */}
                                            {!loading && subscriptions.length === 0 && (
                                                <Table.Tr>
                                                    <Table.Td colSpan={4}>
                                                        <Center py="xl">
                                                            <Stack align="center" gap="xs">
                                                                <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                                    <IconInbox size={18} />
                                                                </ThemeIcon>
                                                                <Text size="sm" c="dimmed">
                                                                    {search
                                                                        ? t('subscriptions.empty.searchHint')
                                                                        : t('subscriptions.empty.hint')}
                                                                </Text>
                                                            </Stack>
                                                        </Center>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}

                                            {/* Data rows */}
                                            {!loading &&
                                                subscriptions.map((sub, idx) => (
                                                    <motion.tr
                                                        key={sub.id}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03, duration: 0.25, ease: 'easeOut' }}
                                                    >
                                                        {/* Index */}
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed" fw={500}>
                                                                #{String((page - 1) * PAGE_SIZE + idx + 1).padStart(3, '0')}
                                                            </Text>
                                                        </Table.Td>

                                                        {/* Email */}
                                                        <Table.Td>
                                                            <Group gap={8} align="center">
                                                                <ThemeIcon
                                                                    size={28}
                                                                    radius={8}
                                                                    color={sub.isUnsubscribed ? 'gray' : 'teal'}
                                                                    variant="light"
                                                                >
                                                                    <IconMail size={13} />
                                                                </ThemeIcon>
                                                                <Text size="sm" fw={500}>
                                                                    {sub.email ?? <Text component="span" c="dimmed" size="sm">—</Text>}
                                                                </Text>
                                                            </Group>
                                                        </Table.Td>

                                                        {/* Status */}
                                                        <Table.Td>
                                                            {sub.isUnsubscribed ? (
                                                                <Badge
                                                                    color="gray"
                                                                    variant="light"
                                                                    size="sm"
                                                                    radius="md"
                                                                    leftSection={<IconBan size={11} />}
                                                                >
                                                                    {t('subscriptions.status.unsubscribed')}
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    color="teal"
                                                                    variant="light"
                                                                    size="sm"
                                                                    radius="md"
                                                                    leftSection={<IconCheck size={11} />}
                                                                >
                                                                    {t('subscriptions.status.subscribed')}
                                                                </Badge>
                                                            )}
                                                        </Table.Td>

                                                    </motion.tr>
                                                ))}
                                        </Table.Tbody>
                                    </Table>
                                </Table.ScrollContainer>
                            </Paper>

                            {totalPages > 1 && (
                                <Group justify="space-between" align="center" px={4}>
                                    <Text size="xs" c="dimmed">
                                        {t('subscriptions.pagination.showing')}{' '}
                                        <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                                        {' '}{t('subscriptions.pagination.of')}{' '}
                                        <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                                        {' '}{t('subscriptions.pagination.subscribers')}
                                    </Text>
                                    <Pagination
                                        value={page}
                                        onChange={setPage}
                                        total={totalPages}
                                        color="var(--az-teal)"
                                        radius="md"
                                        size="sm"
                                        withEdges
                                    />
                                </Group>
                            )}
                        </Stack>
                    </AnimatedSection>
                )}
            </Stack>
        </motion.div>
       </>
    );
}
