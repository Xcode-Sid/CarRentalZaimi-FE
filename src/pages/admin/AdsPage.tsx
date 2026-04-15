import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Title, Stack, Box, Text, Group, TextInput, Button,
  Loader, Center, Pagination, Modal, ThemeIcon, Switch,
  Paper, Badge, ActionIcon, Tooltip, Table, Select, Image,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy,
  IconRefresh, IconPhoto, IconVideo, IconLink, IconAlertTriangle,
  IconCheck, IconBan, IconAd2, IconUpload, IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import { PAGE_SIZE } from '../../constants/pagination';
import { get, post, put, del } from '../../utils/api.utils';
import { toImagePath } from '../../utils/general';
import { notifications } from '@mantine/notifications';
import { mapToAd, type Ad } from '../../data/ads';


interface FormValues {
  title: string;
  imageName: string;
  videoName: string;
  imageData: string;
  videoData: string;
  linkUrl: string;
  position: 'top' | 'bottom' | '';
  isActive: boolean;
}

// ── File Upload Field ─────────────────────────────────────────────────────────
function FileUploadField({
  label,
  accept,
  value,
  onChange,
  onClear,
  error,
  icon,
  previewType,
  placeholder,
  required,
}: {
  label: string;
  accept: string;
  value: string;
  onChange: (base64: string, fileName: string) => void;
  onClear: () => void;
  error?: string;
  icon: React.ReactNode;
  previewType: 'image' | 'video';
  placeholder: string;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string, file.name);
    };
    reader.readAsDataURL(file);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <Box>
      <Text size="sm" fw={500} mb={6}>
        {label}{required && <Text component="span" c="red" ml={4}>*</Text>}
      </Text>

      {value ? (
        <Box style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '0.5px solid var(--mantine-color-default-border)' }}>
          {previewType === 'image' ? (
            <Image src={value} h={140} fit="cover" fallbackSrc="https://placehold.co/400x140?text=Invalid" />
          ) : (
            <Box
              component="video"
              src={value}
              controls
              style={{ width: '100%', maxHeight: 140, display: 'block', background: '#000' }}
            />
          )}
          <ActionIcon
            size="sm"
            radius="xl"
            color="red"
            variant="filled"
            style={{ position: 'absolute', top: 6, right: 6 }}
            onClick={onClear}
          >
            <IconX size={12} />
          </ActionIcon>
          <Box
            style={{
              position: 'absolute',
              bottom: 6,
              right: 6,
            }}
          >
            <Button
              size="xs"
              variant="filled"
              color="dark"
              radius="md"
              leftSection={<IconUpload size={12} />}
              onClick={() => inputRef.current?.click()}
              style={{ opacity: 0.85 }}
            >
              Replace
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: error
              ? '1.5px dashed var(--mantine-color-red-5)'
              : '1.5px dashed var(--mantine-color-default-border)',
            borderRadius: 10,
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--az-teal)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(45,212,168,0.04)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = error
              ? 'var(--mantine-color-red-5)'
              : 'var(--mantine-color-default-border)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
          }}
        >
          <ThemeIcon size={36} radius="xl" color="teal" variant="light">
            {icon}
          </ThemeIcon>
          <Text size="sm" c="dimmed" ta="center">{placeholder}</Text>
          <Button size="xs" variant="light" color="teal" radius="md" leftSection={<IconUpload size={13} />}>
            Browse file
          </Button>
        </Box>
      )}

      {error && (
        <Text size="xs" c="red" mt={4}>{error}</Text>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </Box>
  );
}


const inputStyles = {
  input: {
    background: 'rgba(255,255,255,0.04)',
    border: '0.5px solid var(--mantine-color-default-border)',
  },
  wrapper: {
    '--input-bd-focus': 'var(--az-teal)',
  },
} as const;

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdsPage() {
  const { t } = useTranslation();

  const [ads, setAds] = useState<Ad[]>([]);
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
  const [editTarget, setEditTarget] = useState<Ad | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ad | null>(null);

  const form = useForm<FormValues>({
    initialValues: {
      title: '',
      imageName: '',
      videoName: '',
      imageData: '',
      videoData: '',
      linkUrl: '',
      position: 'top',
      isActive: true,
    },
    validate: {
      title: (v) => (!v.trim() ? t('ads.validation.titleRequired') : null),
      imageData: (_v, values) =>
        (!values.imageData.trim() && !values.videoData.trim())
          ? t('ads.validation.imageOrVideoRequired')
          : null,
      videoData: (_v, values) =>
        (!values.imageData.trim() && !values.videoData.trim())
          ? t('ads.validation.imageOrVideoRequired')
          : null,
      linkUrl: () => null,
      position: (v) => (!v ? t('ads.validation.positionRequired') : null),
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
  const fetchAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        PageNr: String(page),
        PageSize: String(PAGE_SIZE),
      });
      if (debouncedSearch.trim()) params.set('Search', debouncedSearch.trim());

      const res = await get(`Ads/getPagedAds?${params.toString()}`);
      if (!res.success) throw new Error(res.message || t('ads.errors.loadFailed'));

      setAds((res.data.items ?? []).map(mapToAd));
      setTotalPages(res.data.totalPages ?? 1);
      setTotalCount(res.data.totalCount ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('ads.errors.unknown'));
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchAds(); }, [fetchAds]);

  // ── Open create modal ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    form.reset();
    setModalOpen(true);
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (ad: Ad) => {
    setEditTarget(ad);
    form.setValues({
      title: ad.title,
      imageData: ad.imageUrl ?? '',
      videoData: ad.videoUrl ?? '',
      linkUrl: ad.linkUrl ?? '',
      position: ad.position ?? 'top',
      isActive: ad.isActive,
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
        title: form.values.title,
        imageData: form.values.imageData.startsWith('http')
          ? null : form.values.imageData,
        imageName: form.values.imageName || null,
        videoData: form.values.videoData.startsWith('http')
          ? null : form.values.videoData,
        videoName: form.values.videoName || null,
        linkUrl: form.values.linkUrl || null,
        position: form.values.position || null,
        isActive: form.values.isActive,
      };

      if (editTarget) {
        const res = await put(`Ads/${editTarget.id}`, { id: editTarget.id, ...payload });
        if (!res.success) throw new Error(res.message || t('ads.errors.updateFailed'));
      } else {
        const res = await post('Ads', payload);
        if (!res.success) throw new Error(res.message || t('ads.errors.createFailed'));
      }
      closeModal();
      fetchAds();
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
      const res = await del(`Ads/${deleteTarget.id}`);
      if (!res.success) throw new Error(res.message || t('ads.errors.deleteFailed'));
      setDeleteTarget(null);
      fetchAds();
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
                <Title order={2} fw={800}>{t('ads.title')}</Title>
                <Text c="dimmed" size="sm" mt={4}>
                  {t('ads.subtitle')}
                </Text>
              </div>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              color="teal"
              radius="md"
              onClick={openCreate}
            >
              {t('ads.addAd')}
            </Button>
          </Group>
        </AnimatedSection>

        {/* Filters */}
        <AnimatedSection delay={0.08}>
          <Group wrap="wrap" align="end" gap="sm" mb="sm">
            <TextInput
              placeholder={t('ads.searchPlaceholder')}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1, minWidth: 240, maxWidth: 420 }}
            />
            <Tooltip label={t('ads.refresh')} withArrow>
              <ActionIcon
                variant="light"
                color="teal"
                size="lg"
                radius="md"
                onClick={fetchAds}
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
                <Table.ScrollContainer minWidth={700}>
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
                        <Table.Th w={100}>{t('ads.table.preview')}</Table.Th>
                        <Table.Th>{t('ads.table.title')}</Table.Th>
                        <Table.Th>{t('ads.table.position')}</Table.Th>
                        <Table.Th>{t('ads.table.type')}</Table.Th>
                        <Table.Th>{t('ads.table.link')}</Table.Th>
                        <Table.Th>{t('ads.table.status')}</Table.Th>
                        <Table.Th w={90}>{t('ads.table.actions')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      {/* Skeleton rows while loading */}
                      {loading &&
                        [1, 2, 3, 4].map((i) => (
                          <Table.Tr key={i}>
                            {[40, 80, 20 + i * 6, 10, 10, 20, 10, 10].map((w, j) => (
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
                      {!loading && ads.length === 0 && (
                        <Table.Tr>
                          <Table.Td colSpan={8}>
                            <Center py="xl">
                              <Stack align="center" gap="xs">
                                <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                  <IconAd2 size={18} />
                                </ThemeIcon>
                                <Text size="sm" c="dimmed">
                                  {search
                                    ? t('ads.empty.searchHint')
                                    : t('ads.empty.hint')}
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
                                    {t('ads.addAd')}
                                  </Button>
                                )}
                              </Stack>
                            </Center>
                          </Table.Td>
                        </Table.Tr>
                      )}

                      {/* Data rows */}
                      {!loading &&
                        ads.map((ad, idx) => (
                          <motion.tr
                            key={ad.id}
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

                            {/* Preview */}
                            <Table.Td>
                              {ad.imageUrl ? (
                                <Image
                                  src={ad.imageUrl}
                                  w={80}
                                  h={45}
                                  radius="sm"
                                  fit="cover"
                                  fallbackSrc="https://placehold.co/80x45?text=Ad"
                                />
                              ) : ad.videoUrl ? (
                                <Box style={{ position: 'relative', width: 80, height: 45, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                                  <Box
                                    component="video"
                                    src={ad.videoUrl}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      display: 'block',
                                      pointerEvents: 'none',
                                    }}
                                    preload="metadata"
                                    onLoadedMetadata={(e) => {
                                      (e.currentTarget as HTMLVideoElement).currentTime = 1;
                                    }}
                                  />
                                  <Box
                                    style={{
                                      position: 'absolute',
                                      inset: 0,
                                      background: 'rgba(0,0,0,0.32)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <IconVideo size={18} color="white" style={{ opacity: 0.9 }} />
                                  </Box>
                                </Box>
                              ) : (
                                <Box
                                  style={{
                                    width: 80,
                                    height: 45,
                                    borderRadius: 6,
                                    background: 'var(--mantine-color-default-hover)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '0.5px solid var(--mantine-color-default-border)',
                                  }}
                                >
                                  <IconPhoto size={16} color="var(--mantine-color-dimmed)" />
                                </Box>
                              )}
                            </Table.Td>

                            {/* Title */}
                            <Table.Td>
                              <Text size="sm" fw={500}>{ad.title}</Text>
                            </Table.Td>

                            {/* Position */}
                            <Table.Td>
                              <Badge
                                color={ad.position === 'top' ? 'blue' : 'orange'}
                                variant="light"
                                size="sm"
                                radius="md"
                              >
                                {ad.position ?? '—'}
                              </Badge>
                            </Table.Td>

                            {/* Type */}
                            <Table.Td>
                              <Badge
                                color={ad.videoUrl ? 'violet' : 'gray'}
                                variant="light"
                                size="sm"
                                radius="md"
                                leftSection={
                                  ad.videoUrl
                                    ? <IconVideo size={11} />
                                    : <IconPhoto size={11} />
                                }
                              >
                                {ad.videoUrl ? t('ads.type.video') : t('ads.type.image')}
                              </Badge>
                            </Table.Td>

                            {/* Link */}
                            <Table.Td style={{ maxWidth: 180 }}>
                              {ad.linkUrl ? (
                                <Tooltip label={ad.linkUrl} withArrow fz="xs">
                                  <Group gap={4} align="center" style={{ cursor: 'default' }}>
                                    <IconLink size={13} color="var(--mantine-color-dimmed)" />
                                    <Text size="xs" c="dimmed" truncate style={{ maxWidth: 140 }}>
                                      {ad.linkUrl}
                                    </Text>
                                  </Group>
                                </Tooltip>
                              ) : (
                                <Text size="sm" c="dimmed">—</Text>
                              )}
                            </Table.Td>

                            {/* Status */}
                            <Table.Td>
                              {ad.isActive ? (
                                <Badge
                                  color="green"
                                  variant="light"
                                  size="sm"
                                  radius="md"
                                  leftSection={<IconCheck size={11} />}
                                >
                                  {t('ads.status.active')}
                                </Badge>
                              ) : (
                                <Badge
                                  color="gray"
                                  variant="light"
                                  size="sm"
                                  radius="md"
                                  leftSection={<IconBan size={11} />}
                                >
                                  {t('ads.status.inactive')}
                                </Badge>
                              )}
                            </Table.Td>

                            {/* Actions */}
                            <Table.Td>
                              <Group gap={4}>
                                <Tooltip label={t('ads.actions.edit')} withArrow fz="xs">
                                  <ActionIcon
                                    variant="subtle"
                                    color="yellow"
                                    size="sm"
                                    radius="md"
                                    onClick={() => openEdit(ad)}
                                  >
                                    <IconEdit size={15} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label={t('ads.actions.delete')} withArrow fz="xs">
                                  <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    radius="md"
                                    onClick={() => setDeleteTarget(ad)}
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
                    {t('ads.pagination.showing')}{' '}
                    <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                    {' '}{t('ads.pagination.of')}{' '}
                    <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                    {' '}{t('ads.pagination.ads')}
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
              {editTarget ? t('ads.modal.editTitle') : t('ads.modal.addTitle')}
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
            label={t('ads.form.titleLabel')}
            placeholder={t('ads.form.titlePlaceholder')}
            required
            radius="md"
            leftSection={<IconAd2 size={15} />}
            {...form.getInputProps('title')}
            styles={inputStyles}
          />

          {/* Image or Video — at least one required */}
          <Box>
            <Text size="sm" fw={500} mb={4}>
              {t('ads.form.mediaLabel')}
              <Text component="span" c="red" ml={4}>*</Text>
            </Text>
            <Text size="xs" c="dimmed" mb={10}>
              {t('ads.form.mediaHint')}
            </Text>
            <Stack gap="sm">
              <FileUploadField
                label={t('ads.form.imageLabel')}
                accept="image/*"
                value={form.values.imageData}
                onChange={(base64, fileName) => {
                  if (form.values.videoData) {
                    notifications.show({
                      color: 'red',
                      title: t('ads.validation.onlyOneMediaTitle'),
                      message: t('ads.validation.onlyOneMediaMessage'),
                      icon: <IconAlertTriangle size={16} />,
                    });
                    return;
                  }
                  form.setFieldValue('imageData', base64);
                  form.setFieldValue('imageName', fileName);
                  form.clearFieldError('imageData');
                  form.clearFieldError('videoData');
                }}
                onClear={() => form.setFieldValue('imageData', '')}
                error={!form.values.videoData ? form.errors.imageData as string | undefined : undefined}
                icon={<IconPhoto size={18} />}
                previewType="image"
                placeholder={t('ads.form.imagePlaceholder')}
              />

              <Group gap={8} align="center">
                <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-default-border)' }} />
                <Text size="xs" c="dimmed" fw={500}>OR</Text>
                <Box style={{ flex: 1, height: 1, background: 'var(--mantine-color-default-border)' }} />
              </Group>

              <FileUploadField
                label={t('ads.form.videoLabel')}
                accept="video/*"
                value={form.values.videoData}
                onChange={(base64, fileName) => {
                  if (form.values.imageData) {
                    notifications.show({
                      color: 'red',
                      title: t('ads.validation.onlyOneMediaTitle'),
                      message: t('ads.validation.onlyOneMediaMessage'),
                      icon: <IconAlertTriangle size={16} />,
                    });
                    return;
                  }
                  form.setFieldValue('videoData', base64);
                  form.setFieldValue('videoName', fileName);
                  form.clearFieldError('imageData');
                  form.clearFieldError('videoData');
                }}
                onClear={() => {
                  form.setFieldValue('videoData', '');
                  form.setFieldValue('videoName', '');
                }}
                error={!form.values.imageData ? form.errors.videoData as string | undefined : undefined}
                icon={<IconVideo size={18} />}
                previewType="video"
                placeholder={t('ads.form.videoPlaceholder')}
              />
            </Stack>
          </Box>

          <TextInput
            label={t('ads.form.linkLabel')}
            placeholder={t('ads.form.linkPlaceholder')}
            radius="md"
            leftSection={<IconLink size={15} />}
            {...form.getInputProps('linkUrl')}
            styles={inputStyles}
          />

          <Select
            label={t('ads.form.positionLabel')}
            placeholder={t('ads.form.positionPlaceholder')}
            required
            radius="md"
            data={[
              { value: 'top', label: t('ads.position.top') },
              { value: 'bottom', label: t('ads.position.bottom') },
            ]}
            {...form.getInputProps('position')}
            styles={inputStyles}
          />

          <Switch
            label={t('ads.form.activeLabel')}
            description={t('ads.form.activeDescription')}
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
            {editTarget ? t('ads.form.saveChanges') : t('ads.form.createAd')}
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
            <Text fw={500} size="md">{t('ads.deleteModal.title')}</Text>
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
              {deleteTarget.imageUrl ? (
                <Image
                  src={deleteTarget.imageUrl}
                  w={64}
                  h={44}
                  radius="md"
                  fit="cover"
                  fallbackSrc="https://placehold.co/64x44?text=Ad"
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <Box
                  style={{
                    width: 64,
                    height: 44,
                    borderRadius: 10,
                    background: 'var(--mantine-color-default-hover)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IconPhoto size={20} color="var(--mantine-color-dimmed)" />
                </Box>
              )}
              <div>
                <Text fw={600} size="sm">{deleteTarget.title}</Text>
                <Text c="dimmed" size="xs">
                  {deleteTarget.position
                    ? t(`ads.position.${deleteTarget.position}`)
                    : '—'}
                  {deleteTarget.videoUrl ? ` · ${t('ads.type.video')}` : ` · ${t('ads.type.image')}`}
                </Text>
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
              <Group gap={6}>
                <IconAlertTriangle size={15} color="var(--mantine-color-red-8)" />
                <Text size="sm" ta="center" fw={500} c="red.8">
                  {t('ads.deleteModal.confirm', { name: deleteTarget?.title })}
                </Text>
              </Group>
              <Text size="xs" ta="center" c="dimmed">
                {t('ads.deleteModal.warning')}
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
              {t('ads.deleteModal.cancel')}
            </Button>
            <Button
              color="red"
              flex={1}
              radius="md"
              loading={actionLoading}
              leftSection={<IconTrash size={15} />}
              onClick={handleDelete}
            >
              {t('ads.deleteModal.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </motion.div>
  );
}