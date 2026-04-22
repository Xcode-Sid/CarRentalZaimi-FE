import type { FC } from 'react';
import { IconDiamond, IconCar, IconBolt, IconPigMoney } from '@tabler/icons-react';

export const DEBOUNCE_MS = 400;

export const categoryIcons: Record<string, FC<any>> = {
    Luksoze: IconDiamond,
    SUV: IconCar,
    Elektrike: IconBolt,
    Ekonomike: IconPigMoney,
};
