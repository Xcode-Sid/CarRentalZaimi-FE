import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Title, Stack, Box, Text, Group, Button,
    Loader, Center, Pagination, Modal,
    Badge, ActionIcon, Table, Select
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';
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
    Booking: '#ef4444',  // red
    Maintenance: '#f59e0b',  // amber
    PrivateUse: '#3b82f6',  // blue
    Other: '#8b5cf6',  // purple
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

    // ── Separate form for filters ──
    const filterForm = useForm<FilterValues>({
        initialValues: {
            carId: '',
            startDate: null,
            endDate: null,
        }
    });

    // ── Separate form for create/edit modal ──
    const modalForm = useForm<FormValues>({
        initialValues: {
            carId: '',
            startDate: null,
            endDate: null,
            type: ''
        }
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
        setLoading(true)
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
        }finally{
            setLoading(false)
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

            if (filterForm.values.startDate) {
                params.append('StartDate', filterForm.values.startDate.toISOString());
            }
            if (filterForm.values.endDate) {
                params.append('EndDate', filterForm.values.endDate.toISOString());
            }

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
            type: modalForm.values.type
        };

        try {
            if (editTarget) {
                await put(`OccupiedCarDays/${editTarget.id}`, {
                    id: editTarget.id,
                    ...payload
                });
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
            type: item.type
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

    const carOptions = cars.map((c) => ({
        value: c.id,
        label: c.title
    }));

    return (
       <>
       <Spinner visible={loading} />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Stack gap="lg">

                {/* HEADER */}
                <Group justify="space-between">
                    <Title order={2}>Car Busy Days</Title>
                    <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
                        Add Block
                    </Button>
                </Group>

                {/* FILTER */}
                <Group>
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
                    />

                    <DatePickerInput
                        type="range"
                        placeholder="Date Range"
                        value={[filterForm.values.startDate, filterForm.values.endDate]}
                        onChange={([start, end]) => {
                            filterForm.setFieldValue('startDate', start ? new Date(start) : null);
                            filterForm.setFieldValue('endDate', end ? new Date(end) : null);
                            setPage(1);
                        }}
                    />

                    <Button variant="light" onClick={fetchData} leftSection={<IconRefresh size={14} />}>
                        Refresh
                    </Button>
                </Group>

                {/* TABLE */}
                {loading ? (
                    <Center><Loader /></Center>
                ) : (
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Car</Table.Th>
                                <Table.Th>Start</Table.Th>
                                <Table.Th>End</Table.Th>
                                <Table.Th>Type</Table.Th>
                                <Table.Th>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {items.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Center py="md">
                                            <Text c="dimmed">No records found.</Text>
                                        </Center>
                                    </Table.Td>
                                </Table.Tr>
                            ) : items.map((x) => (
                                <Table.Tr key={x.id}>
                                    <Table.Td>
                                        {cars.find(c => c.id === x.car.id)?.title ?? x.car.id}
                                    </Table.Td>
                                    <Table.Td>{new Date(x.startDate).toDateString()}</Table.Td>
                                    <Table.Td>{new Date(x.endDate).toDateString()}</Table.Td>
                                    <Table.Td>
                                        <Badge color={typeColor[x.type] ? undefined : 'gray'}
                                            style={{ backgroundColor: typeColor[x.type] ?? '#888', color: '#fff' }}>
                                            {typeLabel[x.type] ?? x.type}
                                        </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        <Group gap={6}>
                                            <ActionIcon onClick={() => openEdit(x)}>
                                                <IconEdit size={14} />
                                            </ActionIcon>
                                            <ActionIcon color="red" onClick={() => setDeleteTarget(x)}>
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}

                {/* PAGINATION */}
                <Group justify="space-between">
                    <Text size="sm" c="dimmed">Total: {totalCount}</Text>
                    <Pagination value={page} onChange={setPage} total={totalPages} />
                </Group>

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
                title={editTarget ? "Edit Blocked Days" : "Add Blocked Days"}
            >
                <Stack>
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

                            // When editing, don't color the item's own dates
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
                                style: {
                                    backgroundColor: color,
                                    color: '#fff',
                                    opacity: 0.8,
                                    borderRadius: '4px',
                                },
                            };
                        }}
                        required
                    />

                    {/* LEGEND */}
                    <Group gap="sm" mt={-8}>
                        {Object.entries(typeLabel).map(([type, label]) => (
                            <Group key={type} gap={4}>
                                <Box
                                    w={12} h={12}
                                    style={{ borderRadius: 3, backgroundColor: typeColor[type] }}
                                />
                                <Text size="xs" c="dimmed">{label}</Text>
                            </Group>
                        ))}
                    </Group>

                    <Select
                        label="Type"
                        data={[
                            { value: 'Booking', label: 'Booking' },
                            { value: 'Maintenance', label: 'Maintenance' },
                            { value: 'PrivateUse', label: 'Private Use' },
                            { value: 'Other', label: 'Other' },
                        ]}
                        {...modalForm.getInputProps('type')}
                        required
                    />

                    <Button onClick={handleSave}>
                        {editTarget ? 'Update' : 'Save'}
                    </Button>
                </Stack>
            </Modal>

            {/* DELETE MODAL */}
            <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Delete">
                <Text>Are you sure you want to delete this record?</Text>
                <Group justify="end" mt="md">
                    <Button variant="default" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                    <Button color="red" onClick={handleDelete}>Delete</Button>
                </Group>
            </Modal>

        </motion.div>
       </>
    );
}