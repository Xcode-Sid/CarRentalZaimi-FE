import type { FC } from 'react';
import { IconCar, IconCalendarEvent, IconKey } from '@tabler/icons-react';
import {
    IconBrandFacebook, IconBrandInstagram,
    IconBrandTwitter, IconBrandYoutube,
} from '@tabler/icons-react';

export const HOW_IT_WORKS_STEPS: { icon: FC<any>; titleKey: string; descKey: string; color: string }[] = [
    { icon: IconCar, titleKey: 'howItWorks.step1Title', descKey: 'howItWorks.step1Desc', color: 'teal' },
    { icon: IconCalendarEvent, titleKey: 'howItWorks.step2Title', descKey: 'howItWorks.step2Desc', color: 'teal' },
    { icon: IconKey, titleKey: 'howItWorks.step3Title', descKey: 'howItWorks.step3Desc', color: 'green' },
];

export const SOCIAL_ICONS: { Icon: FC<any>; color: string; label: string }[] = [
    { Icon: IconBrandFacebook, color: 'blue', label: 'Facebook' },
    { Icon: IconBrandInstagram, color: 'pink', label: 'Instagram' },
    { Icon: IconBrandTwitter, color: 'cyan', label: 'Twitter' },
    { Icon: IconBrandYoutube, color: 'red', label: 'YouTube' },
];

export const LANGUAGES = [
    { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export const FEATURED_LIMIT = 4;

export const AUTO_PLAY_MS = 5000;

export const ANIMATION_DIRECTION_OFFSET: Record<string, { x: number; y: number }> = {
    up: { x: 0, y: 40 },
    down: { x: 0, y: -40 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
};
