import { useState, useEffect } from "react";
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
    Textarea,
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
    IconTag,
    IconCalendar,
    IconCar,
    IconCategory,
    IconPercentage,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

import { useForm } from "@mantine/form";
import { del, get, post, put } from "../../utils/api.utils";
import Spinner from "../../components/spinner/Spinner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Promotion {
    id: string;
    title: string | null;
    description: string | null;
    code: string | null;
    discountPercentage: number;
    numberOfDays: number;
    isActive: boolean;
    carId: string | null;
    carCategoryId: string | null;
    carName?: string | null;
    carCategoryName?: string | null;
}

interface CarCategory {
    id: string;
    name: string;
}

interface Car {
    id: string;
    title: string;
    // add other car fields if needed
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
    const { t } = useTranslation();

    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [cars, setCars] = useState<Car[]>([]);
    const [categories, setCategories] = useState<CarCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Promotion | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);

    const form = useForm({
        initialValues: {
            title: "",
            description: "",
            code: "",
            discountPercentage: 10,
            numberOfDays: 1,
            isActive: true,
            carId: null as string | null,
            carCategoryId: null as string | null,
        },
        validate: {
            title: (v) =>
                !v?.trim()
                    ? t("validation.required")
                    : v.trim().length > 200
                        ? t("validation.maxLength", { max: 200 })
                        : null,

            description: (v) =>
                v && v.trim().length > 200
                    ? t("validation.maxLength", { max: 200 })
                    : null,

            code: (v) =>
                !v?.trim()
                    ? t("validation.required")
                    : v.trim().length > 50
                        ? t("validation.maxLength", { max: 50 })
                        : null,

            discountPercentage: (v) =>
                v <= 0
                    ? t("validation.mustBeGreaterThan0")
                    : v >= 100
                        ? t("validation.mustBeLessThan100")
                        : null,

            numberOfDays: (v) =>
                v <= 0 ? t("validation.mustBePositive") : null,

            // Only required on CREATE — carId field shows the error for both
            carId: (v, values) =>
                !editTarget && !v && !values.carCategoryId
                    ? t("validation.carOrCategoryRequired")
                    : null,
        },
    });

    // ─── Fetch ────────────────────────────────────────────────────────────────

    useEffect(() => {
        const fetchPromotions = async () => {
            setLoading(true);
            try {
                const promoRes = await get("Promotion/getAll");
                if (promoRes.success) setPromotions(promoRes.data ?? []);
            } catch (error) {
                console.error("Failed to fetch promotions:", error);
                notifications.show({ message: t("promotions.loadFailed"), color: "red" });
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const catRes = await get("CarCategory/getAll");
                if (catRes.success) setCategories(catRes.data ?? []);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const carRes = await get("Cars/getAll");
                console.log("carRes.data", carRes.data);
                if (carRes.success) setCars(carRes.data ?? []);
            } catch (error) {
                console.error("Failed to fetch cars:", error);
            }
        };
        fetchCars();
    }, []);

    // ─── Modal helpers ────────────────────────────────────────────────────────

    const openCreate = () => {
        setEditTarget(null);
        form.setValues({
            title: "",
            description: "",
            code: "",
            discountPercentage: 10,
            numberOfDays: 1,
            isActive: true,
            carId: null,
            carCategoryId: null,
        });
        form.clearErrors();
        setModalOpen(true);
    };

    const openEdit = (item: Promotion) => {
        setEditTarget(item);
        form.setValues({
            title: item.title ?? "",
            description: item.description ?? "",
            code: item.code ?? "",
            discountPercentage: item.discountPercentage,
            numberOfDays: item.numberOfDays,
            isActive: item.isActive,
            carId: item.carId ?? null,
            carCategoryId: item.carCategoryId ?? null,
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

        const { title, description, code, discountPercentage, numberOfDays, isActive, carId, carCategoryId } =
            form.values;

        setLoading(true);
        try {
            if (!editTarget) {
                const response = await post("Promotion", {
                    title: title || null,
                    description: description || null,
                    code: code || null,
                    discountPercentage,
                    numberOfDays,
                    isActive,
                    carId: carId || null,
                    carCategoryId: carCategoryId || null,
                });
                if (response.success) {
                    setPromotions((prev) => [response.data, ...prev]);
                }
            } else {
                const response = await put(`Promotion/${editTarget.id}`, {
                    id: editTarget.id,
                    title: title || null,
                    description: description || null,
                    code: code || null,
                    discountPercentage,
                    numberOfDays,
                    isActive,
                });
                if (response.success) {
                    setPromotions((prev) =>
                        prev.map((p) => (p.id === editTarget.id ? response.data : p))
                    );
                }
            }

            notifications.show({
                title: t("success"),
                message: editTarget
                    ? t("promotions.updated")
                    : t("promotions.created"),
                color: "teal",
            });

            closeModal();
        } catch (error) {
            console.error("Failed to save promotion:", error);
            notifications.show({
                message: t("promotions.saveFailed"),
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    // ─── Delete ───────────────────────────────────────────────────────────────

    const handleDelete = async () => {
        if (!deleteTarget) return;

        setLoading(true);
        try {
            const response = await del(`Promotion/${deleteTarget.id}`);
            if (response.success) {
                setPromotions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
                notifications.show({
                    title: t("success"),
                    message: t("promotions.deleted"),
                    color: "green",
                });
                setDeleteTarget(null);
            }
        } catch (error) {
            console.error("Failed to delete promotion:", error);
            notifications.show({
                title: t("error"),
                message: t("promotions.deleteFailed"),
                color: "red",
            });
        } finally {
            setLoading(false);
        }
    };

    // ─── Derived ──────────────────────────────────────────────────────────────

    const filtered = promotions.filter((p) => {
        const q = search.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.code?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        );
    });

    const carOptions = cars
        .filter((c) => c.title != null)
        .map((c) => ({ value: c.id, label: c.title }));

    const categoryOptions = categories
        .filter((c) => c.name != null)
        .map((c) => ({ value: c.id, label: c.name }));

    // ─── Render ───────────────────────────────────────────────────────────────

    console.log('cars', cars)
    console.log('categoryOptions', categoryOptions)
    return (
        <>
            <Spinner visible={loading} />

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
                                {t("promotions.promotions")}
                            </Title>
                            <Text size="sm" c="dimmed">
                                {t("promotions.subtitle")}
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
                                        transition: "box-shadow 0.15s",
                                        "&:hover": { boxShadow: "0 4px 14px rgba(15,110,86,0.25)" },
                                    },
                                }}
                            >
                                {t("promotions.add")}
                            </Button>
                        </motion.div>
                    </Group>

                    {/* ── Search + Count ─────────────────────────────────── */}
                    <Group gap="sm">
                        <TextInput
                            placeholder={t("promotions.searchPlaceholder")}
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
                        <Badge
                            color="teal"
                            variant="light"
                            size="lg"
                            radius="md"
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            {loading ? "…" : filtered.length}{" "}
                            {t("promotions.promotions")}
                        </Badge>
                    </Group>

                    {/* ── Table ──────────────────────────────────────────── */}
                    <Paper
                        radius="lg"
                        withBorder
                        style={{ overflow: "hidden", borderColor: "var(--mantine-color-default-border)" }}
                    >
                        <Table.ScrollContainer minWidth={700}>
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
                                        <Table.Th>{t("promotions.colTitle")}</Table.Th>
                                        <Table.Th>{t("promotions.colCode")}</Table.Th>
                                        <Table.Th>{t("promotions.colDiscount")}</Table.Th>
                                        <Table.Th>{t("promotions.colDays")}</Table.Th>
                                        <Table.Th>{t("promotions.colAppliesTo")}</Table.Th>
                                        <Table.Th>{t("promotions.colStatus")}</Table.Th>
                                        <Table.Th w={90}>{t("carData.colActions")}</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>

                                <Table.Tbody>
                                    {/* Skeleton rows while loading */}
                                    {loading &&
                                        [1, 2, 3, 4].map((i) => (
                                            <Table.Tr key={i}>
                                                {[40, 25, 15, 10, 10, 20, 15, 15].map((w, j) => (
                                                    <Table.Td key={j}>
                                                        <Box
                                                            style={{
                                                                height: 12,
                                                                borderRadius: 6,
                                                                background: "var(--mantine-color-default-border)",
                                                                opacity: 0.5,
                                                                width: `${w + i * 2}%`,
                                                                animation: "pulse 1.4s ease-in-out infinite",
                                                            }}
                                                        />
                                                    </Table.Td>
                                                ))}
                                            </Table.Tr>
                                        ))}

                                    {/* Empty state */}
                                    {!loading && filtered.length === 0 && (
                                        <Table.Tr>
                                            <Table.Td colSpan={8}>
                                                <Center py="xl">
                                                    <Stack align="center" gap="xs">
                                                        <ThemeIcon size={40} radius="xl" color="teal" variant="light">
                                                            <IconTag size={18} />
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
                                    {!loading &&
                                        filtered.map((item, idx) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03, duration: 0.25, ease: "easeOut" }}
                                            >
                                                <Table.Td>
                                                    <Text size="xs" c="dimmed" fw={500}>
                                                        #{String(idx + 1).padStart(3, "0")}
                                                    </Text>
                                                </Table.Td>

                                                <Table.Td>
                                                    <Stack gap={2}>
                                                        <Text size="sm" fw={500}>
                                                            {item.title || <Text span c="dimmed" size="sm">—</Text>}
                                                        </Text>
                                                        {item.description && (
                                                            <Text size="xs" c="dimmed" lineClamp={1}>
                                                                {item.description}
                                                            </Text>
                                                        )}
                                                    </Stack>
                                                </Table.Td>

                                                <Table.Td>
                                                    {item.code ? (
                                                        <Badge
                                                            color="violet"
                                                            variant="light"
                                                            size="sm"
                                                            radius="md"
                                                            leftSection={<IconTag size={10} />}
                                                            style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}
                                                        >
                                                            {item.code}
                                                        </Badge>
                                                    ) : (
                                                        <Text size="sm" c="dimmed">—</Text>
                                                    )}
                                                </Table.Td>

                                                <Table.Td>
                                                    <Badge
                                                        color="orange"
                                                        variant="light"
                                                        size="sm"
                                                        radius="md"
                                                        leftSection={<IconPercentage size={10} />}
                                                    >
                                                        {item.discountPercentage}%
                                                    </Badge>
                                                </Table.Td>

                                                <Table.Td>
                                                    <Badge
                                                        color="blue"
                                                        variant="light"
                                                        size="sm"
                                                        radius="md"
                                                        leftSection={<IconCalendar size={10} />}
                                                    >
                                                        {item.numberOfDays}d
                                                    </Badge>
                                                </Table.Td>

                                                <Table.Td>
                                                    {item.carId ? (
                                                        <Badge color="indigo" variant="light" size="sm" radius="md" leftSection={<IconCar size={10} />}>
                                                            {cars.find((c) => c.id === item.carId)?.title ?? t("promotions.car")}
                                                        </Badge>
                                                    ) : item.carCategoryId ? (
                                                        <Badge color="cyan" variant="light" size="sm" radius="md" leftSection={<IconCategory size={10} />}>
                                                            {categories.find((c) => c.id === item.carCategoryId)?.name ?? t("promotions.category")}
                                                        </Badge>
                                                    ) : (
                                                        <Badge color="gray" variant="light" size="sm" radius="md">
                                                            {t("promotions.allCars")}
                                                        </Badge>
                                                    )}
                                                </Table.Td>

                                                <Table.Td>
                                                    {item.isActive ? (
                                                        <Badge
                                                            color="green"
                                                            variant="light"
                                                            size="sm"
                                                            radius="md"
                                                            leftSection={<IconCheck size={11} />}
                                                        >
                                                            {t("promotions.active")}
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            color="gray"
                                                            variant="light"
                                                            size="sm"
                                                            radius="md"
                                                            leftSection={<IconBan size={11} />}
                                                        >
                                                            {t("promotions.inactive")}
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
                                        ? t("promotions.editTitle")
                                        : t("promotions.addTitle")}
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
                                label={t("promotions.fieldTitle")}
                                placeholder={t("promotions.fieldTitlePlaceholder")}
                                radius="md"
                                required
                                {...form.getInputProps("title")}
                                styles={inputStyles}
                            />

                            <Textarea
                                label={t("promotions.fieldDescription")}
                                placeholder={t("promotions.fieldDescriptionPlaceholder")}
                                radius="md"
                                autosize
                                minRows={2}
                                maxRows={4}
                                {...form.getInputProps("description")}
                                styles={inputStyles}
                            />

                            <TextInput
                                label={t("promotions.fieldCode")}
                                placeholder={t("promotions.fieldCodePlaceholder")}
                                radius="md"
                                leftSection={<IconTag size={15} />}
                                styles={{
                                    ...inputStyles,
                                    input: {
                                        ...inputStyles.input,
                                        fontFamily: "monospace",
                                        letterSpacing: "0.05em",
                                    },
                                }}
                                {...form.getInputProps("code")}
                            />

                            <Group grow>
                                <NumberInput
                                    label={t("promotions.fieldDiscount")}
                                    placeholder="10"
                                    required
                                    min={1}
                                    max={100}
                                    step={1}
                                    suffix="%"
                                    radius="md"
                                    leftSection={<IconPercentage size={15} />}
                                    {...form.getInputProps("discountPercentage")}
                                    styles={inputStyles}
                                />

                                <NumberInput
                                    label={t("promotions.fieldDays")}
                                    placeholder="1"
                                    required
                                    min={1}
                                    step={1}
                                    radius="md"
                                    leftSection={<IconCalendar size={15} />}
                                    {...form.getInputProps("numberOfDays")}
                                    styles={inputStyles}
                                />
                            </Group>

                            {/* Car / Category — mutually exclusive */}
                            {form.errors.carId && (
                                <Text size="xs" c="red">
                                    {form.errors.carId}
                                </Text>
                            )}
                            {!editTarget && (
                                <>
                                    <Select
                                        label={t("promotions.fieldCar")}
                                        placeholder={t("promotions.fieldCarPlaceholder")}
                                        radius="md"
                                        clearable
                                        searchable
                                        data={carOptions}
                                        leftSection={<IconCar size={15} />}
                                        disabled={!!form.values.carCategoryId}
                                        description={
                                            form.values.carCategoryId
                                                ? t("promotions.carDisabledHint")
                                                : undefined
                                        }
                                        value={form.values.carId}
                                        onChange={(val) => {
                                            form.setFieldValue("carId", val);
                                            if (val) form.setFieldValue("carCategoryId", null);
                                        }}
                                        styles={inputStyles}
                                    />

                                    <Select
                                        label={t("promotions.fieldCategory")}
                                        placeholder={t("promotions.fieldCategoryPlaceholder")}
                                        radius="md"
                                        clearable
                                        searchable
                                        data={categoryOptions}
                                        leftSection={<IconCategory size={15} />}
                                        disabled={!!form.values.carId}
                                        description={
                                            form.values.carId
                                                ? t("promotions.categoryDisabledHint")
                                                : undefined
                                        }
                                        value={form.values.carCategoryId}
                                        onChange={(val) => {
                                            form.setFieldValue("carCategoryId", val);
                                            if (val) form.setFieldValue("carId", null);
                                        }}
                                        styles={inputStyles}
                                    />
                                </>
                            )}

                            <Switch
                                label={form.values.isActive ? t("promotions.fieldActive") : t("promotions.inactive")}
                                description={t("promotions.fieldActiveDesc")}
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
                                loading={loading}
                                leftSection={editTarget ? <IconDeviceFloppy size={16} /> : <IconPlus size={16} />}
                                onClick={handleSave}
                                styles={{
                                    root: {
                                        transition: "transform 0.12s, box-shadow 0.15s",
                                        "&:hover": {
                                            transform: "translateY(-1px)",
                                            boxShadow: "0 4px 14px rgba(15,110,86,0.25)",
                                        },
                                        "&:active": { transform: "scale(0.99)" },
                                    },
                                }}
                            >
                                { t("save")}
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
                                    {t("promotions.deleteTitle")}
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
                                        {t("carData.deleteWarning", { name: deleteTarget?.title || deleteTarget?.code || t("promotions.thisPromotion") })}
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
                                    disabled={loading}
                                >
                                    {t("cancel")}
                                </Button>
                                <Button
                                    color="red"
                                    flex={1}
                                    radius="md"
                                    loading={loading}
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