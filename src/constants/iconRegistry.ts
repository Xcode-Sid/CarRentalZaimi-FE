import type { FC } from 'react';
import {
    IconFileText, IconShieldCheck, IconLock, IconKey,
    IconScale, IconBuildingBank, IconUserCheck, IconAlertCircle,
    IconCookie, IconMail, IconPhone, IconGlobe, IconInfoCircle,
    IconClipboardList, IconNotes, IconStarFilled, IconBell,
} from '@tabler/icons-react';

export const POLICY_ICON_MAP: Record<string, FC<{ size?: number; color?: string }>> = {
    'file-text': IconFileText,
    'shield-check': IconShieldCheck,
    'lock': IconLock,
    'key': IconKey,
    'scale': IconScale,
    'building-bank': IconBuildingBank,
    'user-check': IconUserCheck,
    'alert-circle': IconAlertCircle,
    'cookie': IconCookie,
    'mail': IconMail,
    'phone': IconPhone,
    'globe': IconGlobe,
    'info-circle': IconInfoCircle,
    'clipboard-list': IconClipboardList,
    'notes': IconNotes,
    'star': IconStarFilled,
    'bell': IconBell,
};

export const POLICY_ICON_OPTIONS = Object.keys(POLICY_ICON_MAP).map((value) => ({ value, label: value }));

export const SERVICE_ICONS: { value: string; label: string }[] = [
    { value: '🛰️', label: 'services.gpsSatellite' },
    { value: '🪑', label: 'services.babySeat' },
    { value: '🐾', label: 'services.petFriendly' },
    { value: '🛡️', label: 'services.insurance' },
    { value: '⛽', label: 'services.fuelPackage' },
    { value: '🅿️', label: 'services.parking' },
    { value: '🚗', label: 'services.delivery' },
    { value: '🧹', label: 'services.cleaning' },
    { value: '📱', label: 'services.mobileWiFi' },
    { value: '🔑', label: 'services.extraKey' },
    { value: '❄️', label: 'services.acClimate' },
    { value: '🎿', label: 'services.skiRack' },
    { value: '🔧', label: 'services.roadsideAssist' },
    { value: '📷', label: 'services.dashcam' },
    { value: '🎵', label: 'services.soundSystem' },
];

export const WHY_CHOOSE_US_ICONS = [
    { value: '⭐', label: 'whyChooseUs.star' },
    { value: '🚗', label: 'whyChooseUs.car' },
    { value: '🔑', label: 'whyChooseUs.key' },
    { value: '💰', label: 'whyChooseUs.money' },
    { value: '🛡️', label: 'whyChooseUs.shield' },
    { value: '⚡', label: 'whyChooseUs.lightning' },
    { value: '🏆', label: 'whyChooseUs.trophy' },
    { value: '🤝', label: 'whyChooseUs.handshake' },
    { value: '📍', label: 'whyChooseUs.location' },
    { value: '✅', label: 'whyChooseUs.check' },
    { value: '🔧', label: 'whyChooseUs.wrench' },
    { value: '💎', label: 'whyChooseUs.diamond' },
];
