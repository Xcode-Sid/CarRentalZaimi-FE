import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Title, Stack, Box, Text, Group, Button,
    Loader, Center, Pagination, Modal, Paper,
    ThemeIcon, Badge, ActionIcon, Table, Select, Tooltip,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconRefresh, IconCar } from '@tabler/icons-react';
import { motion } from 'framer-motion';

import { PAGE_SIZE } from '../../constants/pagination';
import { get, post, put, del } from '../../utils/api.utils';
import { DatePickerInput } from '@mantine/dates';
import Spinner from '../../components/spinner/Spinner';

interface OccupiedCarDays {
    id: string;
    car: {
        id: string;
        title: string;
    }
    startDate: string;
    endDate: string;
    type: string;
}

interface FilterValues {
    carId: string;
    startDate: Date | null;
    endDate: Date | null;
}

interface FormValues {
    carId: string;
    startDate: Date | null;
    endDate: Date | null;
    type: string;
}

interface Car {
    id: string;
    title: string;
}

interface OccupiedDateEntry {
    date: Date;
    type: string;
}

const inputStyles = {
    input: {
        transition: "border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.18s",
        "&:focus": {
            transform: "translateY(-1px)",
            boxShadow: "0 0 0 3px rgba(29, 158, 117, 0.12)",
        },
    },
    label: {
        transition: "color 0.15s",
        "&:has(+ * :focus)": { color: "var(--mantine-color-teal-7)" },
    },
};

const typeColor: Record<string, string> = {
    Booking: '#ef4444',
    Maintenance: '#f59e0b',
    PrivateUse: '#3b82f6',
    Other: '#8b5cf6',
};

const typeLabel: Record<string, string> = {
    Booking: 'Booking',
    Maintenance: 'Maintenance',
    PrivateUse: 'Private Use',
    Other: 'Other',
};

export default function OccupiedCarDaysPage() {

    const [items, setItems] = useState<OccupiedCarDays[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [cars, setCars] = useState<Car[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<OccupiedCarDays | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<OccupiedCarDays | null>(null);
    const [occupiedDates, setOccupiedDates] = useState<OccupiedDateEntry[]>([]);
    const [calendarDate, setCalendarDate] = useState<Date>(new Date());

    const startItem = (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);

    const filterForm = useForm<FilterValues>({
        initialValues: { carId: '', startDate: null, endDate: null }
    });

    const modalForm = useForm<FormValues>({
        initialValues: { carId: '', startDate: null, endDate: null, type: '' }
    });

    // ───────────────── FETCH CARS ─────────────────
    useEffect(() => {
        const fetchCars = async () => {
            try {
                const carRes = await get("Cars/getAll");
                if (carRes.success) setCars(carRes.data);
            } catch (error) {
                console.error("Failed to fetch cars:", error);
            }
        };
        fetchCars();
    }, []);

    // ───────────────── FETCH OCCUPIED DATES ─────────────────
    const fetchOccupiedDates = useCallback(async (carId: string, viewDate?: Date) => {
        setLoading(true);
        if (!carId) { setOccupiedDates([]); return; }
        try {
            const base = viewDate ?? new Date();
            const startDate = new Date(base.getFullYear(), base.getMonth() - 1, 1);
            const endDate = new Date(base.getFullYear(), base.getMonth() + 2, 0);

            const params = new URLSearchParams({
                CarId: carId,
                StartDate: startDate.toISOString(),
                EndDate: endDate.toISOString(),
            });

            const res = await get(`OccupiedCarDays/get/calendarData?${params}`);
            if (res.success && res.data) {
                const dates: OccupiedDateEntry[] = [];
                for (const item of res.data) {
                    const cur = new Date(item.startDate);
                    const end = new Date(item.endDate);
                    while (cur <= end) {
                        dates.push({ date: new Date(cur), type: item.type });
                        cur.setDate(cur.getDate() + 1);
                    }
                }
                setOccupiedDates(dates);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // ───────────────── OCCUPIED DATE MAP ─────────────────
    const occupiedDateMap = useMemo(
        () => new Map(occupiedDates.map(d => [d.date.toDateString(), d.type])),
        [occupiedDates]
    );

    // ───────────────── FETCH DATA ─────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                PageNr: String(page),
                PageSize: String(PAGE_SIZE),
                CarId: filterForm.values.carId ?? '',
            });
            if (filterForm.values.startDate) params.append('StartDate', filterForm.values.startDate.toISOString());
            if (filterForm.values.endDate) params.append('EndDate', filterForm.values.endDate.toISOString());

            const res = await get(`OccupiedCarDays/car/occupied-days?${params}`);
            setItems(res.data.items ?? []);
            setTotalPages(res.data.totalPages ?? 1);
            setTotalCount(res.data.totalCount ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filterForm.values.carId, filterForm.values.startDate, filterForm.values.endDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ───────────────── CREATE / UPDATE ─────────────────
    const handleSave = async () => {
        const payload = {
            carId: modalForm.values.carId,
            startDate: modalForm.values.startDate,
            endDate: modalForm.values.endDate,
            type: modalForm.values.type,
        };
        try {
            if (editTarget) {
                await put(`OccupiedCarDays/${editTarget.id}`, { id: editTarget.id, ...payload });
            } else {
                await post(`OccupiedCarDays`, payload);
            }
            setModalOpen(false);
            setEditTarget(null);
            modalForm.reset();
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // ───────────────── DELETE ─────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await del(`OccupiedCarDays/${deleteTarget.id}`);
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    // ───────────────── MODAL HELPERS ─────────────────
    const openEdit = (item: OccupiedCarDays) => {
        setEditTarget(item);
        modalForm.setValues({
            carId: item.car.id,
            startDate: new Date(item.startDate),
            endDate: new Date(item.endDate),
            type: item.type,
        });
        const startMonth = new Date(item.startDate);
        setCalendarDate(startMonth);
        fetchOccupiedDates(item.car.id, startMonth);
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditTarget(null);
        modalForm.reset();
        setOccupiedDates([]);
        setModalOpen(true);
    };

    const carOptions = cars.map((c) => ({ value: c.id, label: c.title }));

    return (
        <>
            <Spinner visible={loading} />
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <Stack gap="lg">

                    {/* HEADER */}
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
                                <Title order={2} fw={800}>Car Busy Days</Title>
                                <Text c="dimmed" size="sm" mt={4}>
                                    Manage blocked date ranges per vehicle
                                </Text>
                            </div>
                        </Group>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            color="teal"
                            radius="md"
                            onClick={openCreate}
                        >
                            Add Block
                        </Button>
                    </Group>

                    {/* FILTERS */}
                    <Group wrap="wrap" align="end" gap="sm" mb="sm">
                        <Select
                            placeholder="Filter by Car"
                            radius="md"
                            data={carOptions}
                            clearable
                            value={filterForm.values.carId || null}
                            onChange={(val) => {
                                filterForm.setFieldValue("carId", val ?? '');
                                setPage(1);
                            }}
                            styles={inputStyles}
                            style={{ minWidth: 200 }}
                        />
                        <DatePickerInput
                            type="range"
                            placeholder="Date Range"
                            radius="md"
                            value={[filterForm.values.startDate, filterForm.values.endDate]}
                            onChange={([start, end]) => {
                                filterForm.setFieldValue('startDate', start ? new Date(start) : null);
                                filterForm.setFieldValue('endDate', end ? new Date(end) : null);
                                setPage(1);
                            }}
                        />
                        <Tooltip label="Refresh" withArrow>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                size="lg"
                                radius="md"
                                onClick={fetchData}
                                loading={loading}
                            >
                                <IconRefresh size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>

                    {/* CONTENT */}
                    {loading ? (
                        <Center py="xl">
                            <Loader color="var(--az-teal)" size="md" />
                        </Center>
                    ) : (
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
                                                <Table.Th>Car</Table.Th>
                                                <Table.Th>Start Date</Table.Th>
                                                <Table.Th>End Date</Table.Th>
                                                <Table.Th>Type</Table.Th>
                                                <Table.Th w={90}>Actions</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>

                                        <Table.Tbody>
                                            {/* Skeleton rows */}
                                            {loading && [1, 2, 3, 4].map((i) => (
                                                <Table.Tr key={i}>
                                                    {[60, 20 + i * 8, 15, 15, 10, 10].map((w, j) => (
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
                                            {!loading && items.length === 0 && (
                                                <Table.Tr>
                                                    <Table.Td colSpan={6}>
                                                        <Center py="xl">
                                                            <Stack align="center" gap="xs">
                                                                <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                                    <IconCar size={18} />
                                                                </ThemeIcon>
                                                                <Text size="sm" c="dimmed">
                                                                    No blocked days found
                                                                </Text>
                                                                <Button
                                                                    leftSection={<IconPlus size={15} />}
                                                                    color="teal"
                                                                    variant="light"
                                                                    radius="md"
                                                                    size="xs"
                                                                    mt={4}
                                                                    onClick={openCreate}
                                                                >
                                                                    Add Block
                                                                </Button>
                                                            </Stack>
                                                        </Center>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}

                                            {/* Data rows */}
                                            {!loading && items.map((x, idx) => (
                                                <motion.tr
                                                    key={x.id}
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

                                                    {/* Car */}
                                                    <Table.Td>
                                                        <Group gap={8} align="center">
                                                            <Box
                                                                style={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    borderRadius: 8,
                                                                    background: typeColor[x.type] ?? 'var(--az-teal)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                    boxShadow: `0 2px 8px ${typeColor[x.type] ?? 'var(--az-teal)'}55`,
                                                                }}
                                                            >
                                                                <IconCar size={13} color="white" />
                                                            </Box>
                                                            <Text size="sm" fw={500}>
                                                                {cars.find(c => c.id === x.car.id)?.title ?? x.car.id}
                                                            </Text>
                                                        </Group>
                                                    </Table.Td>

                                                    {/* Start Date */}
                                                    <Table.Td>
                                                        <Text size="sm" c="dimmed">
                                                            {new Date(x.startDate).toDateString()}
                                                        </Text>
                                                    </Table.Td>

                                                    {/* End Date */}
                                                    <Table.Td>
                                                        <Text size="sm" c="dimmed">
                                                            {new Date(x.endDate).toDateString()}
                                                        </Text>
                                                    </Table.Td>

                                                    {/* Type */}
                                                    <Table.Td>
                                                        <Badge
                                                            variant="light"
                                                            size="sm"
                                                            radius="md"
                                                            style={{
                                                                backgroundColor: `${typeColor[x.type] ?? '#888'}22`,
                                                                color: typeColor[x.type] ?? '#888',
                                                                border: `1px solid ${typeColor[x.type] ?? '#888'}44`,
                                                            }}
                                                        >
                                                            {typeLabel[x.type] ?? x.type}
                                                        </Badge>
                                                    </Table.Td>

                                                    {/* Actions */}
                                                    <Table.Td>
                                                        <Group gap={4}>
                                                            <Tooltip label="Edit" withArrow fz="xs">
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="yellow"
                                                                    size="sm"
                                                                    radius="md"
                                                                    onClick={() => openEdit(x)}
                                                                >
                                                                    <IconEdit size={15} />
                                                                </ActionIcon>
                                                            </Tooltip>
                                                            <Tooltip label="Delete" withArrow fz="xs">
                                                                <ActionIcon
                                                                    variant="subtle"
                                                                    color="red"
                                                                    size="sm"
                                                                    radius="md"
                                                                    onClick={() => setDeleteTarget(x)}
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

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <Group justify="space-between" align="center" px={4}>
                                    <Text size="xs" c="dimmed">
                                        Showing{' '}
                                        <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                                        {' '}of{' '}
                                        <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                                        {' '}records
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
                    )}

                </Stack>

                {/* CREATE / EDIT MODAL */}
                <Modal
                    opened={modalOpen}
                    onClose={() => {
                        setModalOpen(false);
                        setEditTarget(null);
                        modalForm.reset();
                        setOccupiedDates([]);
                    }}
                    title={
                        <Group gap={10}>
                            <ThemeIcon color="teal" variant="light" size={32} radius="md">
                                {editTarget ? <IconEdit size={16} /> : <IconPlus size={16} />}
                            </ThemeIcon>
                            <Text fw={500} size="md">
                                {editTarget ? 'Edit Blocked Days' : 'Add Blocked Days'}
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
                        <Select
                            label="Car"
                            radius="md"
                            data={carOptions}
                            value={modalForm.values.carId || null}
                            onChange={(val) => {
                                modalForm.setFieldValue("carId", val ?? '');
                                fetchOccupiedDates(val ?? '', calendarDate);
                            }}
                            styles={inputStyles}
                            required
                        />

                        <DatePickerInput
                            type="range"
                            label="Date Range"
                            minDate={new Date()}
                            value={[modalForm.values.startDate, modalForm.values.endDate]}
                            onChange={([start, end]) => {
                                modalForm.setFieldValue('startDate', start ? new Date(start) : null);
                                modalForm.setFieldValue('endDate', end ? new Date(end) : null);
                            }}
                            date={calendarDate}
                            onDateChange={(date) => {
                                const dateObj = new Date(date);
                                setCalendarDate(dateObj);
                                fetchOccupiedDates(modalForm.values.carId, dateObj);
                            }}
                            getDayProps={(date) => {
                                const dateObj = new Date(date);
                                if (editTarget) {
                                    const ownStart = new Date(editTarget.startDate);
                                    const ownEnd = new Date(editTarget.endDate);
                                    if (dateObj >= ownStart && dateObj <= ownEnd) return {};
                                }
                                const type = occupiedDateMap.get(dateObj.toDateString());
                                if (!type) return {};
                                const color = typeColor[type] ?? '#888';
                                return {
                                    disabled: true,
                                    style: { backgroundColor: color, color: '#fff', opacity: 0.8, borderRadius: '4px' },
                                };
                            }}
                            required
                        />

                        {/* LEGEND */}
                        <Group gap="sm" mt={-8}>
                            {Object.entries(typeLabel).map(([type, label]) => (
                                <Group key={type} gap={4}>
                                    <Box w={12} h={12} style={{ borderRadius: 3, backgroundColor: typeColor[type] }} />
                                    <Text size="xs" c="dimmed">{label}</Text>
                                </Group>
                            ))}
                        </Group>

                        <Select
                            label="Type"
                            radius="md"
                            data={[
                                { value: 'Booking', label: 'Booking' },
                                { value: 'Maintenance', label: 'Maintenance' },
                                { value: 'PrivateUse', label: 'Private Use' },
                                { value: 'Other', label: 'Other' },
                            ]}
                            styles={inputStyles}
                            {...modalForm.getInputProps('type')}
                            required
                        />

                        <Button
                            variant="filled"
                            color="teal"
                            fullWidth
                            radius="md"
                            size="md"
                            leftSection={editTarget ? <IconEdit size={16} /> : <IconPlus size={16} />}
                            onClick={handleSave}
                        >
                            {editTarget ? 'Update' : 'Save'}
                        </Button>
                    </Stack>
                </Modal>

                {/* DELETE MODAL */}
                <Modal
                    opened={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    title={
                        <Group gap={10}>
                            <ThemeIcon color="red" variant="light" size={32} radius="md">
                                <IconTrash size={16} />
                            </ThemeIcon>
                            <Text fw={500} size="md">Delete Blocked Days</Text>
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
                                        background: typeColor[deleteTarget.type] ?? 'var(--az-teal)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}
                                >
                                    <IconCar size={20} color="white" />
                                </Box>
                                <div>
                                    <Text fw={600} size="sm">{deleteTarget.car.title}</Text>
                                    <Text c="dimmed" size="xs" lineClamp={1}>
                                        {new Date(deleteTarget.startDate).toDateString()} — {new Date(deleteTarget.endDate).toDateString()}
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
                                <Text size="sm" ta="center" fw={500} c="red.8">
                                    Are you sure you want to delete this record?
                                </Text>
                                <Text size="xs" ta="center" c="dimmed">
                                    This action cannot be undone.
                                </Text>
                            </Stack>
                        </Paper>

                        <Group w="100%" gap="sm">
                            <Button variant="default" flex={1} radius="md" onClick={() => setDeleteTarget(null)}>
                                Cancel
                            </Button>
                            <Button color="red" flex={1} radius="md" leftSection={<IconTrash size={15} />} onClick={handleDelete}>
                                Delete
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

            </motion.div>
        </>
    );
}