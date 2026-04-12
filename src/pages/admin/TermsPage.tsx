import { useState, useEffect, useCallback } from 'react';
import {
  Title, Stack, Box, Text, Group, TextInput, Button,
  Loader, Center, Pagination, Modal, ThemeIcon, Switch, ColorInput,
  Paper, Badge, ActionIcon, Tooltip, Table, ScrollArea, Textarea, Select,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy,
  IconFileText, IconRefresh, IconShieldCheck, IconLock, IconKey,
  IconScale, IconBuildingBank, IconUserCheck, IconAlertCircle,
  IconCookie, IconMail, IconPhone, IconGlobe, IconInfoCircle,
  IconClipboardList, IconNotes, IconStarFilled, IconBell,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { get, post, put, del } from '../../utils/api.utils';

const PAGE_SIZE = 10;

// ── Icon registry ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<{ size?: number; color?: string }>> = {
  'file-text':      IconFileText,
  'shield-check':   IconShieldCheck,
  'lock':           IconLock,
  'key':            IconKey,
  'scale':          IconScale,
  'building-bank':  IconBuildingBank,
  'user-check':     IconUserCheck,
  'alert-circle':   IconAlertCircle,
  'cookie':         IconCookie,
  'mail':           IconMail,
  'phone':          IconPhone,
  'globe':          IconGlobe,
  'info-circle':    IconInfoCircle,
  'clipboard-list': IconClipboardList,
  'notes':          IconNotes,
  'star':           IconStarFilled,
  'bell':           IconBell,
};

const ICON_OPTIONS = Object.keys(ICON_MAP).map((value) => ({ value, label: value }));

function TermIcon({ icon, size = 14, color = 'white' }: { icon: string | null; size?: number; color?: string }) {
  const Comp = icon ? ICON_MAP[icon] : null;
  return Comp ? <Comp size={size} color={color} /> : <IconFileText size={size} color={color} />;
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
      title: (v) => (!v.trim() ? 'Title is required' : null),
      description: (v) => (!v.trim() ? 'Description is required' : null),
      color: (v) => (!v ? 'Color is required' : null),
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
      if (!res.success) throw new Error(res.message || 'Failed to load terms');

      setTerms(res.data.items ?? []);
      setTotalPages(res.data.totalPages ?? 1);
      setTotalCount(res.data.totalCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
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
        if (!res.success) throw new Error(res.message || 'Failed to update term');
      } else {
        const res = await post('Terms', form.values);
        if (!res.success) throw new Error(res.message || 'Failed to create term');
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
      if (!res.success) throw new Error(res.message || 'Failed to delete term');
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
                <Title order={2} fw={800}>Terms & Conditions</Title>
                <Text c="dimmed" size="sm" mt={4}>
                  Manage terms and conditions entries
                </Text>
              </div>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              color="teal"
              radius="md"
              onClick={openCreate}
            >
              Add Term
            </Button>
          </Group>
        </AnimatedSection>

        {/* Filters */}
        <AnimatedSection delay={0.08}>
          <Group wrap="wrap" align="end" gap="sm" mb="sm">
            <TextInput
              placeholder="Search terms…"
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
              <Box
                className="glass-card card-gradient-border"
                style={{ borderRadius: 'var(--mantine-radius-xl)', overflow: 'hidden' }}
              >
                <ScrollArea>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Title</Table.Th>
                        <Table.Th>Description</Table.Th>
                        <Table.Th>Color</Table.Th>
                        <Table.Th>Icon</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {terms.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={6}>
                            <Center py={60}>
                              <Stack align="center" gap="xs">
                                <ThemeIcon size={56} radius="xl" color="teal" variant="light">
                                  <IconShieldCheck size={28} />
                                </ThemeIcon>
                                <Text fw={600} size="md" mt="xs">No terms found</Text>
                                <Text c="dimmed" size="sm">
                                  {search ? 'Try a different search term' : 'Add your first term to get started'}
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
                                    Add Term
                                  </Button>
                                )}
                              </Stack>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        terms.map((term) => (
                          <Table.Tr key={term.id}>
                            <Table.Td>
                              <Group gap={10} align="center">
                                <Box
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 8,
                                    background: term.color || 'var(--az-teal)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: `0 2px 8px ${term.color}55`,
                                  }}
                                >
                                  <IconFileText size={14} color="white" />
                                </Box>
                                <Text size="sm" fw={600}>{term.title}</Text>
                              </Group>
                            </Table.Td>
                            <Table.Td style={{ maxWidth: 320 }}>
                              <Text size="sm" c="dimmed" lineClamp={2}>
                                {term.description}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Group gap={6} align="center">
                                <Box
                                  style={{
                                    width: 16,
                                    height: 16,
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
                            <Table.Td>
                              {term.icon ? (
                                <Group gap={6} align="center">
                                  <Box
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: 6,
                                      background: term.color || 'var(--az-teal)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <TermIcon icon={term.icon} size={13} color="white" />
                                  </Box>
                                  <Text size="xs" c="dimmed">{term.icon}</Text>
                                </Group>
                              ) : (
                                <Text size="sm" c="dimmed">—</Text>
                              )}
                            </Table.Td>
                            <Table.Td>
                              <Badge
                                size="sm"
                                variant="dot"
                                color={term.isActive ? 'teal' : 'gray'}
                              >
                                {term.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Group gap={4}>
                                <Tooltip label="Edit term" withArrow>
                                  <ActionIcon
                                    variant="subtle"
                                    color="teal"
                                    size="sm"
                                    onClick={() => openEdit(term)}
                                  >
                                    <IconEdit size={15} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete term" withArrow>
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    onClick={() => setDeleteTarget(term)}
                                  >
                                    <IconTrash size={15} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        ))
                      )}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              </Box>

              {totalPages > 1 && (
                <Group justify="space-between" align="center" px={4}>
                  <Text size="xs" c="dimmed">
                    Showing{' '}
                    <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                    {' '}of{' '}
                    <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                    {' '}terms
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
              {editTarget ? 'Edit Term' : 'Add Term'}
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
            label="Title"
            placeholder="e.g. Privacy Policy"
            required
            radius="md"
            {...form.getInputProps('title')}
            styles={inputStyles}
          />

          <Textarea
            label="Description"
            placeholder="Enter the full description or content of this term…"
            required
            radius="md"
            minRows={4}
            autosize
            maxRows={8}
            {...form.getInputProps('description')}
            styles={inputStyles}
          />

          <Select
            label="Icon"
            placeholder="Select an icon (optional)"
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
                : <IconFileText size={14} />
            }
            {...form.getInputProps('icon')}
            styles={inputStyles}
          />

          <ColorInput
            label="Color"
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
            label="Active"
            description="Inactive terms are hidden from public-facing areas"
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
            {editTarget ? 'Save Changes' : 'Create Term'}
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
            <Text fw={500} size="md">Delete Term</Text>
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
                <IconFileText size={20} color="white" />
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
                Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
              </Text>
              <Text size="xs" ta="center" c="dimmed">
                This action cannot be undone.
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
              Cancel
            </Button>
            <Button
              color="red"
              flex={1}
              radius="md"
              loading={actionLoading}
              leftSection={<IconTrash size={15} />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </motion.div>
  );
}