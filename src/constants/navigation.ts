import type { FC } from 'react';
import {
    IconUser, IconDeviceFloppy, IconCalendar, IconSettings,
    IconDashboard, IconCar, IconUsers, IconChartBar, IconFileText,
    IconAd, IconClipboardList, IconRosetteDiscount, IconLayoutGrid,
    IconStar, IconBriefcase, IconFileCheck, IconShieldCheck,
    IconMailbox, IconCalendarOff, IconPhone, IconBell, IconBug,
} from '@tabler/icons-react';

export const accountNavItems: { path: string; icon: FC<any>; labelKey: string }[] = [
    { path: '/account/dashboard', icon: IconDashboard, labelKey: 'account.dashboard' },
    { path: '/account/profile', icon: IconUser, labelKey: 'account.profile' },
    { path: '/account/saved', icon: IconDeviceFloppy, labelKey: 'account.savedCars' },
    { path: '/account/bookings', icon: IconCalendar, labelKey: 'account.myBookings' },
    { path: '/account/settings', icon: IconSettings, labelKey: 'account.settings' },
    { path: '/account/notifications', icon: IconBell, labelKey: 'account.notifications' },
];

export const adminNavItems: { path: string; icon: FC<any>; labelKey: string; badge: string | null }[] = [
    { path: '/admin', icon: IconDashboard, labelKey: 'admin.dashboard', badge: null },
    { path: '/admin/car-data', icon: IconClipboardList, labelKey: 'admin.carDatas', badge: null },
    { path: '/admin/cars', icon: IconCar, labelKey: 'admin.cars', badge: null },
    { path: '/admin/featured_cars', icon: IconStar, labelKey: 'admin.featuredCars', badge: null },
    { path: '/admin/bookings', icon: IconCalendar, labelKey: 'admin.bookings', badge: null },
    { path: '/admin/promotion', icon: IconRosetteDiscount, labelKey: 'admin.promotions', badge: null },
    { path: '/admin/additional-services', icon: IconLayoutGrid, labelKey: 'admin.aditionalServices', badge: null },
    { path: '/admin/customers', icon: IconUsers, labelKey: 'admin.customers', badge: null },
    { path: '/admin/partners', icon: IconBriefcase, labelKey: 'admin.partners', badge: null },
    { path: '/admin/terms', icon: IconFileCheck, labelKey: 'admin.terms', badge: null },
    { path: '/admin/privacies', icon: IconShieldCheck, labelKey: 'admin.privacies', badge: null },
    { path: '/admin/settings', icon: IconSettings, labelKey: 'admin.settings', badge: null },
    { path: '/admin/subscriptions', icon: IconMailbox, labelKey: 'admin.subscriptions', badge: null },
    { path: '/admin/occupiedDays', icon: IconCalendarOff, labelKey: 'admin.occupiedDays', badge: null },
    { path: '/admin/statePrefixes', icon: IconPhone, labelKey: 'admin.statePrefixes', badge: null },
    { path: '/admin/ads', icon: IconAd, labelKey: 'admin.ads', badge: null },
    { path: '/admin/analytics', icon: IconChartBar, labelKey: 'admin.analytics', badge: null },
    { path: '/admin/reports', icon: IconFileText, labelKey: 'admin.reports', badge: null },
    { path: '/admin/notifications', icon: IconBell, labelKey: 'admin.notificationsTitle', badge: null },
    { path: '/admin/logs', icon: IconBug, labelKey: 'admin.logs', badge: null },
];
