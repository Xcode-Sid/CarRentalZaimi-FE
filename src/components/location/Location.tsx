import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { Stack, Button, ActionIcon, Alert, Text, Autocomplete } from '@mantine/core';
import { IconSearch, IconX, IconMapPin, IconCircleCheck } from '@tabler/icons-react';
import { motion } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationDetails {
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export async function reverseGeocode(lat: number, lng: number): Promise<LocationDetails> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const json = await res.json();
    const a = json.address ?? {};
    return {
      lat,
      lng,
      address: json.display_name ?? null,
      city: a.city ?? a.town ?? a.village ?? null,
      state: a.state ?? null,
      country: a.country ?? null,
      zipCode: a.postcode ?? null,
    };
  } catch {
    return { lat, lng, address: null, city: null, state: null, country: null, zipCode: null };
  }
}

export async function searchAddress(query: string): Promise<LocationDetails[]> {
  if (!query || query.length < 3) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const json: any[] = await res.json();
    return json.map((item) => {
      const a = item.address ?? {};
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name ?? null,
        city: a.city ?? a.town ?? a.village ?? null,
        state: a.state ?? null,
        country: a.country ?? null,
        zipCode: a.postcode ?? null,
      };
    });
  } catch {
    return [];
  }
}

export function parseLocationFromUser(
  rawLocation: string | object | null | undefined
): LocationDetails | null {
  if (!rawLocation) return null;
  try {
    return typeof rawLocation === 'string'
      ? JSON.parse(rawLocation)
      : (rawLocation as LocationDetails);
  } catch {
    return null;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseLocationOptions {
  initialLocation?: LocationDetails | null;
  onChange?: (location: LocationDetails | null) => void;
}

export interface UseLocationReturn {
  location: LocationDetails | null;
  locationSearchQuery: string;
  locationSuggestions: LocationDetails[];
  locationSearchLoading: boolean;
  gpsLoading: boolean;
  handleLocationSearchChange: (value: string) => Promise<void>;
  handleLocationSelect: (value: string) => void;
  handleGPS: () => void;
  handleClearLocation: () => void;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const { initialLocation = null, onChange } = options;
  const { t } = useTranslation();

  const [location, setLocation] = useState<LocationDetails | null>(initialLocation);
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>(
    initialLocation?.address ?? ''
  );
  const [locationSuggestions, setLocationSuggestions] = useState<LocationDetails[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const searchIdRef = useRef(0);

  const handleLocationSearchChange = useCallback(async (value: string) => {
    setLocationSearchQuery(value);
    if (value.length < 3) {
      searchIdRef.current++;
      setLocationSuggestions([]);
      setLocationSearchLoading(false);
      return;
    }
    const requestId = ++searchIdRef.current;
    setLocationSearchLoading(true);
    const results = await searchAddress(value);
    if (requestId !== searchIdRef.current) return;
    const unique = results.filter(
      (r, i, arr) => r.address && arr.findIndex((x) => x.address === r.address) === i
    );
    setLocationSuggestions(unique);
    setLocationSearchLoading(false);
  }, []);

  const handleLocationSelect = useCallback(
    (value: string) => {
      const found = locationSuggestions.find((s) => s.address === value);
      if (found) {
        setLocation(found);
        setLocationSearchQuery(found.address ?? '');
        setLocationSuggestions([]);
        onChange?.(found);
      }
    },
    [locationSuggestions, onChange]
  );

  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const details = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocation(details);
        setLocationSearchQuery(details.address ?? '');
        setGpsLoading(false);
        onChange?.(details);
      },
      () => {
        setGpsLoading(false);
        notifications.show({
          color: 'red',
          title: t('error'),
          message: t('givePermissionToLocation'),
        });
      }
    );
  }, [t, onChange]);

  const handleClearLocation = useCallback(() => {
    searchIdRef.current++;
    setLocation(null);
    setLocationSearchQuery('');
    setLocationSuggestions([]);
    setLocationSearchLoading(false);
    onChange?.(null);
  }, [onChange]);

  return {
    location,
    locationSearchQuery,
    locationSuggestions,
    locationSearchLoading,
    gpsLoading,
    handleLocationSearchChange,
    handleLocationSelect,
    handleGPS,
    handleClearLocation,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface LocationFieldProps {
  location: LocationDetails | null;
  locationSearchQuery: string;
  locationSuggestions: LocationDetails[];
  locationSearchLoading: boolean;
  gpsLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (value: string) => void;
  onGPS: () => void;
  onClear: () => void;
}

export function LocationField({
  location,
  locationSearchQuery,
  locationSuggestions,
  locationSearchLoading,
  gpsLoading,
  onSearchChange,
  onSelect,
  onGPS,
  onClear,
}: LocationFieldProps) {
  const { t } = useTranslation();

  return (
    <Stack gap="xs">
      <Autocomplete
        label={t('register.location')}
        placeholder={t('typeToSearchAddress')}
        value={locationSearchQuery}
        onChange={onSearchChange}
        onOptionSubmit={onSelect}
        data={locationSuggestions.map((s) => s.address ?? '').filter(Boolean)}
        radius="md"
        leftSection={
          <IconSearch size={16} style={{ opacity: locationSearchLoading ? 0.4 : 1 }} />
        }
        rightSection={
          locationSearchQuery ? (
            <ActionIcon variant="subtle" color="gray" size="sm" radius="xl" onClick={onClear}>
              <IconX size={13} />
            </ActionIcon>
          ) : null
        }
      />

      <Button
        variant="outline"
        color="teal"
        fullWidth
        radius="md"
        loading={gpsLoading}
        leftSection={<IconMapPin size={16} />}
        styles={{ root: { borderStyle: 'dashed', borderColor: 'var(--mantine-color-teal-4)' } }}
        onClick={onGPS}
      >
        {t('useMyCurrentLocation')}
      </Button>

      {location && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
          <Alert
            color="teal"
            variant="light"
            radius="md"
            icon={<IconCircleCheck size={14} />}
            withCloseButton
            onClose={onClear}
            styles={{ message: { fontSize: '0.75rem' } }}
          >
            <Stack gap={2}>
              <Text size="xs" fw={600}>
                {t('locationSet')}
              </Text>
              {location.address && (
                <Text size="xs" c="dimmed">
                  {location.address}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {[location.city, location.state, location.country].filter(Boolean).join(', ')}
              </Text>
            </Stack>
          </Alert>
        </motion.div>
      )}
    </Stack>
  );
}