import type { FC } from 'react';
import {
    IconBuildingStore, IconBriefcase, IconStarFilled,
    IconClock, IconShare,
} from '@tabler/icons-react';
import type { WhyChooseUsItem, WorkingHoursEntry } from '../types/company';

export interface AdminSettingsFormValues {
    name: string;
    tagline: string;
    logoUrl: string;
    email: string;
    phone: string;
    address: string;
    aboutText: string;
    missionTitle: string;
    missionDescription: string;
    whyChooseUs: WhyChooseUsItem[];
    workingHours: WorkingHoursEntry[];
    facebookUrl: string;
    instagramUrl: string;
    twiterUrl: string;
    youtubeUrl: string;
    whatsAppNumber: string;
    years: number;
    cars: number;
    cities: number;
    clients: number;
}

export const DAYS = ['common.monday', 'common.tuesday', 'common.wednesday', 'common.thursday', 'common.friday', 'common.saturday', 'common.sunday'];

export const ADMIN_SETTINGS_INITIAL_VALUES: AdminSettingsFormValues = {
    name: '',
    tagline: '',
    logoUrl: '',
    email: '',
    phone: '',
    address: '',
    aboutText: '',
    missionTitle: '',
    missionDescription: '',
    whyChooseUs: [{ icon: '⭐', title: '', description: '' }],
    workingHours: [],
    facebookUrl: '',
    instagramUrl: '',
    twiterUrl: '',
    youtubeUrl: '',
    whatsAppNumber: '',
    years: 0,
    cars: 0,
    cities: 0,
    clients: 0,
};

export const STEPS: { id: number; label: string; description: string; icon: FC<any>; color: string }[] = [
    { id: 0, label: 'admin.steps.platform', description: 'admin.steps.platformDesc', icon: IconBuildingStore, color: 'teal' },
    { id: 1, label: 'admin.steps.mission', description: 'admin.steps.missionDesc', icon: IconBriefcase, color: 'blue' },
    { id: 2, label: 'admin.steps.whyUs', description: 'admin.steps.whyUsDesc', icon: IconStarFilled, color: 'yellow' },
    { id: 3, label: 'admin.steps.hours', description: 'admin.steps.hoursDesc', icon: IconClock, color: 'violet' },
    { id: 4, label: 'admin.steps.social', description: 'admin.steps.socialDesc', icon: IconShare, color: 'pink' },
];

export const STEP_FIELDS: Record<number, (keyof AdminSettingsFormValues | string)[]> = {
    0: ['name', 'email', 'phone', 'address'],
    1: [],
    2: [],
    3: [],
    4: [],
};

export const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};
