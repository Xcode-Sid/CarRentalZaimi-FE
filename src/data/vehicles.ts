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
  carCompanyNameId: string;
  carCompanyName?: string;
}


export interface VehicleSpecs {
  seats: number;
  engine: string;
  transmission: string;
  fuel: string;
  mileage: string;
  color: string;
  doors: number;
}

export interface Vehicle {
  id: number;
  name: string;
  year: number;
  category: 'Luksoze' | 'SUV' | 'Elektrike' | 'Ekonomike';
  price: number;
  status: 'available' | 'maintenance' | 'unavailable';
  description: string;
  image: string;
  images: string[];
  specs: VehicleSpecs;
  features: string[];
  isFeatured: boolean;
}

export const vehicles: Vehicle[] = [
  {
    id: 1,
    name: 'Mercedes-Benz S-Class',
    year: 2024,
    category: 'Luksoze',
    price: 150,
    status: 'available',
    description:
      'Mercedes-Benz S-Class është ikona e luksit në botën e automobilave. Me teknologjinë më të fundit dhe komoditetin e pakrahasueshëm, kjo makinë ofron një eksperiencë drejtuese të jashtëzakonshme.',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format',
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&auto=format',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format',
    ],
    specs: { seats: 5, engine: '3.0L V6 Turbo', transmission: 'Automatik', fuel: 'Benzinë', mileage: '1,200 km', color: 'E zezë', doors: 4 },
    features: ['ABS', 'Bluetooth', 'Parking Sensors', 'Heated Seats', 'Sunroof', 'Leather Interior', 'Navigation', 'Cruise Control', 'LED Headlights', 'Wireless Charging'],
    isFeatured: true,
  },
  {
    id: 2,
    name: 'BMW X5',
    year: 2023,
    category: 'SUV',
    price: 95,
    status: 'available',
    description:
      'BMW X5 kombinon luksin me aftësinë e lartë off-road. Me motorr të fuqishëm dhe teknologji të avancuar, është SUV-ja perfekte për familjen.',
    image: 'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800&auto=format',
      'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format',
    ],
    specs: { seats: 7, engine: '3.0L I6 Turbo', transmission: 'Automatik', fuel: 'Diesel', mileage: '18,500 km', color: 'Blu Alpine', doors: 5 },
    features: ['ABS', 'Bluetooth', 'Parking Sensors', 'Heated Seats', 'Panoramic Roof', 'Third Row Seats', 'Navigation', 'Apple CarPlay'],
    isFeatured: true,
  },
  {
    id: 3,
    name: 'Tesla Model 3',
    year: 2024,
    category: 'Elektrike',
    price: 75,
    status: 'available',
    description:
      'Tesla Model 3 është e ardhmja e automobilave elektrike. Me performancë të shkëlqyer, autonomi të gjatë dhe zero emetime, kjo makinë ofron drejtim inteligjent.',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&auto=format',
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&auto=format',
      'https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=800&auto=format',
    ],
    specs: { seats: 5, engine: 'Electric Motor', transmission: 'Automatik', fuel: 'Elektrik', mileage: '500 km', color: 'E bardhë', doors: 4 },
    features: ['Autopilot', 'Touchscreen 15"', 'Over-the-Air Updates', 'Sentry Mode', 'Supercharging', 'Glass Roof', 'Wireless Charging'],
    isFeatured: true,
  },
  {
    id: 4,
    name: 'Audi A4',
    year: 2022,
    category: 'Ekonomike',
    price: 45,
    status: 'available',
    description:
      'Audi A4 ofron cilësi gjermane me çmim të arsyeshëm. Makina ideale për udhëtime të gjata me komoditet dhe eficencë karburanti.',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format',
      'https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=800&auto=format',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format',
    ],
    specs: { seats: 5, engine: '2.0L TFSI', transmission: 'Automatik', fuel: 'Benzinë', mileage: '32,000 km', color: 'Gri', doors: 4 },
    features: ['ABS', 'Bluetooth', 'Parking Sensors', 'Cruise Control', 'Climate Control', 'LED Headlights'],
    isFeatured: false,
  },
  {
    id: 5,
    name: 'Range Rover Sport',
    year: 2024,
    category: 'SUV',
    price: 180,
    status: 'maintenance',
    description:
      'Range Rover Sport është SUV-ja premium që kombinon elegancën me fuqinë. Me kapacitet të jashtëzakonshëm off-road dhe brendësi luksoze.',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&auto=format',
      'https://images.unsplash.com/photo-1519245659620-e859806a8d7b?w=800&auto=format',
      'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&auto=format',
    ],
    specs: { seats: 5, engine: '3.0L V6 Supercharged', transmission: 'Automatik', fuel: 'Benzinë', mileage: '3,500 km', color: 'E bardhë', doors: 5 },
    features: ['ABS', 'Terrain Response', 'Air Suspension', 'Meridian Sound', 'Heated Steering', 'Panoramic Roof', 'Navigation', '360 Camera'],
    isFeatured: true,
  },
  {
    id: 6,
    name: 'Mercedes-Benz GLE',
    year: 2023,
    category: 'SUV',
    price: 120,
    status: 'available',
    description:
      'Mercedes-Benz GLE kombinon komoditetin e klasës S me hapësirën e një SUV-je. Perfekte për pushime familjare në bregdetin shqiptar.',
    image: 'https://images.unsplash.com/photo-1520050206757-308e44060486?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1520050206757-308e44060486?w=800&auto=format',
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format',
    ],
    specs: { seats: 5, engine: '2.0L I4 Turbo', transmission: 'Automatik', fuel: 'Diesel', mileage: '22,000 km', color: 'Gri grafiti', doors: 5 },
    features: ['ABS', 'MBUX System', 'Burmester Sound', 'Heated Seats', 'Parking Assist', 'LED Headlights', 'Wireless Charging'],
    isFeatured: false,
  },
  {
    id: 7,
    name: 'Volkswagen Golf',
    year: 2023,
    category: 'Ekonomike',
    price: 35,
    status: 'available',
    description:
      'Volkswagen Golf është makina më e popullarizuar në Europë. Efikase, e besueshme dhe argëtuese për drejtim. Çmimi ideal për buxhetin tuaj.',
    image: 'https://images.unsplash.com/photo-1471444928139-48c5bf5173c8?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1471444928139-48c5bf5173c8?w=800&auto=format',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format',
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format',
    ],
    specs: { seats: 5, engine: '1.5L TSI', transmission: 'Manual', fuel: 'Benzinë', mileage: '15,000 km', color: 'E kuqe', doors: 5 },
    features: ['ABS', 'Bluetooth', 'Apple CarPlay', 'Android Auto', 'Climate Control', 'Cruise Control'],
    isFeatured: false,
  },
  {
    id: 8,
    name: 'BMW i4',
    year: 2024,
    category: 'Elektrike',
    price: 85,
    status: 'available',
    description:
      'BMW i4 është Gran Coupe elektrik me performancë sportive. Kombinon ADN-në e BMW me teknologjinë elektrike të së ardhmes.',
    image: 'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1617886903355-9354bb57751f?w=800&auto=format',
      'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=800&auto=format',
      'https://images.unsplash.com/photo-1622185135505-2d795003994a?w=800&auto=format',
    ],
    specs: { seats: 5, engine: 'Electric Motor 340hp', transmission: 'Automatik', fuel: 'Elektrik', mileage: '2,100 km', color: 'Blu', doors: 4 },
    features: ['iDrive 8', 'Curved Display', 'Wireless Charging', 'Harman Kardon', 'Driving Assistant', 'Parking Assistant Plus', 'Sport Boost'],
    isFeatured: false,
  },
  {
    id: 9,
    name: 'Audi Q7',
    year: 2023,
    category: 'Luksoze',
    price: 140,
    status: 'available',
    description:
      'Audi Q7 ofron hapësirë dhe komoditet premium me teknologji Quattro. SUV-ja luksoze perfekte për familje dhe udhëtime të gjata.',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&auto=format',
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format',
      'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=800&auto=format',
    ],
    specs: { seats: 7, engine: '3.0L V6 TDI', transmission: 'Automatik', fuel: 'Diesel', mileage: '28,000 km', color: 'E zezë', doors: 5 },
    features: ['ABS', 'Quattro AWD', 'Matrix LED', 'Bang & Olufsen', 'Virtual Cockpit', 'Air Suspension', 'Third Row', 'Panoramic Roof'],
    isFeatured: false,
  },
  {
    id: 10,
    name: 'Toyota Camry',
    year: 2023,
    category: 'Ekonomike',
    price: 40,
    status: 'unavailable',
    description:
      'Toyota Camry është sedan i besueshëm dhe ekonomik. Me motorr hibrid dhe komoditet të lartë, kjo makinë ofron vlerën më të mirë për paranë.',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&auto=format',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format',
    ],
    specs: { seats: 5, engine: '2.5L Hybrid', transmission: 'CVT', fuel: 'Hibrid', mileage: '41,000 km', color: 'Argjendi', doors: 4 },
    features: ['ABS', 'Toyota Safety Sense', 'Apple CarPlay', 'Android Auto', 'Adaptive Cruise Control', 'Lane Departure Alert'],
    isFeatured: false,
  },
];
