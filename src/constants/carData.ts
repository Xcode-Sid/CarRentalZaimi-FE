export type TabKey =
    | 'categories'
    | 'companyNames'
    | 'companyModels'
    | 'exteriorColors'
    | 'fuels'
    | 'interiorColors'
    | 'transmissions';

export const ENDPOINTS: Record<TabKey, string> = {
    categories: 'CarCategory',
    companyNames: 'CarCompanyName',
    companyModels: 'CarCompanyModel',
    exteriorColors: 'CarExteriorColor',
    fuels: 'CarFuel',
    interiorColors: 'CarInteriorColor',
    transmissions: 'CarTransmission',
};

export const TABS: { key: TabKey; labelKey: string; color: string }[] = [
    { key: 'categories', labelKey: 'carData.tabs.categories', color: 'teal' },
    { key: 'companyNames', labelKey: 'carData.tabs.companyNames', color: 'blue' },
    { key: 'companyModels', labelKey: 'carData.tabs.companyModels', color: 'violet' },
    { key: 'exteriorColors', labelKey: 'carData.tabs.exteriorColors', color: 'orange' },
    { key: 'fuels', labelKey: 'carData.tabs.fuels', color: 'pink' },
    { key: 'interiorColors', labelKey: 'carData.tabs.interiorColors', color: 'yellow' },
    { key: 'transmissions', labelKey: 'carData.tabs.transmissions', color: 'teal' },
];
