import type {
    CarCategory, CarCompanyName, CarCompanyModel, GeneralData,
    FormValues,
} from '../data/vehicles';

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

export const FEATURE_FIELDS: [keyof FormValues, string][] = [
    ['abs', 'vehicle.features.abs'], ['bluetooth', 'vehicle.features.bluetooth'], ['airConditioner', 'vehicle.features.airConditioner'],
    ['gps', 'vehicle.features.gps'], ['camera', 'vehicle.features.camera'], ['heatedSeats', 'vehicle.features.heatedSeats'],
    ['panoramicRoof', 'vehicle.features.panoramicRoof'], ['parkingSensors', 'vehicle.features.parkingSensors'],
    ['cruiseControl', 'vehicle.features.cruiseControl'], ['climateControl', 'vehicle.features.climateControl'],
    ['ledHeadlights', 'vehicle.features.ledHeadlights'], ['appleCarPlay', 'vehicle.features.appleCarPlay'],
    ['androidAuto', 'vehicle.features.androidAuto'], ['laneDepartureAlert', 'vehicle.features.laneDepartureAlert'],
    ['adaptiveCruiseControl', 'vehicle.features.adaptiveCruiseControl'],
    ['toyotaSafetySense', 'vehicle.features.toyotaSafetySense'], ['thirdRowSeats', 'vehicle.features.thirdRowSeats'],
    ['wirelessCharging', 'vehicle.features.wirelessCharging'], ['electricWindows', 'vehicle.features.electricWindows'],
];
