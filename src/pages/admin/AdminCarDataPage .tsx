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
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { motion } from "framer-motion";
import { IconSearch, IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { get, post, put, del } from "../../utils/api.utils";
import Spinner from "../../components/spinner/Spinner";
import type { CarCategory, CarCompanyModel, CarCompanyName, GeneralData } from "../../data/vehicles";


// ─── Types ────────────────────────────────────────────────────────────────────

type CarExteriorColor = GeneralData;
type CarFuel = GeneralData;
type CarInteriorColor = GeneralData;
type CarTransmission = GeneralData;

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
  categories:     "CarCategory",
  companyNames:   "CarCompanyName",
  companyModels:  "CarCompanyModel",
  exteriorColors: "CarExteriorColor",
  fuels:          "CarFuel",
  interiorColors: "CarInteriorColor",
  transmissions:  "CarTransmission",
};

// ─── Tab Config ───────────────────────────────────────────────────────────────

// Labels are now translation keys — resolved inside the component via t()
const TABS: { key: TabKey; labelKey: string; color: string }[] = [
  { key: "categories",     labelKey: "carData.tabs.categories",     color: "teal"   },
  { key: "companyNames",   labelKey: "carData.tabs.companyNames",   color: "blue"   },
  { key: "companyModels",  labelKey: "carData.tabs.companyModels",  color: "violet" },
  { key: "exteriorColors", labelKey: "carData.tabs.exteriorColors", color: "orange" },
  { key: "fuels",          labelKey: "carData.tabs.fuels",          color: "pink"   },
  { key: "interiorColors", labelKey: "carData.tabs.interiorColors", color: "yellow" },
  { key: "transmissions",  labelKey: "carData.tabs.transmissions",  color: "teal"   },
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCarDataPage() {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<TabKey>("categories");

  const [data, setData] = useState<Record<TabKey, any[]>>({
    categories:     [],
    companyNames:   [],
    companyModels:  [],
    exteriorColors: [],
    fuels:          [],
    interiorColors: [],
    transmissions:  [],
  });

  const [loading, setLoading] = useState(false);

  const [modalOpen,    setModalOpen]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GeneralData | null>(null);
  const [editTarget,   setEditTarget]   = useState<any>(null);

  const [formName,      setFormName]      = useState("");
  const [formDesc,      setFormDesc]      = useState("");
  const [formCompanyId, setFormCompanyId] = useState("");

  const [search, setSearch] = useState("");

  // Resolve translated label for active tab
  const tab      = TABS.find((t) => t.key === activeTab)!;
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
    setFormName("");
    setFormDesc("");
    setFormCompanyId(data.companyNames[0]?.id || "");
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditTarget(item);
    setFormName(item.name);
    setFormDesc(item.description || "");
    const brandId = typeof item.carCompanyNameId === "string"
      ? item.carCompanyNameId
      : item.carCompanyName?.id ?? data.companyNames[0]?.id ?? "";
    setFormCompanyId(brandId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formName.trim()) return;
    setLoading(true);
    const endpoint = ENDPOINTS[activeTab];
    const isEdit   = !!editTarget;

    try {
      if (activeTab === "categories") {
        const body = { name: formName, description: formDesc };
        if (!isEdit) {
          const created = await createItem<CarCategory>(endpoint, body);
          setData((p) => ({ ...p, categories: [created, ...p.categories] }));
        } else {
          const updated = await updateItem<CarCategory>(endpoint, editTarget.id, { id: editTarget.id, ...body });
          setData((p) => ({ ...p, categories: p.categories.map((x) => (x.id === editTarget.id ? updated : x)) }));
        }
      } else if (activeTab === "companyNames") {
        const body = { name: formName };
        if (!isEdit) {
          const created = await createItem<CarCompanyName>(endpoint, body);
          setData((p) => ({ ...p, companyNames: [created, ...p.companyNames] }));
        } else {
          const updated = await updateItem<CarCompanyName>(endpoint, editTarget.id, { id: editTarget.id, ...body });
          setData((p) => ({ ...p, companyNames: p.companyNames.map((x) => (x.id === editTarget.id ? updated : x)) }));
        }
      } else if (activeTab === "companyModels") {
        const brandName = data.companyNames.find((c) => c.id === formCompanyId)?.name || "";
        const body = { name: formName, companyNameId: formCompanyId };
        if (!isEdit) {
          const created = await createItem<CarCompanyModel>(endpoint, body);
          setData((p) => ({ ...p, companyModels: [{ ...created, carCompanyName: brandName }, ...p.companyModels] }));
        } else {
          const updated = await updateItem<CarCompanyModel>(endpoint, editTarget.id, { id: editTarget.id, ...body });
          setData((p) => ({
            ...p,
            companyModels: p.companyModels.map((x) =>
              x.id === editTarget.id ? { ...updated, carCompanyName: brandName } : x
            ),
          }));
        }
      } else {
        const body = { name: formName };
        if (!isEdit) {
          const created = await createItem<GeneralData>(endpoint, body);
          setData((p) => ({ ...p, [activeTab]: [created, ...p[activeTab]] }));
        } else {
          const updated = await updateItem<GeneralData>(endpoint, editTarget.id, { id: editTarget.id, ...body });
          setData((p) => ({
            ...p,
            [activeTab]: p[activeTab].map((x) => (x.id === editTarget.id ? updated : x)),
          }));
        }
      }

      notifications.show({
        title:   t("success"),
        message: isEdit ? t("carData.updated") : t("carData.created"),
        color:   "teal",
      });
      closeModal();
    } catch {
      notifications.show({ message: t("carData.saveFailed"), color: "red" });
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
      notifications.show({ message: t("carData.deleted"), color: "red" });
      setDeleteTarget(null);
    } catch {
      notifications.show({ message: t("carData.deleteFailed"), color: "red" });
    } finally {
      setLoading(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────────

  const filtered = (data[activeTab] ?? []).filter((x) =>
    x.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <Spinner visible={loading} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap="xl">

          {/* ── Header ── */}
          <Group justify="space-between">
            <Box>
              <Title order={2} fw={700}>
                {t("carData.title")}
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                {t("carData.subtitle")}
              </Text>
            </Box>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                leftSection={<IconPlus size={16} />}
                variant="filled"
                color="teal"
                onClick={openCreate}
              >
                {t("carData.add", { label: tabSingular })}
              </Button>
            </motion.div>
          </Group>

          {/* ── Tabs ── */}
          <Tabs
            value={activeTab}
            onChange={(val) => {
              setActiveTab(val as TabKey);
              setSearch("");
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

          {/* ── Search + Count ── */}
          <Group>
            <TextInput
              placeholder={t("carData.searchPlaceholder", { label: tabLabel.toLowerCase() })}
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1, maxWidth: 300 }}
            />
            <Badge color={tab.color} variant="light" size="lg">
              {loading ? "…" : filtered.length} {tabLabel}
            </Badge>
          </Group>

          {/* ── Table ── */}
          <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>{t("carData.colName")}</Table.Th>
                  {activeTab === "categories"    && <Table.Th>{t("carData.colDescription")}</Table.Th>}
                  {activeTab === "companyModels" && <Table.Th>{t("carData.colBrand")}</Table.Th>}
                  <Table.Th>{t("carData.colCreated")}</Table.Th>
                  <Table.Th>{t("carData.colActions")}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <Table.Tr key={i}>
                      <Table.Td colSpan={6}>
                        <Box
                          style={{
                            height: 14,
                            borderRadius: 4,
                            background: "var(--mantine-color-dark-5)",
                            opacity: 0.4,
                            width: `${50 + i * 10}%`,
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : filtered.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Text ta="center" c="dimmed" py="xl" size="sm">
                        {search
                          ? t("carData.noResultsSearch")
                          : t("carData.noResultsEmpty")}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filtered.map((item, idx) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                    >
                      <Table.Td c="dimmed" fz="xs">
                        #{String(idx + 1).padStart(3, "0")}
                      </Table.Td>
                      <Table.Td fw={500}>{item.name}</Table.Td>
                      {activeTab === "categories" && (
                        <Table.Td c="dimmed" fz="sm">
                          {item.description || "—"}
                        </Table.Td>
                      )}
                      {activeTab === "companyModels" && (
                        <Table.Td>
                          <Badge color="blue" variant="light" size="sm">
                            {resolveBrandName(item.carCompanyName)}
                          </Badge>
                        </Table.Td>
                      )}
                      <Table.Td c="dimmed" fz="xs">
                        {fmtDate(item)}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4}>
                          <ActionIcon
                            variant="subtle"
                            color="yellow"
                            size="sm"
                            onClick={() => openEdit(item)}
                            aria-label={t("carData.colActions")}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={t("delete")}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </motion.tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {/* ── Create / Edit Modal ── */}
          <Modal
            opened={modalOpen}
            onClose={closeModal}
            title={
              editTarget
                ? t("carData.editTitle", { label: tabSingular })
                : t("carData.addTitle",  { label: tabSingular })
            }
            size="md"
            centered
          >
            <Stack gap="md">
              <TextInput
                label={t("carData.fieldName")}
                placeholder={t("carData.fieldNamePlaceholder", { label: tabSingular.toLowerCase() })}
                value={formName}
                onChange={(e) => setFormName(e.currentTarget.value)}
                required
              />

              {activeTab === "categories" && (
                <Textarea
                  label={t("carData.fieldDescription")}
                  placeholder={t("carData.fieldDescriptionPlaceholder")}
                  minRows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.currentTarget.value)}
                />
              )}

              {activeTab === "companyModels" && (
                <Select
                  label={t("carData.fieldBrand")}
                  required
                  data={data.companyNames.map((c) => ({ value: c.id, label: c.name }))}
                  value={formCompanyId}
                  onChange={(val) => setFormCompanyId(val || "")}
                />
              )}

              <Button
                variant="filled"
                color="teal"
                fullWidth
                loading={loading}
                onClick={handleSave}
              >
                {editTarget ? t("carData.saveChanges") : t("carData.createEntry")}
              </Button>
            </Stack>
          </Modal>

          {/* ── Delete Confirm Modal ── */}
          <Modal
            opened={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            title={t("carData.deleteTitle")}
            size="sm"
            centered
          >
            <Stack gap="md" align="center" py="sm">
              <Text size="xl">⚠️</Text>
              <Text ta="center" size="sm">
                {t("carData.deleteWarning", { name: deleteTarget?.name })}
                <br />
                <Text component="span" c="dimmed" size="xs">
                  {t("carData.deleteUndone")}
                </Text>
              </Text>
              <Group w="100%">
                <Button
                  variant="default"
                  flex={1}
                  onClick={() => setDeleteTarget(null)}
                  disabled={loading}
                >
                  {t("cancel")}
                </Button>
                <Button color="red" flex={1} loading={loading} onClick={handleDelete}>
                  {t("delete")}
                </Button>
              </Group>
            </Stack>
          </Modal>

        </Stack>
      </motion.div>
    </>
  );
}