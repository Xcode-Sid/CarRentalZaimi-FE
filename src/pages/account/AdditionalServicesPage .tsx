import { useState, useEffect, useCallback } from "react";
import {
    Title,
    TextInput,
    NumberInput,
    Switch,
    Button,
    Table,
    Badge,
    Group,
    ActionIcon,
    Stack,
    Modal,
    Text,
    Box,
    Paper,
    ThemeIcon,
    Tooltip,
    Center,
    Select,
    Pagination,
    Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import {
    IconSearch,
    IconPlus,
    IconEdit,
    IconTrash,
    IconDeviceFloppy,
    IconX,
    IconCheck,
    IconBan,
    IconMoodSmile,
    IconRefresh,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { useForm } from "@mantine/form";
import { PAGE_SIZE } from "../../constants/pagination";
import { del, get, post, put } from "../../utils/api.utils";
import Spinner from "../../components/spinner/Spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdditionalService {
    id: string;
    name: string;
    icon: string | null;
    pricePerDay: number;
    isActive: boolean;
}

// ─── Input styles ─────────────────────────────────────────────────────────────

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

const SERVICE_ICONS: { value: string; label: string }[] = [
    { value: "🛰️", label: "GPS / Satellite" },
    { value: "🪑", label: "Baby Seat" },
    { value: "🐾", label: "Pet Friendly" },
    { value: "🛡️", label: "Insurance" },
    { value: "⛽", label: "Fuel Package" },
    { value: "🅿️", label: "Parking" },
    { value: "🚗", label: "Delivery" },
    { value: "🧹", label: "Cleaning" },
    { value: "📱", label: "Mobile Wi-Fi" },
    { value: "🔑", label: "Extra Key" },
    { value: "❄️", label: "AC / Climate" },
    { value: "🎿", label: "Ski Rack" },
    { value: "🔧", label: "Roadside Assist" },
    { value: "📷", label: "Dashcam" },
    { value: "🎵", label: "Sound System" },
];


// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminAdditionalServicesPage() {
    const { t } = useTranslation();

    const [services, setServices] = useState<AdditionalService[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<AdditionalService | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<AdditionalService | null>(null);

    const form = useForm({
        initialValues: {
            name: "",
            icon: "",
            pricePerDay: 1,
            isActive: true,
        },
        validate: {
            name: (v) => (!v.trim() ? t("validation.required") : null),
            pricePerDay: (v) => (v <= 0 ? t("validation.mustBePositive") : null),
        },
    });

    // ─── Debounce search ──────────────────────────────────────────────────────

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => { setPage(1); }, [debouncedSearch]);

    // ─── Fetch (paginated) ────────────────────────────────────────────────────

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                PageNr: String(page),
                PageSize: String(PAGE_SIZE),
            });
            if (debouncedSearch.trim()) params.set("Search", debouncedSearch.trim());

            const response = await get(`AdditionalService/getAllPaged?${params.toString()}`);
            if (response.success) {
                setServices(response.data?.items ?? []);
                setTotalPages(response.data?.totalPages ?? 1);
                setTotalCount(response.data?.totalCount ?? 0);
            }
        } catch (error) {
            console.error("Failed to fetch additional services:", error);
            notifications.show({ message: t("additionalServices.loadFailed"), color: "red" });
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    // ─── Pagination derived ───────────────────────────────────────────────────

    const startItem = (page - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(page * PAGE_SIZE, totalCount);

    // ─── Modal helpers ────────────────────────────────────────────────────────

    const openCreate = () => {
        setEditTarget(null);
        form.setValues({ name: "", icon: "", pricePerDay: 1, isActive: true });
        form.clearErrors();
        setModalOpen(true);
    };

    const openEdit = (item: AdditionalService) => {
        setEditTarget(item);
        form.setValues({
            name: item.name,
            icon: item.icon ?? "",
            pricePerDay: item.pricePerDay,
            isActive: item.isActive,
        });
        form.clearErrors();
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditTarget(null);
    };

    // ─── Save ─────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        const result = form.validate();
        if (result.hasErrors) return;

        const { name, icon, pricePerDay, isActive } = form.values;

        setActionLoading(true);
        try {
            if (!editTarget) {
                const response = await post("AdditionalService", {
                    name,
                    icon: icon || null,
                    pricePerDay,
                    isActive,
                });
                if (!response.success) throw new Error(response.message ?? undefined);
            } else {
                const response = await put(`AdditionalService/${editTarget.id}`, {
                    id: editTarget.id,
                    name,
                    icon: icon || null,
                    pricePerDay,
                    isActive,
                });
                if (!response.success) throw new Error(response.message ?? undefined);
            }

            notifications.show({
                title: t("success"),
                message: editTarget ? t("additionalServices.updated") : t("additionalServices.created"),
                color: "teal",
            });

            closeModal();
            fetchServices();
        } catch (error) {
            console.error("Failed to save additional service:", error);
            notifications.show({ message: t("additionalServices.saveFailed"), color: "red" });
        } finally {
            setActionLoading(false);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setActionLoading(true);
        try {
            const response = await del(`AdditionalService/${deleteTarget.id}`);
            if (response.success) {
                notifications.show({
                    title: t("success"),
                    message: t("additionalServices.deleted"),
                    color: "green",
                });
                setDeleteTarget(null);
                if (services.length === 1 && page > 1) {
                    setPage((p) => p - 1);
                } else {
                    fetchServices();
                }
            }
        } catch (error) {
            console.error("Failed to delete additional service:", error);
            notifications.show({ title: t("error"), message: t("additionalServices.deleteFailed"), color: "red" });
        } finally {
            setActionLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <>
            <Spinner visible={actionLoading} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <Stack gap="xl">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <Group justify="space-between" align="center">
                        <Stack gap={2}>
                            <Title order={2} fw={500} style={{ letterSpacing: "-0.01em" }}>
                                {t("additionalServices.aditionalServices")}
                            </Title>
                            <Text size="sm" c="dimmed">
                                {t("additionalServices.subtitle")}
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
                            >
                                {t("additionalServices.add")}
                            </Button>
                        </motion.div>
                    </Group>

                    {/* ── Search + Refresh + Count ───────────────────────── */}
                    <Group gap="sm">
                        <TextInput
                            placeholder={t("additionalServices.searchPlaceholder")}
                            leftSection={<IconSearch size={15} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                            radius="md"
                            style={{ flex: 1, maxWidth: 320 }}
                            styles={{
                                input: {
                                    transition: "border-color 0.18s, box-shadow 0.18s",
                                    "&:focus": { boxShadow: "0 0 0 3px rgba(29,158,117,0.12)" },
                                },
                            }}
                        />
                        {search && (
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    radius="md"
                                    onClick={() => setSearch("")}
                                    title="Clear search"
                                >
                                    <IconX size={15} />
                                </ActionIcon>
                            </motion.div>
                        )}
                        <Tooltip label={t("refresh")} withArrow>
                            <ActionIcon
                                variant="light"
                                color="teal"
                                size="lg"
                                radius="md"
                                onClick={fetchServices}
                                loading={loading}
                            >
                                <IconRefresh size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Badge
                            color="teal"
                            variant="light"
                            size="lg"
                            radius="md"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {loading ? "…" : totalCount}{" "}
                            {t("admin.aditionalServices")}
                        </Badge>
                    </Group>

                    {/* ── Table ──────────────────────────────────────────── */}
                    {loading ? (
                        <Center py="xl">
                            <Loader color="teal" size="md" />
                        </Center>
                    ) : (
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
                                                <Table.Th>{t("additionalServices.colName")}</Table.Th>
                                                <Table.Th>{t("additionalServices.colPrice")}</Table.Th>
                                                <Table.Th>{t("additionalServices.colStatus")}</Table.Th>
                                                <Table.Th w={90}>{t("carData.colActions")}</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>

                                        <Table.Tbody>
                                            {/* Empty state */}
                                            {services.length === 0 && (
                                                <Table.Tr>
                                                    <Table.Td colSpan={5}>
                                                        <Center py="xl">
                                                            <Stack align="center" gap="xs">
                                                                <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                                    <IconSearch size={18} />
                                                                </ThemeIcon>
                                                                <Text size="sm" c="dimmed">
                                                                    {search
                                                                        ? t("carData.noResultsSearch")
                                                                        : t("carData.noResultsEmpty")}
                                                                </Text>
                                                            </Stack>
                                                        </Center>
                                                    </Table.Td>
                                                </Table.Tr>
                                            )}

                                            {/* Data rows */}
                                            {services.map((item, idx) => (
                                                <motion.tr
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.03, duration: 0.25, ease: "easeOut" }}
                                                >
                                                    <Table.Td>
                                                        <Text size="xs" c="dimmed" fw={500}>
                                                            #{String((page - 1) * PAGE_SIZE + idx + 1).padStart(3, "0")}
                                                        </Text>
                                                    </Table.Td>

                                                    <Table.Td>
                                                        <Group gap={8}>
                                                            {item.icon && (
                                                                <Text size="lg" style={{ lineHeight: 1 }}>
                                                                    {item.icon}
                                                                </Text>
                                                            )}
                                                            <Text size="sm" fw={500}>
                                                                {item.name}
                                                            </Text>
                                                        </Group>
                                                    </Table.Td>

                                                    <Table.Td>
                                                        <Badge color="teal" variant="light" size="sm" radius="md">
                                                            ${item.pricePerDay.toFixed(2)} {t("perDay")}
                                                        </Badge>
                                                    </Table.Td>

                                                    <Table.Td>
                                                        {item.isActive ? (
                                                            <Badge color="green" variant="light" size="sm" radius="md" leftSection={<IconCheck size={11} />}>
                                                                {t("additionalServices.active")}
                                                            </Badge>
                                                        ) : (
                                                            <Badge color="gray" variant="light" size="sm" radius="md" leftSection={<IconBan size={11} />}>
                                                                {t("additionalServices.inactive")}
                                                            </Badge>
                                                        )}
                                                    </Table.Td>

                                                    <Table.Td>
                                                        <Group gap={4}>
                                                            <Tooltip label={t("edit")} withArrow fz="xs">
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
                                                            <Tooltip label={t("delete")} withArrow fz="xs">
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

                            {/* ── Pagination ──────────────────────────────── */}
                            {totalPages > 1 && (
                                <Group justify="space-between" align="center" px={4}>
                                    <Text size="xs" c="dimmed">
                                        {t("additionalServices.showing")}{" "}
                                        <Text component="span" size="xs" fw={500}>{startItem}–{endItem}</Text>
                                        {" "}{t("additionalServices.of")}{" "}
                                        <Text component="span" size="xs" fw={500}>{totalCount}</Text>
                                        {" "}{t("admin.aditionalServices")}
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
                                        ? t("additionalServices.editTitle")
                                        : t("additionalServices.addTitle")}
                                </Text>
                            </Group>
                        }
                        size="md"
                        centered
                        radius="lg"
                        styles={{
                            header: { paddingBottom: 12, borderBottom: "0.5px solid var(--mantine-color-default-border)" },
                            body: { padding: "20px 24px 24px" },
                        }}
                    >
                        <Stack gap="md">
                            <TextInput
                                label={t("additionalServices.fieldName")}
                                placeholder={t("additionalServices.fieldNamePlaceholder")}
                                required
                                radius="md"
                                {...form.getInputProps("name")}
                                styles={inputStyles}
                            />

                            <Select
                                label={t("additionalServices.fieldIcon")}
                                placeholder={t("additionalServices.fieldIconPlaceholder")}
                                radius="md"
                                clearable
                                data={SERVICE_ICONS}
                                renderOption={({ option }) => (
                                    <Group gap={10}>
                                        <Text size="lg" style={{ lineHeight: 1 }}>{option.value}</Text>
                                        <Text size="sm">{option.label}</Text>
                                    </Group>
                                )}
                                leftSection={
                                    form.values.icon
                                        ? <Text size="md" style={{ lineHeight: 1 }}>{form.values.icon}</Text>
                                        : <IconMoodSmile size={15} />
                                }
                                {...form.getInputProps("icon")}
                                styles={inputStyles}
                            />

                            <NumberInput
                                label={t("additionalServices.fieldPrice")}
                                placeholder="0.00"
                                required
                                min={0.01}
                                step={0.5}
                                decimalScale={2}
                                fixedDecimalScale
                                radius="md"
                                {...form.getInputProps("pricePerDay")}
                                styles={inputStyles}
                            />

                            <Switch
                                label={t("additionalServices.fieldActive")}
                                description={t("additionalServices.fieldActiveDesc")}
                                color="teal"
                                radius="md"
                                {...form.getInputProps("isActive", { type: "checkbox" })}
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
                                {editTarget ? t("carData.saveChanges") : t("carData.createEntry")}
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
                                <Text fw={500} size="md">
                                    {t("carData.deleteTitle")}
                                </Text>
                            </Group>
                        }
                        size="sm"
                        centered
                        radius="lg"
                        styles={{
                            header: { paddingBottom: 12, borderBottom: "0.5px solid var(--mantine-color-default-border)" },
                            body: { padding: "20px 24px 24px" },
                        }}
                    >
                        <Stack gap="lg" align="center">
                            <Paper
                                radius="md"
                                p="md"
                                w="100%"
                                style={{
                                    background: "var(--mantine-color-red-light)",
                                    border: "0.5px solid var(--mantine-color-red-light-hover)",
                                }}
                            >
                                <Stack gap={4} align="center">
                                    <Text size="sm" ta="center" fw={500} c="red.8">
                                        {t("carData.deleteWarning", { name: deleteTarget?.name })}
                                    </Text>
                                    <Text size="xs" ta="center" c="dimmed">
                                        {t("carData.deleteUndone")}
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
                                    {t("cancel")}
                                </Button>
                                <Button
                                    color="red"
                                    flex={1}
                                    radius="md"
                                    loading={actionLoading}
                                    leftSection={<IconTrash size={15} />}
                                    onClick={handleDelete}
                                >
                                    {t("delete")}
                                </Button>
                            </Group>
                        </Stack>
                    </Modal>

                </Stack>
            </motion.div>

            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.2} }`}</style>
        </>
    );
}
