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
  id: string; 
  title: string;
  description: string;
  year: number;
  licensePlate: string | null;
  pricePerDay: number;
  seats: number;
  doors: number;
  mileage: string | null;
  horsePower: number | null;
  isRecommended: boolean;
  status: 'available' | 'maintenance' | 'unavailable' | null;
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
  totalReviews: number | null;
  isSaved: boolean;
  carImages: VehicleImage[];
  image: string | null; // Primary image URL for backwards compatibility
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
  const carImages = (apiCar.carImages ?? []).map((img: any) => ({
    id: img.id,
    name: img.imageName,
    data: toImagePath(img.imagePath),
    isPrimary: img.isPrimary,
  }));

  const primaryImage = carImages.find((img: VehicleImage) => img.isPrimary)?.data ?? carImages[0]?.data ?? null;

  return {
    carId: apiCar.id,
    id: apiCar.id, // Alias for backwards compatibility
    title: apiCar.title,
    description: apiCar.description,
    year: apiCar.year,
    licensePlate: apiCar.licensePlate,
    pricePerDay: apiCar.pricePerDay,
    seats: apiCar.seats,
    doors: apiCar.doors,
    mileage: apiCar.mileage,
    horsePower: apiCar.horsePower,
    status: apiCar.status ?? 'available',

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

    isRecommended: apiCar.isRecommended,
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
    totalReviews: apiCar.totalReviews,
    isSaved: apiCar.isSaved,
    carImages,
    image: primaryImage, // Primary image for backwards compatibility
  };
}

