import { toImagePath } from "../utils/general";

export interface GeneralData {
  id: string;
  name: string;
  createdAt: string;
}

export interface CarCategory extends GeneralData {
  description?: string;
}

export interface CarCompanyName extends GeneralData {
  models?: CarCompanyModel[];
}

export interface CarCompanyModel extends GeneralData {
 id: string;
    name: string;
    carCompanyName: { id: string; name: string; };
}

export interface VehicleImage {
  name: string | null;
  data: string | null; // base64
  isPrimary: boolean;
}
export interface Vehicle {
  carId: string;
  title: string;
  description: string;
  year: number;
  licensePlate: string | null;
  pricePerDay: number;
  seats: number;
  doors: number;
  mileage: string | null;
  horsePower: number | null;

  categoryId: string | null;
  categoryName: string | null;
  nameId: string | null;
  carName: string | null;
  modelId: string | null;
  modelName: string | null;
  transmissionTypeId: string | null;
  transmissionType: string | null;
  fuelTypeId: string | null;
  fuelType: string | null;
  exteriorColorTypeId: string | null;
  exteriorColor: string | null;
  interiorColorTypeId: string | null;
  interiorColor: string | null;

  abs: boolean | null;
  bluetooth: boolean | null;
  airConditioner: boolean | null;
  gps: boolean | null;
  camera: boolean | null;
  heatedSeats: boolean | null;
  panoramicRoof: boolean | null;
  parkingSensors: boolean | null;
  cruiseControl: boolean | null;
  climateControl: boolean | null;
  ledHeadlights: boolean | null;
  appleCarPlay: boolean | null;
  androidAuto: boolean | null;
  laneDepartureAlert: boolean | null;
  adaptiveCruiseControl: boolean | null;
  toyotaSafetySense: boolean | null;
  thirdRowSeats: boolean | null;
  wirelessCharging: boolean | null;
  electricWindows: boolean | null;

  carImages: VehicleImage[];
}


export type FormValues = {
  title: string;
  description: string;
  year: number;
  licensePlate: string | null;
  pricePerDay: number;
  seats: number;
  doors: number;
  mileage: string | null;
  horsePower: number | null;
  categoryId: string | null;
  nameId: string | null;
  modelId: string | null;
  transmissionTypeId: string | null;
  fuelTypeId: string | null;
  exteriorColorTypeId: string | null;
  interiorColorTypeId: string | null;
  abs: boolean;
  bluetooth: boolean;
  airConditioner: boolean;
  gps: boolean;
  camera: boolean;
  heatedSeats: boolean;
  panoramicRoof: boolean;
  parkingSensors: boolean;
  cruiseControl: boolean;
  climateControl: boolean;
  ledHeadlights: boolean;
  appleCarPlay: boolean;
  androidAuto: boolean;
  laneDepartureAlert: boolean;
  adaptiveCruiseControl: boolean;
  toyotaSafetySense: boolean;
  thirdRowSeats: boolean;
  wirelessCharging: boolean;
  electricWindows: boolean;
    carImages: VehicleImage[];
};

export function mapApiCarToVehicle(apiCar: any): Vehicle {
  return {
    carId: apiCar.id,
    title: apiCar.title,
    description: apiCar.description,
    year: apiCar.year,
    licensePlate: apiCar.licensePlate,
    pricePerDay: apiCar.pricePerDay,
    seats: apiCar.seats,
    doors: apiCar.doors,
    mileage: apiCar.mileage,
    horsePower: apiCar.horsePower,

    categoryId: apiCar.category?.id ?? null,
    categoryName: apiCar.category?.name ?? null,

    nameId: apiCar.name?.id ?? null,
    carName: apiCar.name?.name ?? null,

    modelId: apiCar.model?.id ?? null,
    modelName: apiCar.model?.name ?? null,

    transmissionTypeId: apiCar.transmissionType?.id ?? null,
    transmissionType: apiCar.transmissionType?.name ?? null,

    fuelTypeId: apiCar.fuelType?.id ?? null,
    fuelType: apiCar.fuelType?.name ?? null,

    exteriorColorTypeId: apiCar.exteriorColorType?.id ?? null,
    exteriorColor: apiCar.exteriorColorType?.name ?? null,

    interiorColorTypeId: apiCar.interiorColorType?.id ?? null,
    interiorColor: apiCar.interiorColorType?.name ?? null,

    abs: apiCar.abs,
    bluetooth: apiCar.bluetooth,
    airConditioner: apiCar.airConditioner,
    gps: apiCar.gps,
    camera: apiCar.camera,
    heatedSeats: apiCar.heatedSeats,
    panoramicRoof: apiCar.panoramicRoof,
    parkingSensors: apiCar.parkingSensors,
    cruiseControl: apiCar.cruiseControl,
    climateControl: apiCar.climateControl,
    ledHeadlights: apiCar.ledHeadlights,
    appleCarPlay: apiCar.appleCarPlay,
    androidAuto: apiCar.androidAuto,
    laneDepartureAlert: apiCar.laneDepartureAlert,
    adaptiveCruiseControl: apiCar.adaptiveCruiseControl,
    toyotaSafetySense: apiCar.toyotaSafetySense,
    thirdRowSeats: apiCar.thirdRowSeats,
    wirelessCharging: apiCar.wirelessCharging,
    electricWindows: apiCar.electricWindows,

    carImages: (apiCar.carImages ?? []).map((img: any) => ({
      id: img.id,
      name: img.imageName,
      data: toImagePath(img.imagePath),
      isPrimary: img.isPrimary,
    })),
  };
}


export const vehicles: Vehicle[] = [
  {
    carId: '1',
    title: 'Mercedes-Benz S-Class',
    description: 'Mercedes-Benz S-Class është ikona e luksit në botën e automobilave. Me teknologjinë më të fundit dhe komoditetin e pakrahasueshëm, kjo makinë ofron një eksperiencë drejtuese të jashtëzakonshme.',
    year: 2024,
    licensePlate: null,
    pricePerDay: 150,
    seats: 5,
    doors: 4,
    mileage: '1,200 km',
    horsePower: 450,
    categoryId: '1', categoryName: 'Luksoze',
    nameId: '1', carName: 'Mercedes-Benz',
    modelId: '1', modelName: 'S-Class',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '1', fuelType: 'Benzinë',
    exteriorColorTypeId: '1', exteriorColor: 'E zezë',
    interiorColorTypeId: '1', interiorColor: 'E zezë',
    abs: true, bluetooth: true, airConditioner: true, gps: true,
    camera: true, heatedSeats: true, panoramicRoof: true,
    parkingSensors: true, cruiseControl: true, climateControl: true,
    ledHeadlights: true, appleCarPlay: false, androidAuto: false,
    laneDepartureAlert: false, adaptiveCruiseControl: false,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: true, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '2',
    title: 'BMW X5',
    description: 'BMW X5 kombinon luksin me aftësinë e lartë off-road. Me motorr të fuqishëm dhe teknologji të avancuar, është SUV-ja perfekte për familjen.',
    year: 2023,
    licensePlate: null,
    pricePerDay: 95,
    seats: 7,
    doors: 5,
    mileage: '18,500 km',
    horsePower: 340,
    categoryId: '2', categoryName: 'SUV',
    nameId: '2', carName: 'BMW',
    modelId: '2', modelName: 'X5',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '2', fuelType: 'Diesel',
    exteriorColorTypeId: '2', exteriorColor: 'Blu Alpine',
    interiorColorTypeId: '2', interiorColor: 'Bezhë',
    abs: true, bluetooth: true, airConditioner: true, gps: true,
    camera: true, heatedSeats: true, panoramicRoof: true,
    parkingSensors: true, cruiseControl: false, climateControl: true,
    ledHeadlights: true, appleCarPlay: true, androidAuto: false,
    laneDepartureAlert: false, adaptiveCruiseControl: false,
    toyotaSafetySense: false, thirdRowSeats: true,
    wirelessCharging: false, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '3',
    title: 'Tesla Model 3',
    description: 'Tesla Model 3 është e ardhmja e automobilave elektrike. Me performancë të shkëlqyer, autonomi të gjatë dhe zero emetime, kjo makinë ofron drejtim inteligjent.',
    year: 2024,
    licensePlate: null,
    pricePerDay: 75,
    seats: 5,
    doors: 4,
    mileage: '500 km',
    horsePower: 350,
    categoryId: '3', categoryName: 'Elektrike',
    nameId: '3', carName: 'Tesla',
    modelId: '3', modelName: 'Model 3',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '3', fuelType: 'Elektrik',
    exteriorColorTypeId: '3', exteriorColor: 'E bardhë',
    interiorColorTypeId: '3', interiorColor: 'E bardhë',
    abs: true, bluetooth: true, airConditioner: true, gps: true,
    camera: true, heatedSeats: false, panoramicRoof: true,
    parkingSensors: true, cruiseControl: true, climateControl: true,
    ledHeadlights: true, appleCarPlay: false, androidAuto: false,
    laneDepartureAlert: true, adaptiveCruiseControl: true,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: true, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '4',
    title: 'Audi A4',
    description: 'Audi A4 ofron cilësi gjermane me çmim të arsyeshëm. Makina ideale për udhëtime të gjata me komoditet dhe eficencë karburanti.',
    year: 2022,
    licensePlate: null,
    pricePerDay: 45,
    seats: 5,
    doors: 4,
    mileage: '32,000 km',
    horsePower: 190,
    categoryId: '4', categoryName: 'Ekonomike',
    nameId: '4', carName: 'Audi',
    modelId: '4', modelName: 'A4',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '1', fuelType: 'Benzinë',
    exteriorColorTypeId: '4', exteriorColor: 'Gri',
    interiorColorTypeId: '4', interiorColor: 'Gri',
    abs: true, bluetooth: true, airConditioner: true, gps: false,
    camera: false, heatedSeats: false, panoramicRoof: false,
    parkingSensors: true, cruiseControl: true, climateControl: true,
    ledHeadlights: true, appleCarPlay: false, androidAuto: false,
    laneDepartureAlert: false, adaptiveCruiseControl: false,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: false, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '5',
    title: 'Range Rover Sport',
    description: 'Range Rover Sport është SUV-ja premium që kombinon elegancën me fuqinë. Me kapacitet të jashtëzakonshëm off-road dhe brendësi luksoze.',
    year: 2024,
    licensePlate: null,
    pricePerDay: 180,
    seats: 5,
    doors: 5,
    mileage: '3,500 km',
    horsePower: 400,
    categoryId: '2', categoryName: 'SUV',
    nameId: '5', carName: 'Range Rover',
    modelId: '5', modelName: 'Sport',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '1', fuelType: 'Benzinë',
    exteriorColorTypeId: '3', exteriorColor: 'E bardhë',
    interiorColorTypeId: '5', interiorColor: 'Kafe',
    abs: true, bluetooth: true, airConditioner: true, gps: true,
    camera: true, heatedSeats: true, panoramicRoof: true,
    parkingSensors: true, cruiseControl: true, climateControl: true,
    ledHeadlights: true, appleCarPlay: true, androidAuto: true,
    laneDepartureAlert: true, adaptiveCruiseControl: true,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: true, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1519245659620-e859806a8d7b?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '6',
    title: 'Mercedes-Benz GLE',
    description: 'Mercedes-Benz GLE kombinon komoditetin e klasës S me hapësirën e një SUV-je. Perfekte për pushime familjare në bregdetin shqiptar.',
    year: 2023,
    licensePlate: null,
    pricePerDay: 120,
    seats: 5,
    doors: 5,
    mileage: '22,000 km',
    horsePower: 272,
    categoryId: '2', categoryName: 'SUV',
    nameId: '1', carName: 'Mercedes-Benz',
    modelId: '6', modelName: 'GLE',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '2', fuelType: 'Diesel',
    exteriorColorTypeId: '5', exteriorColor: 'Gri grafiti',
    interiorColorTypeId: '1', interiorColor: 'E zezë',
    abs: true, bluetooth: true, airConditioner: true, gps: true,
    camera: true, heatedSeats: true, panoramicRoof: false,
    parkingSensors: true, cruiseControl: false, climateControl: true,
    ledHeadlights: true, appleCarPlay: false, androidAuto: false,
    laneDepartureAlert: false, adaptiveCruiseControl: false,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: true, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1520050206757-308e44060486?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '7',
    title: 'Volkswagen Golf',
    description: 'Volkswagen Golf është makina më e popullarizuar në Europë. Efikase, e besueshme dhe argëtuese për drejtim. Çmimi ideal për buxhetin tuaj.',
    year: 2023,
    licensePlate: null,
    pricePerDay: 35,
    seats: 5,
    doors: 5,
    mileage: '15,000 km',
    horsePower: 150,
    categoryId: '4', categoryName: 'Ekonomike',
    nameId: '6', carName: 'Volkswagen',
    modelId: '7', modelName: 'Golf',
    transmissionTypeId: '2', transmissionType: 'Manual',
    fuelTypeId: '1', fuelType: 'Benzinë',
    exteriorColorTypeId: '6', exteriorColor: 'E kuqe',
    interiorColorTypeId: '4', interiorColor: 'Gri',
    abs: true, bluetooth: true, airConditioner: true, gps: false,
    camera: false, heatedSeats: false, panoramicRoof: false,
    parkingSensors: false, cruiseControl: true, climateControl: true,
    ledHeadlights: false, appleCarPlay: true, androidAuto: true,
    laneDepartureAlert: false, adaptiveCruiseControl: false,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: false, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173c8?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format', isPrimary: false },
    ],
  },
  {
    carId: '8',
    title: 'BMW i4',
    description: 'BMW i4 është Gran Coupe elektrik me performancë sportive. Kombinon ADN-në e BMW me teknologjinë elektrike të së ardhmes.',
    year: 2024,
    licensePlate: null,
    pricePerDay: 85,
    seats: 5,
    doors: 4,
    mileage: '2,100 km',
    horsePower: 340,
    categoryId: '3', categoryName: 'Elektrike',
    nameId: '2', carName: 'BMW',
    modelId: '8', modelName: 'i4',
    transmissionTypeId: '1', transmissionType: 'Automatik',
    fuelTypeId: '3', fuelType: 'Elektrik',
    exteriorColorTypeId: '2', exteriorColor: 'Blu',
    interiorColorTypeId: '1', interiorColor: 'E zezë',
    abs: true, bluetooth: true, airConditioner: true, gps: true,
    camera: true, heatedSeats: true, panoramicRoof: false,
    parkingSensors: true, cruiseControl: true, climateControl: true,
    ledHeadlights: true, appleCarPlay: true, androidAuto: true,
    laneDepartureAlert: true, adaptiveCruiseControl: true,
    toyotaSafetySense: false, thirdRowSeats: false,
    wirelessCharging: true, electricWindows: true,
    carImages: [
      { name: 'front', data: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&auto=format', isPrimary: true },
      { name: 'side', data: 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&auto=format', isPrimary: false },
      { name: 'interior', data: 'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&auto=format', isPrimary: false },
    ],
  },
]