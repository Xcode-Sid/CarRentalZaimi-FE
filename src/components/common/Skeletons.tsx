import { Skeleton, SimpleGrid, Stack, Group, Box } from '@mantine/core';

export function VehicleCardSkeleton() {
  return (
    <Box className="glass-card" p="lg" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
      <Skeleton h={200} radius="md" mb="md" />
      <Group justify="space-between" mb="sm">
        <Skeleton w={80} h={22} radius="xl" />
        <Skeleton w={60} h={22} radius="xl" />
      </Group>
      <Skeleton h={20} w="70%" mb="xs" />
      <Skeleton h={16} w="40%" mb="md" />
      <Group gap="lg" mb="md">
        <Skeleton w={40} h={14} />
        <Skeleton w={60} h={14} />
        <Skeleton w={50} h={14} />
      </Group>
      <Group grow>
        <Skeleton h={36} radius="md" />
        <Skeleton h={36} radius="md" />
      </Group>
    </Box>
  );
}

export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </SimpleGrid>
  );
}

export function DashboardSkeleton() {
  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="glass-card" p="lg" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
            <Group justify="space-between" mb="xs">
              <Skeleton w={120} h={16} />
              <Skeleton w={40} h={40} radius="md" />
            </Group>
            <Skeleton w={80} h={32} mb="xs" />
            <Skeleton w={140} h={14} />
          </Box>
        ))}
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Skeleton h={300} radius="lg" />
        <Skeleton h={300} radius="lg" />
      </SimpleGrid>
    </Stack>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Stack gap="sm">
      <Skeleton h={40} radius="md" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} h={50} radius="sm" />
      ))}
    </Stack>
  );
}
