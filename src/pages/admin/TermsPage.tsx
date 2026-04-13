import { useState, useEffect, useCallback } from 'react';
import {
    Title, Stack, Box, Text, Group, TextInput, Button,
    Loader, Center, Pagination, Modal, ThemeIcon, Switch, ColorInput,
    Paper, Badge, ActionIcon, Tooltip, Table, Textarea, Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy,
    IconFileText, IconRefresh, IconShieldCheck, IconLock, IconKey,
    IconScale, IconBuildingBank, IconUserCheck, IconAlertCircle,
    IconCookie, IconMail, IconPhone, IconGlobe, IconInfoCircle,
    IconClipboardList, IconNotes, IconStarFilled, IconBell,
    IconCheck,
    IconBan,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { get, post, put, del } from '../../utils/api.utils';

const PAGE_SIZE = 10;

// ── Icon registry ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
    'file-text': IconFileText,
    'shield-check': IconShieldCheck,
    'lock': IconLock,
    'key': IconKey,
    'scale': IconScale,
    'building-bank': IconBuildingBank,
    'user-check': IconUserCheck,
    'alert-circle': IconAlertCircle,
    'cookie': IconCookie,
    'mail': IconMail,
    'phone': IconPhone,
    'globe': IconGlobe,
    'info-circle': IconInfoCircle,
    'clipboard-list': IconClipboardList,
    'notes': IconNotes,
    'star': IconStarFilled,
    'bell': IconBell,
};

const ICON_OPTIONS = Object.keys(ICON_MAP).map((value) => ({ value, label: value }));

function TermIcon({ icon, size = 14, color = 'white' }: { icon: string | null; size?: number; color?: string }) {
    const Comp = icon ? ICON_MAP[icon] : null;
    return Comp ? <Comp size={size} color={color} /> : <IconLock size={size} color={color} />;
}

interface Term {
    id: string;
    title: string;
    description: string;
    icon: string | null;
    color: string;
    isActive: boolean;
}

interface FormValues {
    title: string;
    description: string;
    icon: string;
    color: string;
    isActive: boolean;
}

const inputStyles = {
    input: {
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid var(--mantine-color-default-border)',
        '&:focus': { borderColor: 'var(--az-teal)' },
    },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TermsPage() {
    const { t } = useTranslation();

    const [terms, setTerms] = useState<Term[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Term | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Term | null>(null);

    const form = useForm<FormValues>({
        initialValues: { title: '', description: '', icon: '', color: '#2dd4a8', isActive: true },
        validate: {
            title: (v) => (!v.trim() ? t('terms.validation.titleRequired') : null),
            description: (v) => (!v.trim() ? t('terms.validation.descriptionRequired') : null),
            color: (v) => (!v ? t('terms.validation.colorRequired') : null),
        },
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const startItem = (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchTerms = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                PageNr: String(page),
                PageSize: String(PAGE_SIZE),
            });
            if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());

            const res = await get(`Terms/getPagedTerms?${params.toString()}`);
            if (!res.success) throw new Error(res.message || t('terms.errors.loadFailed'));

            setTerms(res.data.items ?? []);
            setTotalPages(res.data.totalPages ?? 1);
            setTotalCount(res.data.totalCount ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('terms.errors.unknown'));
            setTerms([]);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchTerms(); }, [fetchTerms]);

    // ── Open create modal ──────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        form.reset();
        setModalOpen(true);
    };

    // ── Open edit modal ────────────────────────────────────────────────────────
    const openEdit = (term: Term) => {
        setEditTarget(term);
        form.setValues({
            title: term.title,
            description: term.description,
            icon: term.icon ?? '',
            color: term.color,
            isActive: term.isActive,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditTarget(null);
        form.reset();
    };

    // ── Save (create or update) ────────────────────────────────────────────────
    const handleSave = async () => {
        const validation = form.validate();
        if (validation.hasErrors) return;

        setActionLoading(true);
        try {
            if (editTarget) {
                const res = await put(`Terms/${editTarget.id}`, {
                    id: editTarget.id,
                    ...form.values,
                });
                if (!res.success) throw new Error(res.message || t('terms.errors.updateFailed'));
            } else {
                const res = await post('Terms', form.values);
                if (!res.success) throw new Error(res.message || t('terms.errors.createFailed'));
            }
            closeModal();
            fetchTerms();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setActionLoading(true);
        try {
            const res = await del(`Terms/${deleteTarget.id}`);
            if (!res.success) throw new Error(res.message || t('terms.errors.deleteFailed'));
            setDeleteTarget(null);
            fetchTerms();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
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
                                <Title order={2} fw={800}>{t('terms.title')}</Title>
                                <Text c="dimmed" size="sm" mt={4}>
                                    {t('terms.subtitle')}
                                </Text>
                            </div>
                        </Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            color="teal"
                            radius="md"
                            onClick={openCreate}
                        >
                            {t('terms.addTerm')}
                        </Button>
                    </Group>
                </AnimatedSection>

                {/* Filters */}
                <AnimatedSection delay={0.08}>
                    <Group wrap="wrap" align="end" gap="sm" mb="sm">
                        <TextInput
                            placeholder={t('terms.searchPlaceholder')}
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
                        />
                        <Tooltip label={t('terms.refresh')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                size="lg"
                                radius="md"
                                onClick={fetchTerms}
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
                                style={{ overflow: "hidden", borderColor: "var(--mantine-color-default-border)" }}
                            >
                                <Table.ScrollContainer minWidth={600}>
                                    <Table
                                        highlightOnHover
                                        verticalSpacing="sm"
                                        horizontalSpacing="md"
                                        styles={{
                                            thead: {
                                                background: "var(--mantine-color-default-hover)",
                                                borderBottom: "0.5px solid var(--mantine-color-default-border)",
                                            },
                                            th: {
                                                fontWeight: 500,
                                                fontSize: 12,
                                                textTransform: "uppercase",
                                                letterSpacing: "0.05em",
                                                color: "var(--mantine-color-dimmed)",
                                            },
                                        }}
                                    >
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th w={60}>#</Table.Th>
                                                <Table.Th>{t('terms.table.title')}</Table.Th>
                                                <Table.Th>{t('terms.table.description')}</Table.Th>
                                                <Table.Th>{t('terms.table.color')}</Table.Th>
                                                <Table.Th>{t('terms.table.icon')}</Table.Th>
                                                <Table.Th>{t('terms.table.status')}</Table.Th>
                                                <Table.Th w={90}>{t('terms.table.actions')}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>

                                        <Table.Tbody>
                                            {/* Skeleton rows while loading */}
                                            {loading &&
                                                [1, 2, 3, 4].map((i) => (
                                                    <Table.Tr key={i}>
                                                        {[60, 20 + i * 8, 30, 10, 10, 10, 10].map((w, j) => (
                                                            <Table.Td key={j}>
                                                                <Box
                                                                    style={{
                                                                        height: 12,
                                                                        borderRadius: 6,
                                                                        background: "var(--mantine-color-default-border)",
                                                                        opacity: 0.5,
                                                                        width: `${w}%`,
                                                                        animation: "pulse 1.4s ease-in-out infinite",
                                                                    }}
                                                                />
                                                            </Table.Td>
                                                        ))}
                                                    </Table.Tr>
                                                ))}

                                            {/* Empty state */}
                                            {!loading && terms.length === 0 && (
                                                <Table.Tr>
                                                    <Table.Td colSpan={7}>
                                                        <Center py="xl">
                                                            <Stack align="center" gap="xs">
                                                                <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                                    <IconLock size={18} />
                                                                </ThemeIcon>
                                                                <Text size="sm" c="dimmed">
                                                                    {search
                                                                        ? t('terms.empty.searchHint')
                                                                        : t('terms.empty.hint')}
                                                                </Text>
                                                                {!search && (
                                                                    <Button
                                                                        leftSection={<IconPlus size={15} />}
                                                                        color="teal"
                                                                        variant="light"
                                                                        radius="md"
                                                                        size="xs"
                                                                        mt={4}
                                                                        onClick={openCreate}
                                                                    >
                                                                        {t('terms.addTerm')}
                                                                    </Button>
                                                                )}
                                                            </Stack>
                                                        </Center>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}

                                            {/* Data rows */}
                                            {!loading &&
                                                terms.map((term, idx) => (
                                                    <motion.tr
                                                        key={term.id}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03, duration: 0.25, ease: "easeOut" }}
                                                    >
                                                        {/* Index */}
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed" fw={500}>
                                                                #{String(idx + 1).padStart(3, "0")}
                                                            </Text>
                                                        </Table.Td>

                                                        {/* Title */}
                                                        <Table.Td>
                                                            <Group gap={8} align="center">
                                                                <Box
                                                                    style={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        borderRadius: 8,
                                                                        background: term.color || 'var(--az-teal)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0,
                                                                        boxShadow: `0 2px 8px ${term.color}55`,
                                                                    }}
                                                                >
                                                                    <IconLock size={13} color="white" />
                                                                </Box>
                                                                <Text size="sm" fw={500}>{term.title}</Text>
                                                            </Group>
                                                        </Table.Td>

                                                        {/* Description */}
                                                        <Table.Td style={{ maxWidth: 260 }}>
                                                            <Text size="sm" c="dimmed" lineClamp={2}>
                                                                {term.description}
                                                            </Text>
                                                        </Table.Td>

                                                        {/* Color */}
                                                        <Table.Td>
                                                            <Group gap={6} align="center">
                                                                <Box
                                                                    style={{
                                                                        width: 14,
                                                                        height: 14,
                                                                        borderRadius: 4,
                                                                        background: term.color || '#2dd4a8',
                                                                        border: '1px solid rgba(255,255,255,0.15)',
                                                                        flexShrink: 0,
                                                                    }}
                                                                />
                                                                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                                                    {term.color}
                                                                </Text>
                                                            </Group>
                                                        </Table.Td>

                                                        {/* Icon */}
                                                        <Table.Td>
                                                            {term.icon ? (
                                                                <Group gap={6} align="center">
                                                                    <Box
                                                                        style={{
                                                                            width: 24,
                                                                            height: 24,
                                                                            borderRadius: 6,
                                                                            background: term.color || 'var(--az-teal)',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                        }}
                                                                    >
                                                                        <TermIcon icon={term.icon} size={12} color="white" />
                                                                    </Box>
                                                                    <Text size="xs" c="dimmed">{term.icon}</Text>
                                                                </Group>
                                                            ) : (
                                                                <Text size="sm" c="dimmed">—</Text>
                                                            )}
                                                        </Table.Td>

                                                        {/* Status */}
                                                        <Table.Td>
                                                            {term.isActive ? (
                                                                <Badge
                                                                    color="green"
                                                                    variant="light"
                                                                    size="sm"
                                                                    radius="md"
                                                                    leftSection={<IconCheck size={11} />}
                                                                >
                                                                    {t('terms.status.active')}
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    color="gray"
                                                                    variant="light"
                                                                    size="sm"
                                                                    radius="md"
                                                                    leftSection={<IconBan size={11} />}
                                                                >
                                                                    {t('terms.status.inactive')}
                                                                </Badge>
                                                            )}
                                                        </Table.Td>

                                                        {/* Actions */}
                                                        <Table.Td>
                                                            <Group gap={4}>
                                                                <Tooltip label={t('terms.actions.edit')} withArrow fz="xs">
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="yellow"
                                                                        size="sm"
                                                                        radius="md"
                                                                        onClick={() => openEdit(term)}
                                                                    >
                                                                        <IconEdit size={15} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                                <Tooltip label={t('terms.actions.delete')} withArrow fz="xs">
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="red"
                                                                        size="sm"
                                                                        radius="md"
                                                                        onClick={() => setDeleteTarget(term)}
                                                                    >
                                                                        <IconTrash size={15} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                            </Group>
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
                                        {t('terms.pagination.showing')}{' '}
                                        <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                                        {' '}{t('terms.pagination.of')}{' '}
                                        <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                                        {' '}{t('terms.pagination.terms')}
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

            {/* ── Create / Edit Modal ─────────────────────────────────────────────── */}
            <Modal
                opened={modalOpen}
                onClose={closeModal}
                title={
                    <Group gap={10}>
                        <ThemeIcon color="teal" variant="light" size={32} radius="md">
                            {editTarget ? <IconEdit size={16} /> : <IconPlus size={16} />}
                        </ThemeIcon>
                        <Text fw={500} size="md">
                            {editTarget ? t('terms.modal.editTitle') : t('terms.modal.addTitle')}
                        </Text>
                    </Group>
                }
                size="md"
                centered
                radius="lg"
                styles={{
                    header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
                    body: { padding: '20px 24px 24px' },
                }}
            >
                <Stack gap="md">
                    <TextInput
                        label={t('terms.form.titleLabel')}
                        placeholder={t('terms.form.titlePlaceholder')}
                        required
                        radius="md"
                        {...form.getInputProps('title')}
                        styles={inputStyles}
                    />

                    <Textarea
                        label={t('terms.form.descriptionLabel')}
                        placeholder={t('terms.form.descriptionPlaceholder')}
                        required
                        radius="md"
                        minRows={4}
                        autosize
                        maxRows={8}
                        {...form.getInputProps('description')}
                        styles={inputStyles}
                    />

                    <Select
                        label={t('terms.form.iconLabel')}
                        placeholder={t('terms.form.iconPlaceholder')}
                        radius="md"
                        clearable
                        data={ICON_OPTIONS}
                        renderOption={({ option }) => (
                            <Group gap={8}>
                                <TermIcon icon={option.value} size={14} color="currentColor" />
                                <Text size="sm">{option.label}</Text>
                            </Group>
                        )}
                        leftSection={
                            form.values.icon
                                ? <TermIcon icon={form.values.icon} size={14} color="currentColor" />
                                : <IconLock size={14} />
                        }
                        {...form.getInputProps('icon')}
                        styles={inputStyles}
                    />

                    <ColorInput
                        label={t('terms.form.colorLabel')}
                        placeholder="#2dd4a8"
                        required
                        radius="md"
                        format="hex"
                        swatches={[
                            '#2dd4a8', '#3b82f6', '#f59e0b', '#ef4444',
                            '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
                        ]}
                        {...form.getInputProps('color')}
                        styles={inputStyles}
                    />

                    <Switch
                        label={t('terms.form.activeLabel')}
                        description={t('terms.form.activeDescription')}
                        color="teal"
                        radius="md"
                        {...form.getInputProps('isActive', { type: 'checkbox' })}
                    />

                    <Button
                        variant="filled"
                        color="teal"
                        fullWidth
                        radius="md"
                        size="md"
                        loading={actionLoading}
                        leftSection={editTarget ? <IconDeviceFloppy size={16} /> : <IconPlus size={16} />}
                        onClick={handleSave}
                    >
                        {editTarget ? t('terms.form.saveChanges') : t('terms.form.createTerm')}
                    </Button>
                </Stack>
            </Modal>

            {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
            <Modal
                opened={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title={
                    <Group gap={10}>
                        <ThemeIcon color="red" variant="light" size={32} radius="md">
                            <IconTrash size={16} />
                        </ThemeIcon>
                        <Text fw={500} size="md">{t('terms.deleteModal.title')}</Text>
                    </Group>
                }
                size="sm"
                centered
                radius="lg"
                styles={{
                    header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
                    body: { padding: '20px 24px 24px' },
                }}
            >
                <Stack gap="lg" align="center">
                    {deleteTarget && (
                        <Group gap={12} w="100%">
                            <Box
                                style={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 12,
                                    background: deleteTarget.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <IconLock size={20} color="white" />
                            </Box>
                            <div>
                                <Text fw={600} size="sm">{deleteTarget.title}</Text>
                                <Text c="dimmed" size="xs" lineClamp={1}>{deleteTarget.description}</Text>
                            </div>
                        </Group>
                    )}

                    <Paper
                        radius="md"
                        p="md"
                        w="100%"
                        style={{
                            background: 'var(--mantine-color-red-light)',
                            border: '0.5px solid var(--mantine-color-red-light-hover)',
                        }}
                    >
                        <Stack gap={4} align="center">
                            <Text size="sm" ta="center" fw={500} c="red.8">
                                {t('terms.deleteModal.confirm', { name: deleteTarget?.title })}
                            </Text>
                            <Text size="xs" ta="center" c="dimmed">
                                {t('terms.deleteModal.warning')}
                            </Text>
                        </Stack>
                    </Paper>

                    <Group w="100%" gap="sm">
                        <Button
                            variant="default"
                            flex={1}
                            radius="md"
                            onClick={() => setDeleteTarget(null)}
                            disabled={actionLoading}
                        >
                            {t('terms.deleteModal.cancel')}
                        </Button>
                        <Button
                            color="red"
                            flex={1}
                            radius="md"
                            loading={actionLoading}
                            leftSection={<IconTrash size={15} />}
                            onClick={handleDelete}
                        >
                            {t('terms.deleteModal.delete')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </motion.div>
    );
}