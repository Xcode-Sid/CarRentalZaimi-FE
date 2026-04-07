import { useState, useEffect, useCallback } from "react";
import {
    Title,
    TextInput,
    Textarea,
    Select,
    Button,
    Table,
    Badge,
    Group,
    ActionIcon,
    Stack,
    Modal,
    Tabs,
    Text,
    Box,
    Paper,
    ThemeIcon,
    Tooltip,
    Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import { IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { get, post, put, del } from "../../../utils/api.utils";
import Spinner from "../../../components/spinner/Spinner";
import type { CarCategory, CarCompanyModel, CarCompanyName, GeneralData } from "../../../data/vehicles";
import { useForm } from "@mantine/form";


// ─── Types ────────────────────────────────────────────────────────────────────


type TabKey =
    | "categories"
    | "companyNames"
    | "companyModels"
    | "exteriorColors"
    | "fuels"
    | "interiorColors"
    | "transmissions";

// ─── API Config ───────────────────────────────────────────────────────────────

const ENDPOINTS: Record<TabKey, string> = {
    categories: "CarCategory",
    companyNames: "CarCompanyName",
    companyModels: "CarCompanyModel",
    exteriorColors: "CarExteriorColor",
    fuels: "CarFuel",
    interiorColors: "CarInteriorColor",
    transmissions: "CarTransmission",
};

// ─── Tab Config ───────────────────────────────────────────────────────────────

// Labels are now translation keys — resolved inside the component via t()
const TABS: { key: TabKey; labelKey: string; color: string }[] = [
    { key: "categories", labelKey: "carData.tabs.categories", color: "teal" },
    { key: "companyNames", labelKey: "carData.tabs.companyNames", color: "blue" },
    { key: "companyModels", labelKey: "carData.tabs.companyModels", color: "violet" },
    { key: "exteriorColors", labelKey: "carData.tabs.exteriorColors", color: "orange" },
    { key: "fuels", labelKey: "carData.tabs.fuels", color: "pink" },
    { key: "interiorColors", labelKey: "carData.tabs.interiorColors", color: "yellow" },
    { key: "transmissions", labelKey: "carData.tabs.transmissions", color: "teal" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (item: any): string => {
    const iso = item.createdAt ?? item.createdOn;
    if (!iso) return "\u2014";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "\u2014" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const resolveBrandName = (val: any): string => {
    if (!val) return "\u2014";
    if (typeof val === "string") return val;
    if (typeof val === "object" && val.name) return val.name;
    return "\u2014";
};

// ─── API Helpers ──────────────────────────────────────────────────────────────

const normalizeArray = <T,>(raw: any): T[] => {
    if (Array.isArray(raw)) return raw;
    if (raw && Array.isArray(raw.$values)) return raw.$values;
    return [];
};

const getAll = async <T,>(endpoint: string): Promise<T[]> => {
    const res = await get<any>(`${endpoint}/getAll`);
    return normalizeArray<T>(res.data);
};

const createItem = async <T,>(endpoint: string, body: Record<string, any>): Promise<T> => {
    const res = await post(endpoint, body);
    return res.data as T;
};

const updateItem = async <T,>(endpoint: string, id: string, body: Record<string, any>): Promise<T> => {
    const res = await put(`${endpoint}/${id}`, body);
    return res.data as T;
};

const deleteItem = async (endpoint: string, id: string): Promise<void> => {
    await del(`${endpoint}/${id}`);
};


const inputStyles = {
    input: {
        transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.18s',
        '&:focus': {
            transform: 'translateY(-1px)',
            boxShadow: '0 0 0 3px rgba(29, 158, 117, 0.12)',
        },
    },
    label: {
        transition: 'color 0.15s',
        '&:has(+ * :focus)': { color: 'var(--mantine-color-teal-7)' },
    },
};


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCarDataPage() {
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab] = useState<TabKey>("categories");

    const [data, setData] = useState<Record<TabKey, any[]>>({
        categories: [],
        companyNames: [],
        companyModels: [],
        exteriorColors: [],
        fuels: [],
        interiorColors: [],
        transmissions: [],
    });

    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<GeneralData | null>(null);
    const [editTarget, setEditTarget] = useState<any>(null);

    const [search, setSearch] = useState("");

    // Resolve translated label for active tab
    const tab = TABS.find((t) => t.key === activeTab)!;
    const tabLabel = t(tab.labelKey);

    // Singular form: strip trailing "s" from translated label
    const tabSingular = tabLabel.replace(/s$/i, "");

    // ─── Fetch ────────────────────────────────────────────────────────────────────

    const fetchTab = useCallback(async (tabKey: TabKey) => {
        setLoading(true);
        try {
            const result = await getAll<any>(ENDPOINTS[tabKey]);
            setData((prev) => ({ ...prev, [tabKey]: result ?? [] }));
        } catch {
            notifications.show({ message: t("carData.loadFailed"), color: "red" });
        } finally {
            setLoading(false);
        }
    }, [t]);

    const form = useForm({
        initialValues: {
            name: "",
            description: "",
            companyId: "",
        },
        validate: {
            name: (v) =>
                !v.trim()
                    ? t("validation.required")
                    : null,

            companyId: (v) =>
                activeTab === "companyModels" && !v
                    ? t("validation.required")
                    : null,
        },
    });

    useEffect(() => {
        if (Object.keys(form.errors).length > 0) {
            form.validate();
        }
    }, [i18n.language]);

    useEffect(() => {
        fetchTab(activeTab);
    }, [activeTab, fetchTab]);

    useEffect(() => {
        if (activeTab === "companyModels" && data.companyNames.length === 0) {
            getAll<CarCompanyName>(ENDPOINTS.companyNames).then((res) =>
                setData((prev) => ({ ...prev, companyNames: res ?? [] }))
            );
        }
    }, [activeTab]);

    // ─── Modal helpers ────────────────────────────────────────────────────────────

    const openCreate = () => {
        setEditTarget(null);
        form.setValues({
            name: "",
            description: "",
            companyId: data.companyNames[0]?.id || "",
        });
        setModalOpen(true);
    };

    const openEdit = (item: any) => {
        setEditTarget(item);

        const brandId =
            typeof item.carCompanyNameId === "string"
                ? item.carCompanyNameId
                : item.carCompanyName?.id ?? data.companyNames[0]?.id ?? "";

        form.setValues({
            name: item.name,
            description: item.description || "",
            companyId: brandId,
        });

        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditTarget(null);
    };

    // ─── Save ─────────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        const result = form.validate();
        if (result.hasErrors) return;

        const { name, description, companyId } = form.values;

        setLoading(true);
        const endpoint = ENDPOINTS[activeTab];
        const isEdit = !!editTarget;

        try {
            if (activeTab === "categories") {
                const body = { name, description };

                if (!isEdit) {
                    const created = await createItem<CarCategory>(endpoint, body);
                    setData((p) => ({ ...p, categories: [created, ...p.categories] }));
                } else {
                    const updated = await updateItem<CarCategory>(
                        endpoint,
                        editTarget.id,
                        { id: editTarget.id, ...body }
                    );
                    setData((p) => ({
                        ...p,
                        categories: p.categories.map((x) =>
                            x.id === editTarget.id ? updated : x
                        ),
                    }));
                }
            }

            else if (activeTab === "companyNames") {
                const body = { name };

                if (!isEdit) {
                    const created = await createItem<CarCompanyName>(endpoint, body);
                    setData((p) => ({ ...p, companyNames: [created, ...p.companyNames] }));
                } else {
                    const updated = await updateItem<CarCompanyName>(
                        endpoint,
                        editTarget.id,
                        { id: editTarget.id, ...body }
                    );
                    setData((p) => ({
                        ...p,
                        companyNames: p.companyNames.map((x) =>
                            x.id === editTarget.id ? updated : x
                        ),
                    }));
                }
            }

            else if (activeTab === "companyModels") {
                const brandName =
                    data.companyNames.find((c) => c.id === companyId)?.name || "";

                const body = {
                    name,
                    companyNameId: companyId,
                };

                if (!isEdit) {
                    const created = await createItem<CarCompanyModel>(endpoint, body);
                    setData((p) => ({
                        ...p,
                        companyModels: [
                            { ...created, carCompanyName: brandName },
                            ...p.companyModels,
                        ],
                    }));
                } else {
                    const updated = await updateItem<CarCompanyModel>(
                        endpoint,
                        editTarget.id,
                        { id: editTarget.id, ...body }
                    );
                    setData((p) => ({
                        ...p,
                        companyModels: p.companyModels.map((x) =>
                            x.id === editTarget.id
                                ? { ...updated, carCompanyName: brandName }
                                : x
                        ),
                    }));
                }
            }

            else {
                const body = { name };

                if (!isEdit) {
                    const created = await createItem<GeneralData>(endpoint, body);
                    setData((p) => ({
                        ...p,
                        [activeTab]: [created, ...p[activeTab]],
                    }));
                } else {
                    const updated = await updateItem<GeneralData>(
                        endpoint,
                        editTarget.id,
                        { id: editTarget.id, ...body }
                    );
                    setData((p) => ({
                        ...p,
                        [activeTab]: p[activeTab].map((x) =>
                            x.id === editTarget.id ? updated : x
                        ),
                    }));
                }
            }

            notifications.show({
                title: t("success"),
                message: isEdit ? t("carData.updated") : t("carData.created"),
                color: "teal",
            });

            closeModal();
        } catch {
            notifications.show({
                message: t("carData.saveFailed"),
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setLoading(true);
        try {
            await deleteItem(ENDPOINTS[activeTab], deleteTarget.id);
            setData((p) => ({ ...p, [activeTab]: p[activeTab].filter((x) => x.id !== deleteTarget.id) }));
            notifications.show({title: t("success"), message: t("carData.deleted"), color: "green" });
            setDeleteTarget(null);
        } catch (e: any) {
            notifications.show({
                title: t("error"),
                message: e?.message || t("carData.deleteFailed"),
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    // ─── Derived ──────────────────────────────────────────────────────────────────

    const filtered = (data[activeTab] ?? []).filter((x) =>
        x.name?.toLowerCase().includes(search.toLowerCase())
    );

    // ─── Render ───────────────────────────────────────────────────────────────────

// CarDataPage — redesigned return block
// Drop-in replacement for your existing return statement.
// All existing props, state, handlers, and helpers remain unchanged.

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
                <Group justify="space-between" align="center">
                    <Stack gap={2}>
                        <Title order={2} fw={500} style={{ letterSpacing: '-0.01em' }}>
                            {t('carData.title')}
                        </Title>
                        <Text size="sm" c="dimmed">
                            {t('carData.subtitle')}
                        </Text>
                    </Stack>

                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Button
                            leftSection={<IconPlus size={15} />}
                            variant="filled"
                            color="teal"
                            radius="md"
                            size="sm"
                            onClick={openCreate}
                            styles={{
                                root: {
                                    transition: 'box-shadow 0.15s',
                                    '&:hover': { boxShadow: '0 4px 14px rgba(15,110,86,0.25)' },
                                },
                            }}
                        >
                            {t('carData.add', { label: tabSingular })}
                        </Button>
                    </motion.div>
                </Group>

                {/* ── Tabs ───────────────────────────────────────────── */}
                <Paper
                    radius="md"
                    withBorder
                    p="xs"
                    style={{ borderColor: 'var(--mantine-color-default-border)' }}
                >
                    <Tabs
                        value={activeTab}
                        onChange={(val) => {
                            setActiveTab(val as TabKey);
                            setSearch('');
                        }}
                        styles={{
                            list: { border: 'none', gap: 4 },
                            tab: {
                                borderRadius: 'var(--mantine-radius-md)',
                                border: 'none',
                                fontWeight: 500,
                                fontSize: 13,
                                transition: 'background 0.15s',
                                '&[data-active]': {
                                    background: 'var(--mantine-color-teal-light)',
                                },
                            },
                        }}
                    >
                        <Tabs.List>
                            {TABS.map((tabItem) => (
                                <Tabs.Tab key={tabItem.key} value={tabItem.key} color={tabItem.color}>
                                    {t(tabItem.labelKey)}
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>
                    </Tabs>
                </Paper>

                {/* ── Search + Count ─────────────────────────────────── */}
                <Group gap="sm">
                    <TextInput
                        placeholder={t('carData.searchPlaceholder', { label: tabLabel.toLowerCase() })}
                        leftSection={<IconSearch size={15} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        radius="md"
                        style={{ flex: 1, maxWidth: 320 }}
                        styles={{
                            input: {
                                transition: 'border-color 0.18s, box-shadow 0.18s',
                                '&:focus': { boxShadow: '0 0 0 3px rgba(29,158,117,0.12)' },
                            },
                        }}
                    />
                    {search && (
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                                radius="md"
                                onClick={() => setSearch('')}
                                title="Clear search"
                            >
                                <IconX size={15} />
                            </ActionIcon>
                        </motion.div>
                    )}
                    <Badge
                        color={tab.color}
                        variant="light"
                        size="lg"
                        radius="md"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {loading ? '…' : filtered.length} {tabLabel}
                    </Badge>
                </Group>

                {/* ── Table ──────────────────────────────────────────── */}
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
                                    <Table.Th>{t('carData.colName')}</Table.Th>
                                    {activeTab === 'categories' && <Table.Th>{t('carData.colDescription')}</Table.Th>}
                                    {activeTab === 'companyModels' && <Table.Th>{t('carData.colBrand')}</Table.Th>}
                                    <Table.Th>{t('carData.colCreated')}</Table.Th>
                                    <Table.Th w={90}>{t('carData.colActions')}</Table.Th>
                                </Table.Tr>
                            </Table.Thead>

                            <Table.Tbody>
                                {/* Skeleton rows while loading */}
                                {loading &&
                                    [1, 2, 3, 4].map((i) => (
                                        <Table.Tr key={i}>
                                            {[60, 30 + i * 12, 20, 15].map((w, j) => (
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
                                {!loading && filtered.length === 0 && (
                                    <Table.Tr>
                                        <Table.Td colSpan={6}>
                                            <Center py="xl">
                                                <Stack align="center" gap="xs">
                                                    <ThemeIcon size={40} radius="xl" color={tab.color} variant="light">
                                                        <IconSearch size={18} />
                                                    </ThemeIcon>
                                                    <Text size="sm" c="dimmed">
                                                        {search
                                                            ? t('carData.noResultsSearch')
                                                            : t('carData.noResultsEmpty')}
                                                    </Text>
                                                </Stack>
                                            </Center>
                                        </Table.Td>
                                    </Table.Tr>
                                )}

                                {/* Data rows */}
                                {!loading &&
                                    filtered.map((item, idx) => (
                                        <motion.tr
                                            key={item.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03, duration: 0.25, ease: 'easeOut' }}
                                        >
                                            <Table.Td>
                                                <Text size="xs" c="dimmed" fw={500}>
                                                    #{String(idx + 1).padStart(3, '0')}
                                                </Text>
                                            </Table.Td>

                                            <Table.Td>
                                                <Text size="sm" fw={500}>{item.name}</Text>
                                            </Table.Td>

                                            {activeTab === 'categories' && (
                                                <Table.Td>
                                                    <Text size="sm" c="dimmed" lineClamp={1}>
                                                        {item.description || '—'}
                                                    </Text>
                                                </Table.Td>
                                            )}

                                            {activeTab === 'companyModels' && (
                                                <Table.Td>
                                                    <Badge color="blue" variant="light" size="sm" radius="md">
                                                        {resolveBrandName(item.carCompanyName)}
                                                    </Badge>
                                                </Table.Td>
                                            )}

                                            <Table.Td>
                                                <Text size="xs" c="dimmed">{fmtDate(item)}</Text>
                                            </Table.Td>

                                            <Table.Td>
                                                <Group gap={4}>
                                                    <Tooltip label={t('edit')} withArrow fz="xs">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            size="sm"
                                                            radius="md"
                                                            onClick={() => openEdit(item)}
                                                        >
                                                            <IconEdit size={15} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                    <Tooltip label={t('delete')} withArrow fz="xs">
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="red"
                                                            size="sm"
                                                            radius="md"
                                                            onClick={() => setDeleteTarget(item)}
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

                {/* ── Create / Edit Modal ────────────────────────────── */}
                <Modal
                    opened={modalOpen}
                    onClose={closeModal}
                    title={
                        <Group gap={10}>
                            <ThemeIcon color="teal" variant="light" size={32} radius="md">
                                {editTarget ? <IconEdit size={16} /> : <IconPlus size={16} />}
                            </ThemeIcon>
                            <Text fw={500} size="md">
                                {editTarget
                                    ? t('carData.editTitle', { label: tabSingular })
                                    : t('carData.addTitle', { label: tabSingular })}
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
                            label={t('carData.fieldName')}
                            placeholder={t('carData.fieldNamePlaceholder', { label: tabSingular.toLowerCase() })}
                            required
                            radius="md"
                            {...form.getInputProps('name')}
                                       styles={inputStyles}
                        />

                        {activeTab === 'categories' && (
                            <Textarea
                                label={t('carData.fieldDescription')}
                                placeholder={t('carData.fieldDescriptionPlaceholder')}
                                minRows={3}
                                radius="md"
                                {...form.getInputProps('description')}
                                           styles={inputStyles}
                            />
                        )}

                        {activeTab === 'companyModels' && (
                            <Select
                                label={t('carData.fieldBrand')}
                                required
                                radius="md"
                                data={data.companyNames.map((c) => ({ value: c.id, label: c.name }))}
                                {...form.getInputProps('companyId')}
                                          styles={inputStyles}
                            />
                        )}

                        <Button
                            variant="filled"
                            color="teal"
                            fullWidth
                            radius="md"
                            size="md"
                            loading={loading}
                            leftSection={editTarget ? <IconDeviceFloppy size={16} /> : <IconPlus size={16} />}
                            onClick={handleSave}
                            styles={{
                                root: {
                                    transition: 'transform 0.12s, box-shadow 0.15s',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 14px rgba(15,110,86,0.25)',
                                    },
                                    '&:active': { transform: 'scale(0.99)' },
                                },
                            }}
                        >
                            {editTarget ? t('carData.saveChanges') : t('carData.createEntry')}
                        </Button>
                    </Stack>
                </Modal>

                {/* ── Delete Confirm Modal ───────────────────────────── */}
                <Modal
                    opened={!!deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    title={
                        <Group gap={10}>
                            <ThemeIcon color="red" variant="light" size={32} radius="md">
                                <IconTrash size={16} />
                            </ThemeIcon>
                            <Text fw={500} size="md">{t('carData.deleteTitle')}</Text>
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
                                    {t('carData.deleteUndone')}
                                </Text>
                            </Stack>
                        </Paper>

                        <Group w="100%" gap="sm">
                            <Button
                                variant="default"
                                flex={1}
                                radius="md"
                                onClick={() => setDeleteTarget(null)}
                                disabled={loading}
                            >
                                {t('cancel')}
                            </Button>
                            <Button
                                color="red"
                                flex={1}
                                radius="md"
                                loading={loading}
                                leftSection={<IconTrash size={15} />}
                                onClick={handleDelete}
                            >
                                {t('delete')}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

            </Stack>
        </motion.div>

        {/* Skeleton pulse keyframe */}
        <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.2} }`}</style>
    </>
);

}