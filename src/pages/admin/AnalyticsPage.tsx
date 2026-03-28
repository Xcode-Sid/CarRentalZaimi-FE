import {
  Title,
  Stack,
  SimpleGrid,
  Paper,
  Text,
  Group,
  ThemeIcon,
  Progress,
} from '@mantine/core';
import {
  IconEye,
  IconUsers,
  IconDeviceMobile,
  IconDeviceDesktop,
  IconWorld,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const trafficKeys = [
  { id: 'google', value: 42, barColor: 'teal' as const },
  { id: 'direct', value: 28, barColor: 'green' as const },
  { id: 'social', value: 18, barColor: 'cyan' as const },
  { id: 'referral', value: 12, barColor: 'blue' as const },
];

const pageViewKeys = [
  { id: 'landing', views: 12500 },
  { id: 'fleet', views: 8200 },
  { id: 'vehicle', views: 6800 },
  { id: 'booking', views: 3400 },
];

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const topStats = [
    { labelKey: 'admin.analytics_totalVisits', value: '32,500', icon: IconEye, color: 'teal' as const },
    { labelKey: 'admin.analytics_uniqueUsers', value: '18,200', icon: IconUsers, color: 'green' as const },
    { labelKey: 'admin.analytics_mobileUsers', value: '58%', icon: IconDeviceMobile, color: 'cyan' as const },
    { labelKey: 'admin.analytics_desktopUsers', value: '42%', icon: IconDeviceDesktop, color: 'blue' as const },
  ];

  return (
    <Stack gap="xl" className="animate-fade-in">
      <Title order={2} fw={700}>
        {t('admin.analyticsTitle')}
      </Title>
      <Text c="dimmed">{t('admin.analyticsDesc')}</Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {topStats.map((stat) => (
          <Paper key={stat.labelKey} className="glass-card" p="lg" radius="lg">
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">{t(stat.labelKey)}</Text>
                <Text size="xl" fw={700}>{stat.value}</Text>
              </div>
              <ThemeIcon variant="light" color={stat.color} size="lg" radius="md">
                <stat.icon size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Paper className="glass-card" p="lg" radius="lg">
          <Text fw={600} mb="md">{t('admin.analytics_trafficSources')}</Text>
          <Stack gap="sm">
            {trafficKeys.map((src) => (
              <div key={src.id}>
                <Group justify="space-between" mb={4}>
                  <Text size="sm">{t(`admin.analytics_source_${src.id}` as const)}</Text>
                  <Text size="sm" fw={500}>{src.value}%</Text>
                </Group>
                <Progress value={src.value} color={src.barColor} size="sm" />
              </div>
            ))}
          </Stack>
        </Paper>

        <Paper className="glass-card" p="lg" radius="lg">
          <Text fw={600} mb="md">{t('admin.analytics_topPages')}</Text>
          <Stack gap="sm">
            {pageViewKeys.map((pv) => (
              <Group key={pv.id} justify="space-between">
                <Group gap="xs">
                  <IconWorld size={16} style={{ opacity: 0.5 }} />
                  <Text size="sm">{t(`admin.analytics_page_${pv.id}` as const)}</Text>
                </Group>
                <Text size="sm" fw={500}>
                  {pv.views.toLocaleString()} {t('admin.analytics_viewsSuffix')}
                </Text>
              </Group>
            ))}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
