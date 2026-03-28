import {
  Title,
  Stack,
  SimpleGrid,
  Paper,
  Text,
  Button,
  Group,
  ThemeIcon,
} from '@mantine/core';
import {
  IconFileText,
  IconDownload,
  IconCar,
  IconCurrencyEuro,
  IconUsers,
  IconCalendar,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';

const reportCards = [
  { id: 'revenue', titleKey: 'admin.reports_card_revenue_title', descKey: 'admin.reports_card_revenue_desc', icon: IconCurrencyEuro, color: 'green' },
  { id: 'fleet', titleKey: 'admin.reports_card_fleet_title', descKey: 'admin.reports_card_fleet_desc', icon: IconCar, color: 'teal' },
  { id: 'bookings', titleKey: 'admin.reports_card_bookings_title', descKey: 'admin.reports_card_bookings_desc', icon: IconCalendar, color: 'teal' },
  { id: 'customers', titleKey: 'admin.reports_card_customers_title', descKey: 'admin.reports_card_customers_desc', icon: IconUsers, color: 'blue' },
  { id: 'financial', titleKey: 'admin.reports_card_financial_title', descKey: 'admin.reports_card_financial_desc', icon: IconCurrencyEuro, color: 'orange' },
  { id: 'performance', titleKey: 'admin.reports_card_performance_title', descKey: 'admin.reports_card_performance_desc', icon: IconFileText, color: 'green' },
] as const;

export default function ReportsPage() {
  const { t } = useTranslation();

  const handleDownload = (titleKey: string) => {
    notifications.show({
      message: `${t(titleKey)} — ${t('admin.reports_downloadStarted')}`,
      color: 'teal',
    });
  };

  return (
    <Stack gap="xl" className="animate-fade-in">
      <Title order={2} fw={700}>
        {t('admin.reportsTitle')}
      </Title>
      <Text c="dimmed">{t('admin.reportsDesc')}</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {reportCards.map((report) => (
          <Paper key={report.id} className="glass-card glass-card-hover" p="lg" radius="lg">
            <Stack gap="md">
              <Group>
                <ThemeIcon variant="light" color={report.color} size="lg" radius="md">
                  <report.icon size={20} />
                </ThemeIcon>
                <div>
                  <Text fw={600}>{t(report.titleKey)}</Text>
                  <Text size="xs" c="dimmed">{t(report.descKey)}</Text>
                </div>
              </Group>
              <Button
                variant="light"
                color={report.color}
                leftSection={<IconDownload size={16} />}
                fullWidth
                onClick={() => handleDownload(report.titleKey)}
              >
                {t('admin.reports_downloadPdf')}
              </Button>
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
