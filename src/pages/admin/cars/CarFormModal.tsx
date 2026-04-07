import {
    Modal, Stack, SimpleGrid, TextInput, Select, Button, Text, Checkbox, NumberInput,
    Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CarImageUploadPanel, type CarImage as UploadedCarImage } from '../../../components/car-image/CarImageUploadPanel';
import type {
    Vehicle, CarCategory, CarCompanyName, CarCompanyModel, GeneralData,
    FormValues,
} from '../../../data/vehicles';

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

export function CarFormModal({
    opened, onClose, editingCar, lookups, lookupsLoading, onSave, saving,
}: CarFormModalProps) {
    const { t } = useTranslation();
    const form = useForm<FormValues>({ initialValues: INITIAL_VALUES });

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

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={editingCar ? t('admin.editCar') : t('admin.addCar')}
            size="xl"
            centered
        >
            <Stack gap="md">


                <TextInput label={t('title')} {...form.getInputProps('title')} />
                <Textarea
                    label={t('description')}
                    {...form.getInputProps('description')}
                    autosize
                    minRows={2}
                    maxRows={4}
                />
                <SimpleGrid cols={2}>
                    <NumberInput label={t('year')} {...form.getInputProps('year')} />
                    <TextInput label={t('licensePlate')} {...form.getInputProps('licensePlate')} />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                    <NumberInput label={`${t('price')} (€/${t('vehicle.perDay')})`} {...form.getInputProps('pricePerDay')} />
                    <NumberInput label={t('horsePower')} {...form.getInputProps('horsePower')} />
                </SimpleGrid>

                <SimpleGrid cols={2}>
                    <NumberInput label={t('seats')} {...form.getInputProps('seats')} />
                    <NumberInput label={t('doors')} {...form.getInputProps('doors')} />
                </SimpleGrid>

                <SimpleGrid cols={2}>

                    <Select
                        label={t('category')} placeholder={t('selectCategory')}
                        data={toSelectData(lookups.categories)}
                        disabled={lookupsLoading} clearable searchable
                        {...form.getInputProps('categoryId')}
                    />
                    <TextInput label={t('mileage')} {...form.getInputProps('mileage')} />
                </SimpleGrid>


                <SimpleGrid cols={3}>
                    <Select
                        label={t('brand')} placeholder={t('selectBrand')}
                        data={toSelectData(lookups.companyNames)}
                        disabled={lookupsLoading} clearable searchable
                        {...form.getInputProps('nameId')}
                        onChange={(val) => {

                            form.setFieldValue('nameId', val);
                            form.setFieldValue('modelId', null);
                        }}
                    />
                    <Select
                        label={t('model')}
                        placeholder={form.values.nameId ? t('selectModel') : t('selectBrandFirst')}
                        data={toSelectData(filteredModels)}
                        disabled={lookupsLoading || !form.values.nameId}
                        clearable searchable
                        {...form.getInputProps('modelId')}
                    />
                    <Select
                        label={t('transmission')} placeholder={t('selectTransmission')}
                        data={toSelectData(lookups.transmissions)}
                        disabled={lookupsLoading} clearable searchable
                        {...form.getInputProps('transmissionTypeId')}
                    />
                </SimpleGrid>

                <SimpleGrid cols={3}>
                    <Select
                        label={t('fuelType')} placeholder={t('selectFuel')}
                        data={toSelectData(lookups.fuels)}
                        disabled={lookupsLoading} clearable searchable
                        {...form.getInputProps('fuelTypeId')}
                    />
                    <Select
                        label={t('exteriorColor')} placeholder={t('selectExteriorColor')}
                        data={toSelectData(lookups.exteriorColors)}
                        disabled={lookupsLoading} clearable searchable
                        {...form.getInputProps('exteriorColorTypeId')}
                    />
                    <Select
                        label={t('interiorColor')} placeholder={t('selectInteriorColor')}
                        data={toSelectData(lookups.interiorColors)}
                        disabled={lookupsLoading} clearable searchable
                        {...form.getInputProps('interiorColorTypeId')}
                    />
                </SimpleGrid>

                <Text size="sm" fw={600} mt="xs">{t('features')}</Text>
                <SimpleGrid cols={3}>
                    {FEATURE_FIELDS.map(([field, label]) => (
                        <Checkbox
                            key={field}
                            label={t(label)}
                            checked={form.values[field] as boolean}
                            color="teal"
                            onChange={(e) => form.setFieldValue(field, e.currentTarget.checked)}
                            styles={{ label: { fontSize: 13 } }}
                        />
                    ))}
                </SimpleGrid>

<Text>Images</Text>
                <CarImageUploadPanel
                    images={form.values.carImages as UploadedCarImage[]}
                    onImagesChange={(imgs) => form.setFieldValue('carImages', imgs)}
                />

                <Button
                    variant="filled" color="teal" fullWidth loading={saving}
                    onClick={() => onSave(form.values)}
                >
                    {t('admin.saveCar')}
                </Button>

            </Stack>
        </Modal>
    );
}