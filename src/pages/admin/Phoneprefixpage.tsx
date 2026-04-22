import { useState, useEffect, useCallback } from 'react';
import {
    Title, Stack, Box, Text, Group, TextInput, Button,
    Loader, Center, Pagination, Modal, ThemeIcon, Paper,
    Badge, ActionIcon, Tooltip, Table, Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy,
    IconRefresh, IconPhone, IconFlag,
    IconWorldPin, IconAlertCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { PAGE_SIZE } from '../../constants/pagination';
import { get, post, put, del } from '../../utils/apiUtils';
import type { PhonePrefix, PhonePrefixFormValues as FormValues } from '../../types/company';

// ── Flag emoji helper ─────────────────────────────────────────────────────────
function countryCodeToFlag(code: string | null): string {
    if (!code || code.length !== 2) return '🌐';
    const offset = 127397;
    return String.fromCodePoint(
        code.toUpperCase().charCodeAt(0) + offset,
        code.toUpperCase().charCodeAt(1) + offset,
    );
}

import { COUNTRIES, FLAG_SELECT_DATA } from '../../data/countries';
import { glassInputStyles as inputStyles } from '../../constants/styles';

function flagEmojiToCode(emoji: string | null): string {
    if (!emoji) return '';
    try {
        const points = [...emoji].map((c) => (c.codePointAt(0) ?? 0) - 127397);
        if (points.length === 2 && points.every((p) => p >= 65 && p <= 90))
            return String.fromCharCode(...points);
    } catch { /* ignore */ }
    return '';
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PhonePrefixPage() {
    const { t } = useTranslation();

    const [prefixes, setPrefixes] = useState<PhonePrefix[]>([]);
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
    const [editTarget, setEditTarget] = useState<PhonePrefix | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<PhonePrefix | null>(null);

    const form = useForm<FormValues>({
        initialValues: { countryName: '', phonePrefix: '', flag: '', phoneRegex: '' },
        validate: {
            countryName: (v) => (!v.trim() ? t('phonePrefix.validation.countryNameRequired') : null),
            phonePrefix: (v) => (!v.trim() ? t('phonePrefix.validation.phonePrefixRequired') : null),
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
    const fetchPrefixes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                PageNr: String(page),
                PageSize: String(PAGE_SIZE),
            });
            if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());

            const res = await get(`StatePrefix/getAllPaged?${params.toString()}`);
            if (!res.success) throw new Error(res.message || t('phonePrefix.errors.loadFailed'));

            setPrefixes(res.data.items ?? []);
            setTotalPages(res.data.totalPages ?? 1);
            setTotalCount(res.data.totalCount ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('phonePrefix.errors.unknown'));
            setPrefixes([]);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchPrefixes(); }, [fetchPrefixes]);

    // ── Open create modal ──────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        form.reset();
        setModalOpen(true);
    };

    // ── Open edit modal ────────────────────────────────────────────────────────
    const openEdit = (prefix: PhonePrefix) => {
        setEditTarget(prefix);
        form.setValues({
            countryName: prefix.countryName ?? '',
            phonePrefix: prefix.phonePrefix ?? '',
            flag: flagEmojiToCode(prefix.flag),   // emoji → ISO code for Select
            phoneRegex: prefix.phoneRegex ?? '',
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
            const payload = {
                countryName: form.values.countryName || null,
                phonePrefix: form.values.phonePrefix || null,
                flag: form.values.flag ? countryCodeToFlag(form.values.flag) : null,  // ISO → emoji
                phoneRegex: form.values.phoneRegex || null,
            };

            if (editTarget) {
                const res = await put(`StatePrefix/${editTarget.id}`, { id: editTarget.id, ...payload });
                if (!res.success) throw new Error(res.message || t('phonePrefix.errors.updateFailed'));
            } else {
                const res = await post('StatePrefix', payload);
                if (!res.success) throw new Error(res.message || t('phonePrefix.errors.createFailed'));
            }
            closeModal();
            fetchPrefixes();
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
            const res = await del(`StatePrefix/${deleteTarget.id}`);
            if (!res.success) throw new Error(res.message || t('phonePrefix.errors.deleteFailed'));
            setDeleteTarget(null);
            fetchPrefixes();
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
                                <Title order={2} fw={800}>{t('phonePrefix.title')}</Title>
                                <Text c="dimmed" size="sm" mt={4}>
                                    {t('phonePrefix.subtitle')}
                                </Text>
                            </div>
                        </Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            color="teal"
                            radius="md"
                            onClick={openCreate}
                        >
                            {t('phonePrefix.addPrefix')}
                        </Button>
                    </Group>
                </AnimatedSection>

                {/* Filters */}
                <AnimatedSection delay={0.08}>
                    <Group wrap="wrap" align="end" gap="sm" mb="sm">
                        <TextInput
                            placeholder={t('phonePrefix.searchPlaceholder')}
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
                        />
                        <Tooltip label={t('phonePrefix.refresh')} withArrow>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                size="lg"
                                radius="md"
                                onClick={fetchPrefixes}
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
                                <Table.ScrollContainer minWidth={600}>
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
                                                <Table.Th>{t('phonePrefix.table.flag')}</Table.Th>
                                                <Table.Th>{t('phonePrefix.table.countryName')}</Table.Th>
                                                <Table.Th>{t('phonePrefix.table.phonePrefix')}</Table.Th>
                                                <Table.Th>{t('phonePrefix.table.phoneRegex')}</Table.Th>
                                                <Table.Th w={90}>{t('phonePrefix.table.actions')}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>

                                        <Table.Tbody>
                                            {/* Skeleton rows while loading */}
                                            {loading &&
                                                [1, 2, 3, 4].map((i) => (
                                                    <Table.Tr key={i}>
                                                        {[60, 10, 20 + i * 8, 10, 30, 10].map((w, j) => (
                                                            <Table.Td key={j}>
                                                                <Box
                                                                    style={{
                                                                        height: 12,
                                                                        borderRadius: 6,
                                                                        background: 'var(--mantine-color-default-border)',
                                                                        opacity: 0.5,
                                                                        width: `${w}%`,
                                                                        animation: 'pulse 1.4s ease-in-out infinite',
                                                                    }}
                                                                />
                                                            </Table.Td>
                                                        ))}
                                                    </Table.Tr>
                                                ))}

                                            {/* Empty state */}
                                            {!loading && prefixes.length === 0 && (
                                                <Table.Tr>
                                                    <Table.Td colSpan={6}>
                                                        <Center py="xl">
                                                            <Stack align="center" gap="xs">
                                                                <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                                    <IconPhone size={18} />
                                                                </ThemeIcon>
                                                                <Text size="sm" c="dimmed">
                                                                    {search
                                                                        ? t('phonePrefix.empty.searchHint')
                                                                        : t('phonePrefix.empty.hint')}
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
                                                                        {t('phonePrefix.addPrefix')}
                                                                    </Button>
                                                                )}
                                                            </Stack>
                                                        </Center>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}

                                            {/* Data rows */}
                                            {!loading &&
                                                prefixes.map((prefix, idx) => (
                                                    <motion.tr
                                                        key={prefix.id}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03, duration: 0.25, ease: 'easeOut' }}
                                                    >
                                                        {/* Index */}
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed" fw={500}>
                                                                #{String(idx + 1).padStart(3, '0')}
                                                            </Text>
                                                        </Table.Td>

                                                        {/* Flag */}
                                                        <Table.Td>
                                                            <Text size="xl" style={{ lineHeight: 1 }}>
                                                                {prefix.flag ?? '🌐'}
                                                            </Text>
                                                        </Table.Td>

                                                        {/* Country Name */}
                                                        <Table.Td>
                                                            <Group gap={8} align="center">
                                                                <Box
                                                                    style={{
                                                                        width: 28,
                                                                        height: 28,
                                                                        borderRadius: 8,
                                                                        background: 'var(--az-teal)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        flexShrink: 0,
                                                                        boxShadow: '0 2px 8px rgba(45,212,168,0.35)',
                                                                    }}
                                                                >
                                                                    <IconWorldPin size={13} color="white" />
                                                                </Box>
                                                                <Text size="sm" fw={500}>
                                                                    {prefix.countryName ?? '—'}
                                                                </Text>
                                                            </Group>
                                                        </Table.Td>

                                                        {/* Phone Prefix */}
                                                        <Table.Td>
                                                            {prefix.phonePrefix ? (
                                                                <Badge
                                                                    color="teal"
                                                                    variant="light"
                                                                    size="sm"
                                                                    radius="md"
                                                                    leftSection={<IconPhone size={11} />}
                                                                >
                                                                    {prefix.phonePrefix}
                                                                </Badge>
                                                            ) : (
                                                                <Text size="sm" c="dimmed">—</Text>
                                                            )}
                                                        </Table.Td>

                                                        {/* Phone Regex */}
                                                        <Table.Td style={{ maxWidth: 260 }}>
                                                            <Text
                                                                size="xs"
                                                                c="dimmed"
                                                                lineClamp={1}
                                                                style={{ fontFamily: 'monospace' }}
                                                            >
                                                                {prefix.phoneRegex ?? '—'}
                                                            </Text>
                                                        </Table.Td>

                                                        {/* Actions */}
                                                        <Table.Td>
                                                            <Group gap={4}>
                                                                <Tooltip label={t('phonePrefix.actions.edit')} withArrow fz="xs">
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="yellow"
                                                                        size="sm"
                                                                        radius="md"
                                                                        onClick={() => openEdit(prefix)}
                                                                    >
                                                                        <IconEdit size={15} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                                <Tooltip label={t('phonePrefix.actions.delete')} withArrow fz="xs">
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="red"
                                                                        size="sm"
                                                                        radius="md"
                                                                        onClick={() => setDeleteTarget(prefix)}
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
                                        {t('phonePrefix.pagination.showing')}{' '}
                                        <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                                        {' '}{t('phonePrefix.pagination.of')}{' '}
                                        <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                                        {' '}{t('phonePrefix.pagination.prefixes')}
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
                            {editTarget ? t('phonePrefix.modal.editTitle') : t('phonePrefix.modal.addTitle')}
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
                        label={t('phonePrefix.form.countryNameLabel')}
                        placeholder={t('phonePrefix.form.countryNamePlaceholder')}
                        required
                        radius="md"
                        leftSection={<IconWorldPin size={15} />}
                        {...form.getInputProps('countryName')}
                        styles={inputStyles}
                    />

                    <TextInput
                        label={t('phonePrefix.form.phonePrefixLabel')}
                        placeholder={t('phonePrefix.form.phonePrefixPlaceholder')}
                        required
                        radius="md"
                        leftSection={<IconPhone size={15} />}
                        {...form.getInputProps('phonePrefix')}
                        styles={inputStyles}
                    />

                    <Select
                        label={t('phonePrefix.form.flagLabel')}
                        placeholder={t('phonePrefix.form.flagPlaceholder')}
                        radius="md"
                        clearable
                        searchable
                        data={FLAG_SELECT_DATA}
                        leftSection={
                            form.values.flag
                                ? <Text size="lg" style={{ lineHeight: 1 }}>{countryCodeToFlag(form.values.flag)}</Text>
                                : <IconFlag size={15} />
                        }
                        renderOption={({ option }) => {
                            const country = COUNTRIES.find(c => c.code === option.value);
                            return (
                                <Group gap={8} align="center">
                                    <Text size="lg" style={{ lineHeight: 1, minWidth: 24 }}>
                                        {country?.flag ?? '🌐'}
                                    </Text>
                                    <Text size="xs" fw={600} style={{ fontFamily: 'monospace' }}>
                                        {option.value}
                                    </Text>
                                </Group>
                            );
                        }}
                        {...form.getInputProps('flag')}
                        styles={inputStyles}
                    />

                    <TextInput
                        label={t('phonePrefix.form.phoneRegexLabel')}
                        placeholder={t('phonePrefix.form.phoneRegexPlaceholder')}
                        radius="md"
                        leftSection={<IconAlertCircle size={15} />}
                        description={t('phonePrefix.form.phoneRegexDescription')}
                        {...form.getInputProps('phoneRegex')}
                        styles={{
                            input: {
                                ...inputStyles.input,
                                fontFamily: 'monospace',
                            },
                        }}
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
                        {editTarget ? t('phonePrefix.form.saveChanges') : t('phonePrefix.form.createPrefix')}
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
                        <Text fw={500} size="md">{t('phonePrefix.deleteModal.title')}</Text>
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
                                    background: 'var(--az-teal)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    fontSize: 22,
                                }}
                            >
                                {deleteTarget.flag ?? '🌐'}
                            </Box>
                            <div>
                                <Text fw={600} size="sm">{deleteTarget.countryName}</Text>
                                <Text c="dimmed" size="xs">{deleteTarget.phonePrefix}</Text>
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
                                {t('phonePrefix.deleteModal.confirm', { name: deleteTarget?.countryName })}
                            </Text>
                            <Text size="xs" ta="center" c="dimmed">
                                {t('phonePrefix.deleteModal.warning')}
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
                            {t('phonePrefix.deleteModal.cancel')}
                        </Button>
                        <Button
                            color="red"
                            flex={1}
                            radius="md"
                            loading={actionLoading}
                            leftSection={<IconTrash size={15} />}
                            onClick={handleDelete}
                        >
                            {t('phonePrefix.deleteModal.delete')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </motion.div>
    );
}