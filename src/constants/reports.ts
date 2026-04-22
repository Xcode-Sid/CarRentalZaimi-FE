import type { FC } from 'react';
import {
    IconFileText, IconCar, IconCurrencyEuro, IconUsers, IconCalendar,
} from '@tabler/icons-react';

export const reportCards: readonly { id: string; titleKey: string; descKey: string; icon: FC<any>; color: string }[] = [
    { id: 'revenue', titleKey: 'admin.reports_card_revenue_title', descKey: 'admin.reports_card_revenue_desc', icon: IconCurrencyEuro, color: 'green' },
    { id: 'fleet', titleKey: 'admin.reports_card_fleet_title', descKey: 'admin.reports_card_fleet_desc', icon: IconCar, color: 'teal' },
    { id: 'bookings', titleKey: 'admin.reports_card_bookings_title', descKey: 'admin.reports_card_bookings_desc', icon: IconCalendar, color: 'teal' },
    { id: 'customers', titleKey: 'admin.reports_card_customers_title', descKey: 'admin.reports_card_customers_desc', icon: IconUsers, color: 'blue' },
    { id: 'financial', titleKey: 'admin.reports_card_financial_title', descKey: 'admin.reports_card_financial_desc', icon: IconCurrencyEuro, color: 'orange' },
    { id: 'performance', titleKey: 'admin.reports_card_performance_title', descKey: 'admin.reports_card_performance_desc', icon: IconFileText, color: 'green' },
];
