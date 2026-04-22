import { useState, useEffect, useCallback } from 'react';
import {
    Title, Stack, Paper, Text, Group, ThemeIcon, Box, Badge, Button,
    TextInput, Select, Pagination, Skeleton, SimpleGrid, Code,
    Collapse, ActionIcon, Tooltip, Center, Loader,
} from '@mantine/core';
import {
    IconBug, IconAlertTriangle, IconInfoCircle, IconCode,
    IconSearch, IconFilter, IconRefresh, IconChevronDown, IconChevronUp,
    IconClock, IconHash, IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { get } from '../../utils/apiUtils';
import {
    listItemSlide, emptyStateFloat, smoothEase, buttonPop, iconSpin, badgePopIn,
} from '../../constants/animations';
import {
    LOG_LEVELS, LOG_LEVEL_COLOR, type LogLevel, type AppLogPagedResponse,
} from '../../types/appLog';
import { LOGS_PAGE_SIZE } from '../../constants/pagination';

const LEVEL_ICONS: Record<string, typeof IconBug> = {
    Information: IconInfoCircle,
    Warning: IconAlertTriangle,
    Error: IconBug,
    Debug: IconCode,
};

function LoadingSkeleton() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Stack gap="md">
                <Skeleton h={48} w={250} radius="md" className="skeleton-shimmer" />
                <Group>
                    <Skeleton h={36} w={250} radius="md" className="skeleton-shimmer" />
                    <Skeleton h={36} w={160} radius="md" className="skeleton-shimmer" />
                </Group>
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Skeleton h={80} radius="lg" className="skeleton-shimmer" />
                    </motion.div>
                ))}
            </Stack>
        </motion.div>
    );
}

function timeAgo(dateStr: string, t: (key: string, opts?: any) => string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return t('time.justNow');
    if (mins < 60) return t('time.minutesAgo', { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('time.hoursAgo', { count: hrs });
    const days = Math.floor(hrs / 24);
    return t('time.daysAgo', { count: days });
}

export default function AdminLogsPage() {
    const { t } = useTranslation();
    const [data, setData] = useState<AppLogPagedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [level, setLevel] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { pageNumber: page, pageSize: LOGS_PAGE_SIZE };
            if (level) params.level = level;
            if (search) params.searchTerm = search;
            const res = await get<AppLogPagedResponse>('AppLogs', params);
            if (res.success && res.data) setData(res.data);
        } catch { /* stay on current data */ } finally {
            setLoading(false);
        }
    }, [page, level, search]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const handleSearch = () => {
        setPage(1);
        setSearch(searchInput);
    };

    const handleLevelChange = (val: string | null) => {
        setPage(1);
        setLevel(val);
    };

    const clearFilters = () => {
        setPage(1);
        setLevel(null);
        setSearch('');
        setSearchInput('');
    };

    const errorCount = data?.items.filter((l) => l.level === 'Error').length ?? 0;
    const warnCount = data?.items.filter((l) => l.level === 'Warning').length ?? 0;

    const levelOptions = LOG_LEVELS.map((l) => ({ value: l, label: t(`logs.level${l}`) }));

    return (
        <AnimatePresence mode="wait">
            {loading && !data ? (
                <LoadingSkeleton key="skeleton" />
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5, ease: smoothEase }}
                >
                    <Stack gap="xl">
                        {/* Header */}
                        <AnimatedSection delay={0.05}>
                            <Group justify="space-between" wrap="wrap">
                                <Box>
                                    <Title order={2} fw={800}>{t('logs.title')}</Title>
                                    <Text c="dimmed" size="sm" mt={4}>{t('logs.subtitle')}</Text>
                                </Box>
                                <Group gap="sm">
                                    {data && (
                                        <motion.div {...badgePopIn(0.2)}>
                                            <Badge variant="light" color="dimmed" size="lg">
                                                {t('logs.totalCount', { count: data.totalCount })}
                                            </Badge>
                                        </motion.div>
                                    )}
                                    <motion.div {...buttonPop}>
                                        <Tooltip label={t('logs.refresh')}>
                                            <ActionIcon variant="light" color="teal" size="lg" onClick={fetchLogs} loading={loading}>
                                                <IconRefresh size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </motion.div>
                                </Group>
                            </Group>
                        </AnimatedSection>

                        {/* Stats row */}
                        <StaggerContainer stagger={0.1} delay={0.1}>
                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                                {[
                                    { label: t('logs.totalLogs'), val: data?.totalCount ?? 0, color: 'teal', icon: IconHash },
                                    { label: t('logs.errors'), val: errorCount, color: 'red', icon: IconBug },
                                    { label: t('logs.warnings'), val: warnCount, color: 'yellow', icon: IconAlertTriangle },
                                    { label: t('logs.currentPage'), val: `${data?.pageNumber ?? 1}/${data?.totalPages ?? 1}`, color: 'blue', icon: IconClock },
                                ].map((s) => (
                                    <StaggerItem key={s.label} scale>
                                        <motion.div whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                            <Paper className="glass-card animated-border-glow" p="md" radius="lg">
                                                <Group gap="sm">
                                                    <motion.div {...iconSpin}>
                                                        <ThemeIcon variant="light" color={s.color} size="md" radius="md"><s.icon size={18} /></ThemeIcon>
                                                    </motion.div>
                                                    <Box>
                                                        <Text size="xs" c="dimmed">{s.label}</Text>
                                                        <Text fw={700} size="lg">{typeof s.val === 'number' ? s.val.toLocaleString() : s.val}</Text>
                                                    </Box>
                                                </Group>
                                            </Paper>
                                        </motion.div>
                                    </StaggerItem>
                                ))}
                            </SimpleGrid>
                        </StaggerContainer>

                        {/* Filters */}
                        <AnimatedSection delay={0.15}>
                            <Paper className="glass-card" p="md" radius="lg">
                                <Group gap="md" wrap="wrap">
                                    <TextInput
                                        placeholder={t('logs.searchPlaceholder')}
                                        leftSection={<IconSearch size={16} />}
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.currentTarget.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        style={{ flex: 1, minWidth: 200 }}
                                        radius="md"
                                    />
                                    <Select
                                        placeholder={t('logs.filterLevel')}
                                        leftSection={<IconFilter size={16} />}
                                        data={levelOptions}
                                        value={level}
                                        onChange={handleLevelChange}
                                        clearable
                                        w={180}
                                        radius="md"
                                    />
                                    <motion.div {...buttonPop}>
                                        <Button variant="filled" color="teal" onClick={handleSearch} leftSection={<IconSearch size={16} />}>
                                            {t('logs.search')}
                                        </Button>
                                    </motion.div>
                                    {(level || search) && (
                                        <motion.div {...badgePopIn(0.1)}>
                                            <Button variant="subtle" color="gray" size="sm" onClick={clearFilters} leftSection={<IconX size={14} />}>
                                                {t('logs.clearFilters')}
                                            </Button>
                                        </motion.div>
                                    )}
                                </Group>
                            </Paper>
                        </AnimatedSection>

                        {/* Log entries */}
                        {loading ? (
                            <Center py="xl"><Loader color="teal" /></Center>
                        ) : data && data.items.length > 0 ? (
                            <Stack gap="sm">
                                <AnimatePresence mode="popLayout">
                                    {data.items.map((log, i) => {
                                        const LevelIcon = LEVEL_ICONS[log.level] ?? IconInfoCircle;
                                        const isExpanded = expandedId === log.id;
                                        const color = LOG_LEVEL_COLOR[log.level] ?? 'gray';

                                        return (
                                            <motion.div
                                                key={log.id}
                                                layout
                                                {...listItemSlide(i, i % 2 === 0 ? 'left' : 'right')}
                                            >
                                                <Paper
                                                    className="glass-card list-row-animated"
                                                    p="md"
                                                    radius="lg"
                                                    style={{ cursor: 'pointer', borderLeft: `3px solid var(--mantine-color-${color}-6)` }}
                                                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                                                >
                                                    <Group justify="space-between" wrap="nowrap" gap="md">
                                                        <Group gap="md" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                                            <motion.div {...iconSpin}>
                                                                <ThemeIcon variant="light" color={color} size="lg" radius="md">
                                                                    <LevelIcon size={20} />
                                                                </ThemeIcon>
                                                            </motion.div>
                                                            <Box style={{ flex: 1, minWidth: 0 }}>
                                                                <Group gap="sm" mb={4} wrap="wrap">
                                                                    <Badge variant="light" color={color} size="sm">{log.level}</Badge>
                                                                    <Text size="xs" c="dimmed" ff="monospace">#{log.id}</Text>
                                                                    <Text size="xs" c="dimmed">{timeAgo(log.timestamp, t)}</Text>
                                                                </Group>
                                                                <Text size="sm" fw={500} lineClamp={isExpanded ? undefined : 2} style={{ wordBreak: 'break-word' }}>
                                                                    {log.message}
                                                                </Text>
                                                            </Box>
                                                        </Group>
                                                        <Group gap="xs" wrap="nowrap">
                                                            <Text size="xs" c="dimmed" ff="monospace" visibleFrom="sm">
                                                                {new Date(log.timestamp).toLocaleString()}
                                                            </Text>
                                                            <ActionIcon variant="subtle" color="gray" size="sm">
                                                                {isExpanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
                                                            </ActionIcon>
                                                        </Group>
                                                    </Group>

                                                    <Collapse in={isExpanded}>
                                                        <Stack gap="sm" mt="md" pl={52}>
                                                            <Box>
                                                                <Text size="xs" c="dimmed" fw={600} mb={4}>{t('logs.timestamp')}</Text>
                                                                <Text size="sm" ff="monospace">{new Date(log.timestamp).toLocaleString()}</Text>
                                                            </Box>
                                                            {log.template && (
                                                                <Box>
                                                                    <Text size="xs" c="dimmed" fw={600} mb={4}>{t('logs.template')}</Text>
                                                                    <Code block>{log.template}</Code>
                                                                </Box>
                                                            )}
                                                            {log.exception && (
                                                                <Box>
                                                                    <Text size="xs" c="dimmed" fw={600} mb={4}>
                                                                        <Badge variant="light" color="red" size="xs" mr={6}>{t('logs.exception')}</Badge>
                                                                    </Text>
                                                                    <Code block color="red" style={{ maxHeight: 300, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                                                                        {log.exception}
                                                                    </Code>
                                                                </Box>
                                                            )}
                                                            {log.properties && (
                                                                <Box>
                                                                    <Text size="xs" c="dimmed" fw={600} mb={4}>{t('logs.properties')}</Text>
                                                                    <Code block style={{ maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                                                                        {(() => {
                                                                            try { return JSON.stringify(JSON.parse(log.properties), null, 2); }
                                                                            catch { return log.properties; }
                                                                        })()}
                                                                    </Code>
                                                                </Box>
                                                            )}
                                                        </Stack>
                                                    </Collapse>
                                                </Paper>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </Stack>
                        ) : (
                            <AnimatedSection delay={0.1}>
                                <Paper className="glass-card" p="xl" radius="lg">
                                    <Stack align="center" gap="md">
                                        <motion.div {...emptyStateFloat}>
                                            <ThemeIcon size={60} variant="light" color="teal" radius="xl"><IconBug size={30} /></ThemeIcon>
                                        </motion.div>
                                        <Text c="dimmed" ta="center" fw={500}>{t('logs.noLogs')}</Text>
                                        {(level || search) && (
                                            <motion.div {...buttonPop}>
                                                <Button variant="light" color="teal" onClick={clearFilters}>{t('logs.clearFilters')}</Button>
                                            </motion.div>
                                        )}
                                    </Stack>
                                </Paper>
                            </AnimatedSection>
                        )}

                        {/* Pagination */}
                        {data && data.totalPages > 1 && (
                            <AnimatedSection delay={0.1}>
                                <Group justify="center">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <Pagination
                                            total={data.totalPages}
                                            value={page}
                                            onChange={setPage}
                                            color="teal"
                                            radius="md"
                                            withEdges
                                        />
                                    </motion.div>
                                </Group>
                            </AnimatedSection>
                        )}
                    </Stack>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
