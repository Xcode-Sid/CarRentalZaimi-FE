import { useState, useEffect, useCallback } from 'react';
import {
    Title, TextInput, Button, Table, Badge,
    Group, ActionIcon, Image, Stack, Loader, Center, Text,
    ThemeIcon, Tooltip, Paper, Alert, Switch, Pagination,
} from '@mantine/core';
import {
    IconSearch, IconStar, IconStarFilled, IconCar,
    IconInfoCircle, IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { type Vehicle, mapApiCarToVehicle } from '../../../data/vehicles';
import { PAGE_SIZE } from '../../../constants/pagination';
import { get, post } from '../../../utils/apiUtils';
import { AnimatedSection } from '../../../components/common/AnimatedSection';
import Spinner from '../../../components/spinner/Spinner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDisplayName(car: Vehicle | null, t: (key: string, opts?: any) => string): string {
    return car?.title ?? (car?.carId ? t('admin.carNumber', { id: car.carId }) : t('common.unknown'));
}

function getPrimaryImageSrc(car: Vehicle): string {
    const primary = car.carImages?.find((img) => img.isPrimary) ?? car.carImages?.[0];
    if (!primary?.data) return '';
    return primary.data;
}


// ── Page ─────────────────────────────────────────────────────────────────────

export default function RecommendedCarsPage() {
    const { t } = useTranslation();
    const [cars, setCars] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // ── Fetch ─────────────────────────────────────────────────────────────────

    const fetchCars = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                pageNr: String(page),
                pageSize: String(PAGE_SIZE),
            });
            if (search) params.set('search', search);

            const res = await get(`Cars?${params.toString()}`);
            if (res.success) {
                setCars(res.data.items.map(mapApiCarToVehicle));
                setTotalPages(res.data.totalPages);
                setTotalCount(res.data.totalCount);
            } else {
                setError(t('failedToLoadCars'));
            }
        } catch {
            setError(t('failedToLoadCars'));
        } finally {
            setLoading(false);
        }
    }, [search, page]);

    useEffect(() => { fetchCars(); }, [fetchCars]);

    // Reset to page 1 when search changes
    useEffect(() => { setPage(1); }, [search]);

    // ── Toggle Featured ───────────────────────────────────────────────────────

    const handleToggleFeatured = async (car: Vehicle) => {
        const next = !car.isRecommended;
        setTogglingId(car.carId);

        setCars((prev) =>
            prev.map((c) => (c.carId === car.carId ? { ...c, isRecommended: next } : c))
        );
        try {
            const res = await post(`Cars/add-featured-car`, { carId: car.carId, isRecommended: next });
            if (res.success) {
                notifications.show({
                    title: t('success'),
                    message: next
                        ? `${getDisplayName(car, t)} ${t('isNowFeatured')}`
                        : `${getDisplayName(car, t)} ${t('removedFromFeatured')}`,
                    color: 'teal'
                });
            } else {
                setCars((prev) =>
                    prev.map((c) => (c.carId === car.carId ? { ...c, isRecommended: !next } : c))
                );
                notifications.show({ title: t('error'), message: t('failedToUpdateFaturedStatus'), color: 'red' });
            }
        } catch {
            setCars((prev) =>
                prev.map((c) => (c.carId === car.carId ? { ...c, isRecommended: !next } : c))
            );
            notifications.show({ title: t('error'), message: t('failedToUpdateFaturedStatus'), color: 'red' });
        } finally {
            setTogglingId(null);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────

    const featuredCount = cars.filter((c) => c.isRecommended).length;
    const startItem = (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <Spinner visible={loading} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
            >
                <Stack gap="xl">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <AnimatedSection>
                        <Group justify="space-between" align="center">
                            <Stack gap={2}>
                                <Title order={2} fw={500} style={{ letterSpacing: '-0.01em' }}>
                                    {t('admin.managefeaturedCars')}
                                </Title>
                                <Text size="sm" c="dimmed">
                                    {featuredCount} / {cars.length}{' '}
                                    {t('admin.carsMarkedFeatured')}
                                </Text>
                            </Stack>

                            <Badge
                                size="lg"
                                radius="md"
                                color="teal"
                                variant="light"
                                leftSection={<IconStarFilled size={12} />}
                            >
                                {featuredCount} {t('admin.featured')}
                            </Badge>
                        </Group>
                    </AnimatedSection>

                    {/* ── Search ─────────────────────────────────────────── */}
                    <AnimatedSection delay={0.08}>
                        <Paper
                            radius="md"
                            p="sm"
                            withBorder
                            style={{ borderColor: 'var(--mantine-color-default-border)' }}
                        >
                            <Group gap="sm">
                                <TextInput
                                    placeholder={t('admin.searchPlaceholder')}
                                    leftSection={<IconSearch size={15} />}
                                    value={search}
                                    onChange={(e) => setSearch(e.currentTarget.value)}
                                    radius="md"
                                    style={{ flex: 1, maxWidth: 340 }}
                                    styles={{
                                        input: {
                                            transition: 'border-color 0.18s, box-shadow 0.18s',
                                            '&:focus': { boxShadow: '0 0 0 3px rgba(29,158,117,0.12)' },
                                        },
                                    }}
                                />
                                {search && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                    >
                                        <ActionIcon
                                            variant="subtle"
                                            color="gray"
                                            radius="md"
                                            onClick={() => setSearch('')}
                                            title={t('common.clearSearch')}
                                        >
                                            <IconX size={15} />
                                        </ActionIcon>
                                    </motion.div>
                                )}
                            </Group>
                        </Paper>
                    </AnimatedSection>

                    {/* ── Table ──────────────────────────────────────────── */}
                    <AnimatedSection delay={0.14}>
                        {loading && (
                            <Center py="xl">
                                <Loader color="teal" size="sm" />
                            </Center>
                        )}

                        {error && (
                            <Alert
                                icon={<IconInfoCircle size={15} />}
                                color="red"
                                radius="md"
                                variant="light"
                            >
                                {error}
                            </Alert>
                        )}

                        {!loading && !error && (
                            <Stack gap="md">
                                <Paper
                                    radius="lg"
                                    withBorder
                                    style={{
                                        overflow: 'hidden',
                                        borderColor: 'var(--mantine-color-default-border)',
                                    }}
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
                                                    <Table.Th w={70} />
                                                    <Table.Th>{t('admin.carName')}</Table.Th>
                                                    <Table.Th>{t('admin.category')}</Table.Th>
                                                    <Table.Th>{t('admin.pricePerDay')}</Table.Th>
                                                    <Table.Th w={130}>{t('admin.featured')}</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>

                                            <Table.Tbody>
                                                {cars.length === 0 && (
                                                    <Table.Tr>
                                                        <Table.Td colSpan={6}>
                                                            <Center py="xl">
                                                                <Stack align="center" gap="xs">
                                                                    <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                                        <IconCar size={20} />
                                                                    </ThemeIcon>
                                                                    <Text size="sm" c="dimmed">
                                                                        {t('admin.noCarsFound')}
                                                                    </Text>
                                                                </Stack>
                                                            </Center>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                )}

                                                {cars.map((car, idx) => (
                                                    <motion.tr
                                                        key={car.carId}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.03, duration: 0.25, ease: 'easeOut' }}
                                                        style={{ cursor: 'default' }}
                                                    >
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed" fw={500}>
                                                                #{String((page - 1) * PAGE_SIZE + idx + 1).padStart(3, '0')}
                                                            </Text>
                                                        </Table.Td>

                                                        <Table.Td>
                                                            <Image
                                                                src={getPrimaryImageSrc(car)}
                                                                w={52}
                                                                h={36}
                                                                radius="md"
                                                                fit="cover"
                                                                fallbackSrc="/placeholder-car.png"
                                                                style={{
                                                                    border: '0.5px solid var(--mantine-color-default-border)',
                                                                }}
                                                            />
                                                        </Table.Td>

                                                        <Table.Td>
                                                            <Group gap={6} align="center">
                                                                {car.isRecommended && (
                                                                    <IconStarFilled
                                                                        size={13}
                                                                        style={{ color: 'var(--mantine-color-yellow-5)', flexShrink: 0 }}
                                                                    />
                                                                )}
                                                                <Text size="sm" fw={500}>
                                                                    {getDisplayName(car, t)}
                                                                </Text>
                                                            </Group>
                                                        </Table.Td>

                                                        <Table.Td>
                                                            <Badge color="teal" variant="light" size="sm" radius="md">
                                                                {car.categoryName ?? '—'}
                                                            </Badge>
                                                        </Table.Td>

                                                        <Table.Td>
                                                            <Group gap={2} align="baseline">
                                                                <Text size="sm" fw={500}>€{car.pricePerDay}</Text>
                                                                <Text size="xs" c="dimmed">/{t('vehicle.perDay')}</Text>
                                                            </Group>
                                                        </Table.Td>

                                                        <Table.Td>
                                                            <Tooltip
                                                                label={
                                                                    car.isRecommended
                                                                        ? t('admin.removeFromFeatured')
                                                                        : t('admin.markAsFeatured')
                                                                }
                                                                withArrow
                                                                position="top"
                                                                fz="xs"
                                                            >
                                                                <Group gap={8} align="center">
                                                                    <Switch
                                                                        checked={!!car.isRecommended}
                                                                        onChange={() => handleToggleFeatured(car)}
                                                                        color="yellow"
                                                                        size="sm"
                                                                        disabled={togglingId === car.carId}
                                                                        thumbIcon={
                                                                            car.isRecommended
                                                                                ? <IconStarFilled size={10} style={{ color: 'var(--mantine-color-yellow-6)' }} />
                                                                                : <IconStar size={10} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                                                        }
                                                                    />
                                                                    {togglingId === car.carId && (
                                                                        <Loader size={12} color="yellow" />
                                                                    )}
                                                                </Group>
                                                            </Tooltip>
                                                        </Table.Td>
                                                    </motion.tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </Table.ScrollContainer>
                                </Paper>

                                {/* ── Pagination ─────────────────────────── */}
                                {totalPages > 1 && (
                                    <Group justify="space-between" align="center" px={4}>
                                        <Text size="xs" c="dimmed">
                                            {t('admin.showing')}{' '}
                                            <Text component="span" size="xs" fw={500} c="default">
                                                {startItem}–{endItem}
                                            </Text>{' '}
                                            {t('admin.of')}{' '}
                                            <Text component="span" size="xs" fw={500} c="default">
                                                {totalCount}
                                            </Text>{' '}
                                            {t('admin.cars')}
                                        </Text>

                                        <Pagination
                                            value={page}
                                            onChange={setPage}
                                            total={totalPages}
                                            color="teal"
                                            radius="md"
                                            size="sm"
                                            withEdges
                                        />
                                    </Group>
                                )}
                            </Stack>
                        )}
                    </AnimatedSection>

                </Stack>
            </motion.div>
        </>
    );
}
