import { useState, useEffect, useCallback } from 'react';
import {
    Title, SimpleGrid, Stack, Box, Text, Group, TextInput, Button,
    Loader, Center, Pagination, Modal, ThemeIcon, Switch, ColorInput,
    Paper, Badge, ActionIcon, Tooltip, Kbd,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
    IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy,
    IconBuildingStore, IconUsers, IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { get, post, put, del } from '../../utils/api.utils';

const PAGE_SIZE = 6;

interface Partner {
    id: string;
    name: string;
    initials: string;
    color: string;
    isActive: boolean;
}

interface FormValues {
    name: string;
    initials: string;
    color: string;
    isActive: boolean;
}

// ── Partner Avatar ────────────────────────────────────────────────────────────
function PartnerAvatar({ partner }: { partner: Partner }) {
    return (
        <Box
            style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: partner.color || 'var(--az-teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 14px ${partner.color}55`,
                border: '2px solid rgba(255,255,255,0.12)',
            }}
        >
            <Text fw={800} size="lg" c="white" style={{ letterSpacing: '-0.5px' }}>
                {partner.initials || partner.name?.slice(0, 2).toUpperCase() || '??'}
            </Text>
        </Box>
    );
}

// ── Partner Card ──────────────────────────────────────────────────────────────
function PartnerCard({
    partner,
    onEdit,
    onDelete,
}: {
    partner: Partner;
    onEdit: (p: Partner) => void;
    onDelete: (p: Partner) => void;
}) {
    return (
        <motion.div
            layout
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            style={{ height: '100%' }}
        >
            <Paper
                className="glass-card card-gradient-border"
                p="lg"
                radius="xl"
                style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    borderTop: `3px solid ${partner.color || 'var(--az-teal)'}`,
                }}
            >
                <Group justify="space-between" align="flex-start">
                    <Group gap={12} align="center">
                        <PartnerAvatar partner={partner} />
                        <div>
                            <Text fw={700} size="md" style={{ lineHeight: 1.2 }}>{partner.name}</Text>
                            <Text c="dimmed" size="xs" mt={2}>
                                <Kbd size="xs" style={{ fontSize: 10, background: 'rgba(255,255,255,0.06)' }}>
                                    {partner.initials}
                                </Kbd>
                            </Text>
                        </div>
                    </Group>
                    <Badge
                        size="sm"
                        variant="dot"
                        color={partner.isActive ? 'teal' : 'gray'}
                        style={{ flexShrink: 0, marginTop: 2 }}
                    >
                        {partner.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                </Group>

                <Group gap="xs" mt="auto" justify="flex-end">
                    <Tooltip label="Edit partner" withArrow>
                        <ActionIcon
                            variant="light"
                            color="teal"
                            radius="md"
                            size="md"
                            onClick={() => onEdit(partner)}
                        >
                            <IconEdit size={15} />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete partner" withArrow>
                        <ActionIcon
                            variant="light"
                            color="red"
                            radius="md"
                            size="md"
                            onClick={() => onDelete(partner)}
                        >
                            <IconTrash size={15} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Paper>
        </motion.div>
    );
}

// ── Input styles ──────────────────────────────────────────────────────────────
const inputStyles = {
    input: {
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid var(--mantine-color-default-border)',
        '&:focus': { borderColor: 'var(--az-teal)' },
    },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PartnersPage() {
    const { t } = useTranslation();

    const [partners, setPartners] = useState<Partner[]>([]);
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
    const [editTarget, setEditTarget] = useState<Partner | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);

    const form = useForm<FormValues>({
        initialValues: { name: '', initials: '', color: '#2dd4a8', isActive: true },
        validate: {
            name: (v) => (!v.trim() ? 'Name is required' : null),
            initials: (v) => (!v.trim() ? 'Initials are required' : v.length > 4 ? 'Max 4 chars' : null),
            color: (v) => (!v ? 'Color is required' : null),
        },
    });

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch]);

    const startItem = (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchPartners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                PageNr: String(page),
                PageSize: String(PAGE_SIZE),
            });
            if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());

            const res = await get(`Partner/getPaged?${params.toString()}`);
            if (!res.success) throw new Error(res.message || 'Failed to load partners');

            setPartners(res.data.items ?? []);
            setTotalPages(res.data.totalPages ?? 1);
            setTotalCount(res.data.totalCount ?? 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setPartners([]);
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchPartners(); }, [fetchPartners]);

    // ── Open create modal ──────────────────────────────────────────────────────
    const openCreate = () => {
        setEditTarget(null);
        form.reset();
        setModalOpen(true);
    };

    // ── Open edit modal ────────────────────────────────────────────────────────
    const openEdit = (partner: Partner) => {
        setEditTarget(partner);
        form.setValues({
            name: partner.name,
            initials: partner.initials,
            color: partner.color,
            isActive: partner.isActive,
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
                const res = await put(`Partner/${editTarget.id}`, {
                    id: editTarget.id,
                    ...form.values,
                });
                if (!res.success) throw new Error(res.message || 'Failed to update partner');
            } else {
                const res = await post('Partner', form.values);
                if (!res.success) throw new Error(res.message || 'Failed to create partner');
            }
            closeModal();
            fetchPartners();
        } catch (err) {
            // surface error inside modal or toast
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
            const res = await del(`Partner/${deleteTarget.id}`);
            if (!res.success) throw new Error(res.message || 'Failed to delete partner');
            setDeleteTarget(null);
            fetchPartners();
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
                                <Title order={2} fw={800}>Partners</Title>
                                <Text c="dimmed" size="sm" mt={4}>
                                    Manage partner organisations and their branding
                                </Text>
                            </div>
                        </Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            color="teal"
                            radius="md"
                            onClick={openCreate}
                        >
                            Add Partner
                        </Button>
                    </Group>
                </AnimatedSection>

                {/* Filters */}
                <AnimatedSection delay={0.08}>
                    <Group wrap="wrap" align="end" gap="sm" mb="sm">
                        <TextInput
                            placeholder="Search partners…"
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
                        />
                        <Tooltip label="Refresh" withArrow>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                size="lg"
                                radius="md"
                                onClick={fetchPartners}
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
                ) : partners.length > 0 ? (
                    <AnimatedSection delay={0.1}>
                        <Stack gap="md">
                            <Box
                                className="glass-card card-gradient-border"
                                p={{ base: 'md', sm: 'xl' }}
                                style={{ borderRadius: 'var(--mantine-radius-xl)' }}
                            >
                                <StaggerContainer stagger={0.07}>
                                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                                        <AnimatePresence>
                                            {partners.map((p, i) => (
                                                <StaggerItem key={p.id} scale>
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 16 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        transition={{ duration: 0.35, delay: i * 0.04 }}
                                                        style={{ height: '100%' }}
                                                    >
                                                        <PartnerCard
                                                            partner={p}
                                                            onEdit={openEdit}
                                                            onDelete={setDeleteTarget}
                                                        />
                                                    </motion.div>
                                                </StaggerItem>
                                            ))}
                                        </AnimatePresence>
                                    </SimpleGrid>
                                </StaggerContainer>
                            </Box>

                            {totalPages > 1 && (
                                <Group justify="space-between" align="center" px={4}>
                                    <Text size="xs" c="dimmed">
                                        Showing{' '}
                                        <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                                        {' '}of{' '}
                                        <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                                        {' '}partners
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
                ) : (
                    <AnimatedSection delay={0.1}>
                        <Center py={60}>
                            <Stack align="center" gap="xs">
                                <ThemeIcon size={56} radius="xl" color="teal" variant="light">
                                    <IconUsers size={28} />
                                </ThemeIcon>
                                <Text fw={600} size="md" mt="xs">No partners found</Text>
                                <Text c="dimmed" size="sm">
                                    {search ? 'Try a different search term' : 'Add your first partner to get started'}
                                </Text>
                                {!search && (
                                    <Button
                                        leftSection={<IconPlus size={15} />}
                                        color="teal"
                                        variant="light"
                                        radius="md"
                                        mt="xs"
                                        onClick={openCreate}
                                    >
                                        Add Partner
                                    </Button>
                                )}
                            </Stack>
                        </Center>
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
                            {editTarget ? 'Edit Partner' : 'Add Partner'}
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
                        label="Name"
                        placeholder="e.g. Acme Corporation"
                        required
                        radius="md"
                        {...form.getInputProps('name')}
                        styles={inputStyles}
                    />

                    <TextInput
                        label="Initials"
                        placeholder="e.g. AC"
                        description="2–4 characters shown in the avatar"
                        required
                        maxLength={4}
                        radius="md"
                        {...form.getInputProps('initials')}
                        styles={inputStyles}
                        rightSection={
                            <Text size="xs" c="dimmed" pr={4}>
                                {form.values.initials.length}/4
                            </Text>
                        }
                    />

                    <ColorInput
                        label="Brand Color"
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

                    {/* Live preview */}
                    {(form.values.name || form.values.initials) && (
                        <Paper
                            p="md"
                            radius="md"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid var(--mantine-color-default-border)' }}
                        >
                            <Text size="xs" c="dimmed" mb={10}>Preview</Text>
                            <Group gap={12}>
                                <Box
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        background: form.values.color || '#2dd4a8',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: `0 4px 14px ${form.values.color}55`,
                                    }}
                                >
                                    <Text fw={800} size="sm" c="white">
                                        {form.values.initials || form.values.name?.slice(0, 2).toUpperCase() || '?'}
                                    </Text>
                                </Box>
                                <div>
                                    <Text fw={600} size="sm">{form.values.name || 'Partner name'}</Text>
                                    <Badge size="xs" color={form.values.isActive ? 'teal' : 'gray'} variant="dot" mt={2}>
                                        {form.values.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </Group>
                        </Paper>
                    )}

                    <Switch
                        label="Active"
                        description="Inactive partners are hidden from public-facing areas"
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
                        {editTarget ? 'Save Changes' : 'Create Partner'}
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
                        <Text fw={500} size="md">{t('partners.deleteTitle')}</Text>
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
                                <Text fw={800} size="sm" c="white">{deleteTarget.initials}</Text>
                            </Box>
                            <div>
                                <Text fw={600} size="sm">{deleteTarget.name}</Text>
                                <Text c="dimmed" size="xs">{deleteTarget.initials}</Text>
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
                                {t('carData.deleteWarning', { name: deleteTarget?.name })}
                            </Text>
                            <Text size="xs" ta="center" c="dimmed">
                                {t('deleteUndone')}
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
                            {t('cancel')}
                        </Button>
                        <Button
                            color="red"
                            flex={1}
                            radius="md"
                            loading={actionLoading}
                            leftSection={<IconTrash size={15} />}
                            onClick={handleDelete}
                        >
                            {t('delete')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </motion.div>
    );
}