import {
    Modal, Stack, SimpleGrid, TextInput, Select, Button, Text, Checkbox, NumberInput,
    Textarea,
    Group,
    ThemeIcon,
    Divider,
    Box,
    UnstyledButton,
    Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CarImageUploadPanel, type CarImage as UploadedCarImage } from '../../../components/car-image/CarImageUploadPanel';
import type {
    Vehicle, CarCategory, CarCompanyName, CarCompanyModel, GeneralData,
    FormValues,
} from '../../../data/vehicles';
import { IconCar, IconCheck, IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';

// ── Helpers ───────────────────────────────────────────────────────────────────

const toSelectData = (items: GeneralData[]) =>
    items.map((x) => ({ value: x.id, label: x.name }));

// ── Types ─────────────────────────────────────────────────────────────────────

export const INITIAL_VALUES: FormValues = {
    title: '', description: '',
    year: new Date().getFullYear(), licensePlate: null,
    pricePerDay: 0, seats: 5, doors: 4, mileage: null, horsePower: null,
    categoryId: null, nameId: null, modelId: null,
    transmissionTypeId: null, fuelTypeId: null,
    exteriorColorTypeId: null, interiorColorTypeId: null,
    abs: false, bluetooth: false, airConditioner: false, gps: false,
    camera: false, heatedSeats: false, panoramicRoof: false,
    parkingSensors: false, cruiseControl: false, climateControl: false,
    ledHeadlights: false, appleCarPlay: false, androidAuto: false,
    laneDepartureAlert: false, adaptiveCruiseControl: false,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: false, electricWindows: false,
    carImages: [],
};

export type Lookups = {
    categories: CarCategory[];
    companyNames: CarCompanyName[];
    companyModels: CarCompanyModel[];
    exteriorColors: GeneralData[];
    interiorColors: GeneralData[];
    transmissions: GeneralData[];
    fuels: GeneralData[];
};

const FEATURE_FIELDS: [keyof FormValues, string][] = [
    ['abs', 'ABS'], ['bluetooth', 'Bluetooth'], ['airConditioner', 'Air Conditioner'],
    ['gps', 'GPS'], ['camera', 'Camera'], ['heatedSeats', 'Heated Seats'],
    ['panoramicRoof', 'Panoramic Roof'], ['parkingSensors', 'Parking Sensors'],
    ['cruiseControl', 'Cruise Control'], ['climateControl', 'Climate Control'],
    ['ledHeadlights', 'LED Headlights'], ['appleCarPlay', 'Apple CarPlay'],
    ['androidAuto', 'Android Auto'], ['laneDepartureAlert', 'Lane Departure Alert'],
    ['adaptiveCruiseControl', 'Adaptive Cruise Control'],
    ['toyotaSafetySense', 'Toyota Safety Sense'], ['thirdRowSeats', 'Third Row Seats'],
    ['wirelessCharging', 'Wireless Charging'], ['electricWindows', 'Electric Windows'],
];

// ── Props ─────────────────────────────────────────────────────────────────────

type CarFormModalProps = {
    opened: boolean;
    onClose: () => void;
    editingCar: Vehicle | null;
    lookups: Lookups;
    lookupsLoading: boolean;
    onSave: (values: FormValues) => Promise<void>;
    saving: boolean;
};

// ── Component ─────────────────────────────────────────────────────────────────

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
export function CarFormModal({
    opened, onClose, editingCar, lookups, lookupsLoading, onSave, saving,
}: CarFormModalProps) {
    const { t, i18n } = useTranslation();

    const form = useForm<FormValues>({
        initialValues: INITIAL_VALUES,
        validate: {
            title: (v) =>
                !v || v.trim().length < 2 ? t('validation.titleMin') : null,
            year: (v) =>
                !v || v < 1900 || v > new Date().getFullYear() + 1
                    ? t('validation.invalidYear')
                    : null,
            licensePlate: (v) =>
                !v || v.trim().length < 2 ? t('validation.licensePlateRequired') : null,
            pricePerDay: (v) =>
                v === null || v === undefined || v <= 0 ? t('validation.priceRequired') : null,
            categoryId: (v) =>
                !v ? t('validation.categoryRequired') : null,
            nameId: (v) =>
                !v ? t('validation.brandRequired') : null,
            transmissionTypeId: (v) =>
                !v ? t('validation.transmissionRequired') : null,
            fuelTypeId: (v) =>
                !v ? t('validation.fuelRequired') : null,
            carImages: (v) =>
                !v || (v as UploadedCarImage[]).length === 0
                    ? t('validation.imagesRequired')
                    : null,
        },
    });

    const filteredModels = form.values.nameId
        ? lookups.companyModels.filter((m) => m.carCompanyName?.id === form.values.nameId)
        : lookups.companyModels;

    useEffect(() => {
        if (!opened) return;
        if (editingCar) {
            form.setValues({
                title: editingCar.title,
                description: editingCar.description,
                year: editingCar.year,
                licensePlate: editingCar.licensePlate,
                pricePerDay: editingCar.pricePerDay,
                seats: editingCar.seats,
                doors: editingCar.doors,
                mileage: editingCar.mileage,
                horsePower: editingCar.horsePower,
                categoryId: editingCar.categoryId,
                nameId: editingCar.nameId,
                modelId: editingCar.modelId,
                transmissionTypeId: editingCar.transmissionTypeId,
                fuelTypeId: editingCar.fuelTypeId,
                exteriorColorTypeId: editingCar.exteriorColorTypeId,
                interiorColorTypeId: editingCar.interiorColorTypeId,
                abs: editingCar.abs ?? false,
                bluetooth: editingCar.bluetooth ?? false,
                airConditioner: editingCar.airConditioner ?? false,
                gps: editingCar.gps ?? false,
                camera: editingCar.camera ?? false,
                heatedSeats: editingCar.heatedSeats ?? false,
                panoramicRoof: editingCar.panoramicRoof ?? false,
                parkingSensors: editingCar.parkingSensors ?? false,
                cruiseControl: editingCar.cruiseControl ?? false,
                climateControl: editingCar.climateControl ?? false,
                ledHeadlights: editingCar.ledHeadlights ?? false,
                appleCarPlay: editingCar.appleCarPlay ?? false,
                androidAuto: editingCar.androidAuto ?? false,
                laneDepartureAlert: editingCar.laneDepartureAlert ?? false,
                adaptiveCruiseControl: editingCar.adaptiveCruiseControl ?? false,
                toyotaSafetySense: editingCar.toyotaSafetySense ?? false,
                thirdRowSeats: editingCar.thirdRowSeats ?? false,
                wirelessCharging: editingCar.wirelessCharging ?? false,
                electricWindows: editingCar.electricWindows ?? false,
                carImages: editingCar.carImages ?? [],
            });
        } else {
            form.reset();
        }
    }, [opened, editingCar]);

    useEffect(() => {
        // When language changes, re-run validation to refresh translated errors
        if (Object.keys(form.errors).length > 0) {
            form.validate();
        }
    }, [i18n.language]);

    const handleSave = () => {
        const result = form.validate();
        if (!result.hasErrors) {
            onSave(form.values);
        }
    };

return (
    <Modal
        opened={opened}
        onClose={onClose}
        title={
            <Group gap={10}>
                <ThemeIcon
                    color="teal"
                    variant="light"
                    size={32}
                    radius="md"
                >
                    <IconCar size={16} />
                </ThemeIcon>
                <Text fw={500} size="md">
                    {editingCar ? t('admin.editCar') : t('admin.addCar')}
                </Text>
            </Group>
        }
        size="xl"
        centered
        radius="lg"
        styles={{
            header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
            body: { padding: '20px 24px 28px' },
        }}
    >
        <Stack gap="lg">

            {/* Required-fields notice */}
            <Alert
                icon={<IconInfoCircle size={15} />}
                color="teal"
                variant="light"
                radius="md"
                p="xs"
                styles={{ message: { fontSize: 12 } }}
            >
                {t('validation.fillRequired')} *
            </Alert>

            {/* ── Basic info ─────────────────────────────────────── */}
            <Stack gap="xs">
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    {t('basicInfo')}
                </Text>
                <Divider mb={4} />

                <TextInput
                    required
                    label={t('title')}
                    placeholder={t("titleEx")}
                    {...form.getInputProps('title')}
                    styles={inputStyles}
                />
                <Textarea
                    label={t('description')}
                    placeholder={t("descriptionEx")}
                    autosize
                    minRows={2}
                    maxRows={4}
                    {...form.getInputProps('description')}
                    styles={inputStyles}
                />
            </Stack>

            {/* ── Details ────────────────────────────────────────── */}
            <Stack gap="xs">
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    {t('details')}
                </Text>
                <Divider mb={4} />

                <SimpleGrid cols={2} spacing="sm">
                    <NumberInput
                        required
                        label={t('year')}
                        placeholder="2022"
                        {...form.getInputProps('year')}
                        styles={inputStyles}
                    />
                    <TextInput
                        required
                        label={t('licensePlate')}
                        placeholder="AA 000 BB"
                        {...form.getInputProps('licensePlate')}
                        styles={inputStyles}
                    />
                    <NumberInput
                        required
                        label={t('price')}
                        placeholder="0"
                        rightSection={
                            <Text size="xs" c="dimmed" pr={4}>
                                €/{t('vehicle.perDay')}
                            </Text>
                        }
                        rightSectionWidth={60}
                        {...form.getInputProps('pricePerDay')}
                        styles={inputStyles}
                    />
                    <NumberInput
                        label={t('horsePower')}
                        placeholder="0"
                        rightSection={<Text size="xs" c="dimmed" pr={4}>hp</Text>}
                        rightSectionWidth={36}
                        {...form.getInputProps('horsePower')}
                        styles={inputStyles}
                    />
                    <NumberInput
                        label={t('seats')}
                        {...form.getInputProps('seats')}
                        styles={inputStyles}
                    />
                    <NumberInput
                        label={t('doors')}
                        {...form.getInputProps('doors')}
                        styles={inputStyles}
                    />
                    <Select
                        required
                        label={t('category')}
                        placeholder={t('selectCategory')}
                        data={toSelectData(lookups.categories)}
                        disabled={lookupsLoading}
                        clearable
                        searchable
                        {...form.getInputProps('categoryId')}
                        styles={inputStyles}
                    />
                    <TextInput
                        label={t('mileage')}
                        rightSection={<Text size="xs" c="dimmed" pr={4}>km</Text>}
                        rightSectionWidth={36}
                        {...form.getInputProps('mileage')}
                        styles={inputStyles}
                    />
                </SimpleGrid>
            </Stack>

            {/* ── Brand & specs ──────────────────────────────────── */}
            <Stack gap="xs">
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    {t('brandAndSpecifications')}
                </Text>
                <Divider mb={4} />

                <SimpleGrid cols={3} spacing="sm">
                    <Select
                        required
                        label={t('brand')}
                        placeholder={t('selectBrand')}
                        data={toSelectData(lookups.companyNames)}
                        disabled={lookupsLoading}
                        clearable
                        searchable
                        {...form.getInputProps('nameId')}
                        onChange={(val) => {
                            form.setFieldValue('nameId', val);
                            form.setFieldValue('modelId', null);
                        }}
                        styles={inputStyles}
                    />
                    <Select
                        label={t('model')}
                        placeholder={form.values.nameId ? t('selectModel') : t('selectBrandFirst')}
                        data={toSelectData(filteredModels)}
                        disabled={lookupsLoading || !form.values.nameId}
                        clearable
                        searchable
                        {...form.getInputProps('modelId')}
                        styles={inputStyles}
                    />
                    <Select
                        required
                        label={t('transmission')}
                        placeholder={t('selectTransmission')}
                        data={toSelectData(lookups.transmissions)}
                        disabled={lookupsLoading}
                        clearable
                        searchable
                        {...form.getInputProps('transmissionTypeId')}
                        styles={inputStyles}
                    />
                    <Select
                        required
                        label={t('fuelType')}
                        placeholder={t('selectFuel')}
                        data={toSelectData(lookups.fuels)}
                        disabled={lookupsLoading}
                        clearable
                        searchable
                        {...form.getInputProps('fuelTypeId')}
                        styles={inputStyles}
                    />
                    <Select
                        label={t('exteriorColor')}
                        placeholder={t('selectExteriorColor')}
                        data={toSelectData(lookups.exteriorColors)}
                        disabled={lookupsLoading}
                        clearable
                        searchable
                        {...form.getInputProps('exteriorColorTypeId')}
                        styles={inputStyles}
                    />
                    <Select
                        label={t('interiorColor')}
                        placeholder={t('selectInteriorColor')}
                        data={toSelectData(lookups.interiorColors)}
                        disabled={lookupsLoading}
                        clearable
                        searchable
                        {...form.getInputProps('interiorColorTypeId')}
                        styles={inputStyles}
                    />
                </SimpleGrid>
            </Stack>

            {/* ── Features ───────────────────────────────────────── */}
            <Stack gap="xs">
                <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                    {t('features')}
                </Text>
                <Divider mb={4} />

                <SimpleGrid cols={3} spacing="xs">
                    {FEATURE_FIELDS.map(([field, label]) => {
                        const checked = form.values[field] as boolean;
                        return (
                            <UnstyledButton
                                key={field}
                                onClick={() => form.setFieldValue(field, !checked)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '8px 10px',
                                    borderRadius: 'var(--mantine-radius-md)',
                                    border: checked
                                        ? '0.5px solid var(--mantine-color-teal-4)'
                                        : '0.5px solid var(--mantine-color-default-border)',
                                    background: checked
                                        ? 'var(--mantine-color-teal-0)'
                                        : 'var(--mantine-color-default)',
                                    transition: 'all 0.15s ease',
                                    cursor: 'pointer',
                                }}
                            >
                                <Box
                                    style={{
                                        width: 16,
                                        height: 16,
                                        borderRadius: 4,
                                        flexShrink: 0,
                                        border: checked
                                            ? '1.5px solid var(--mantine-color-teal-6)'
                                            : '1.5px solid var(--mantine-color-default-border)',
                                        background: checked ? 'var(--mantine-color-teal-6)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease',
                                    }}
                                >
                                    {checked && <IconCheck size={10} color="white" stroke={3} />}
                                </Box>
                                <Text
                                    size="xs"
                                    c={checked ? 'teal.8' : 'dimmed'}
                                    style={{ transition: 'color 0.15s' }}
                                >
                                    {t(label)}
                                </Text>
                            </UnstyledButton>
                        );
                    })}
                </SimpleGrid>
            </Stack>

            {/* ── Images ─────────────────────────────────────────── */}
            <Stack gap="xs">
                <Group gap={4}>
                    <Text size="xs" fw={500} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.06em' }}>
                        {t('images')}
                    </Text>
                    <Text size="xs" c="red">*</Text>
                </Group>
                <Divider mb={4} />

                {form.errors.carImages && (
                    <Text size="xs" c="red">{form.errors.carImages}</Text>
                )}
                <CarImageUploadPanel
                    images={form.values.carImages as UploadedCarImage[]}
                    onImagesChange={(imgs) => {
                        form.setFieldValue('carImages', imgs);
                        if (imgs.length > 0) form.clearFieldError('carImages');
                    }}
                />
            </Stack>

            {/* ── Save ───────────────────────────────────────────── */}
            <Button
                variant="filled"
                color="teal"
                fullWidth
                size="md"
                radius="md"
                loading={saving}
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSave}
                styles={{
                    root: {
                        transition: 'transform 0.12s ease, box-shadow 0.15s ease',
                        '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 14px rgba(15, 110, 86, 0.25)',
                        },
                        '&:active': {
                            transform: 'scale(0.99)',
                        },
                    },
                }}
            >
                {t('admin.saveCar')}
            </Button>

        </Stack>
    </Modal>
);

}