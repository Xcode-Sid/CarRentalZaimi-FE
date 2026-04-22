import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Center, Loader, Text, Button, Container, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { VehicleDetailView } from '../components/vehicle/VehicleDetailView';
import { get } from '../utils/api.utils';
import { mapApiCarToVehicle, type Vehicle } from '../data/vehicles';

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [similarVehicles, setSimilarVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No vehicle ID provided.');
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await get(`Cars/${id}`);
        if (res.success && res.data) {
          const mapped = mapApiCarToVehicle(res.data);
          setVehicle(mapped);

          if (mapped.categoryId) {
            try {
              const similarRes = await get(
                `Cars?pageNr=1&pageSize=5&categoryId=${mapped.categoryId}`,
              );
              if (similarRes.success) {
                const items: any[] = similarRes.data?.items ?? [];
                setSimilarVehicles(
                  items
                    .filter((c: any) => c.id !== id)
                    .slice(0, 4)
                    .map(mapApiCarToVehicle),
                );
              }
            } catch {
              // Similar vehicles are non-critical — fail silently
            }
          }
        } else {
          setError('Vehicle not found.');
        }
      } catch {
        setError('Failed to load vehicle. Is the API running?');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return (
      <Center style={{ minHeight: '60vh', padding: '40px 16px' }}>
        <Loader color="teal" size="lg" />
      </Center>
    );
  }

  if (error || !vehicle) {
    return (
      <Container size="sm" px="md" py={60}>
        <Stack align="center" gap="md">
          <Text c="red" ta="center" size="md">
            {error ?? 'Vehicle not found.'}
          </Text>
          <Button
            variant="light"
            color="teal"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/fleet')}
            fullWidth={false}
            style={{ minWidth: 160 }}
          >
            {t('nav.fleet')}
          </Button>
        </Stack>
      </Container>
    );
  }

  return (
    <VehicleDetailView
      vehicle={vehicle}
      similarVehicles={similarVehicles}
      showBreadcrumbs
      containerized
    />
  );
}