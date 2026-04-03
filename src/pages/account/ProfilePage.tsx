import {
  Title,
  TextInput,
  Button,
  Stack,
  SimpleGrid,
  Group,
  Box,
  Text,
  Tooltip,
  ActionIcon,
  Autocomplete,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconTrash,
  IconSearch,
  IconX,
  IconCircleCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useRef, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { post } from '../../utils/api.utils';
import type { User } from '../../data/users';
import Spinner from '../../components/spinner/Spinner';
import { toImagePath } from '../../utils/general';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationDetails {
  lat: number;
  lng: number;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
}

// ─── Location helpers ─────────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<LocationDetails> {
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

async function searchAddress(query: string): Promise<LocationDetails[]> {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Location state ─────────────────────────────────────────────────────────
  const [location, setLocation] = useState<LocationDetails | null>(() => {
    if (user?.location) {
      try {
        return typeof user.location === 'string'
          ? JSON.parse(user.location)
          : user.location;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>(() => {
    if (user?.location) {
      try {
        const loc =
          typeof user.location === 'string' ? JSON.parse(user.location) : user.location;
        return loc?.address ?? '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [locationSuggestions, setLocationSuggestions] = useState<LocationDetails[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const searchIdRef = useRef(0);

  // ── Location handlers ──────────────────────────────────────────────────────
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
      }
    },
    [locationSuggestions]
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
  }, [t]);

  const handleClearLocation = useCallback(() => {
    searchIdRef.current++;
    setLocation(null);
    setLocationSearchQuery('');
    setLocationSuggestions([]);
    setLocationSearchLoading(false);
  }, []);

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      address: user?.address || '',
      dateOfBirth: user?.dateOfBirth,
      username: user?.username || '',
      name: user?.name || '',
      date: user?.date || '',
    },
    validate: {
      firstName: (v) =>
        v.trim().length < 2 ? t('register.firstNameMin') : null,
      lastName: (v) =>
        v.trim().length < 2 ? t('register.lastNameMin') : null,
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : t('enterAValidEmail'),
      dateOfBirth: (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (date > new Date()) return t('dateOfBirthCannotBeInFuture');
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 18);
        if (date > minAge) return t('youMustBeAtLeast18YearsOld');
        return null;
      },
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      form.setFieldValue('name', file.name);
      form.setFieldValue('date', base64);
    };
    reader.readAsDataURL(file);
  };

  const mapApiResponseToUser = (raw: any): User => ({
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    password: '',
    phoneNumber: raw.phoneNumber ?? '',
    address: raw.address ?? '',
    dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : null,
    username: raw.username ?? null,
    name: raw.image?.imageName ?? null,
    date: raw.image?.imagePath ? toImagePath(raw.image?.imagePath) : '',
    role: raw.role?.normalizedName?.toLowerCase() === 'admin' ? 'admin' : 'user',
    location: raw.location ?? null,
    savedVehicles: raw.savedVehicles ?? [],
    customerStatus: raw.customerStatus ?? undefined,
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await post(`User/user/${user.id}`, {
        userId: user.id,
        firstname: values.firstName,
        lastname: values.lastName,
        dateOfBirth: values.dateOfBirth,
        name: values.name || null,
        data: values.date || null,
        location: location ? JSON.stringify(location) : null,
      });

      if (response.success) {
        const updatedUser = mapApiResponseToUser(response.data);
        updateProfile(updatedUser);
        notifications.show({ message: t('account.profileSaved'), color: 'teal' });
      } else {
        notifications.show({
          color: 'red',
          title: t('error'),
          message: response.message ?? t('updateFailed'),
        });
      }
    } catch (error: any) {
      notifications.show({
        color: 'red',
        title: t('error'),
        message: error?.message ?? t('updateFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Spinner visible={isLoading} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stack gap="xl">
          <AnimatedSection>
            <Title order={2} fw={700}>
              {t('account.profile')}
            </Title>
          </AnimatedSection>

          {/* Avatar with upload */}
          <AnimatedSection delay={0.1}>
            <Group>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    border: '2px dashed var(--mantine-color-teal-5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    background: form.values.date ? 'transparent' : 'var(--mantine-color-body)',
                  }}
                >
                  {form.values.date ? (
                    <img
                      src={form.values.date}
                      alt="avatar"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <IconUser size={40} color="var(--mantine-color-teal-5)" />
                  )}
                </Box>
              </motion.div>

              <Stack gap={4}>
                <Button
                  variant="light"
                  color="teal"
                  size="xs"
                  leftSection={<IconUser size={14} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.values.name ? t('register.changePhoto') : t('register.uploadPhoto')}
                </Button>
                {form.values.name && (
                  <Text size="xs" c="dimmed" truncate>
                    {form.values.name}
                  </Text>
                )}
                {form.values.date && (
                  <Tooltip label={t('register.removePhoto')} withArrow position="right">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      radius="xl"
                      onClick={() => {
                        form.setFieldValue('name', '');
                        form.setFieldValue('date', '');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </Group>
          </AnimatedSection>

          <AnimatedSection delay={0.2} scale>
            <Box
              className="glass-card"
              p="xl"
              style={{ borderRadius: 'var(--mantine-radius-lg)' }}
            >
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <StaggerContainer stagger={0.06} delay={0.1}>
                  <Stack gap="md">
                    <StaggerItem>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput
                          label={t('account.firstName')}
                          leftSection={<IconUser size={16} />}
                          withAsterisk
                          {...form.getInputProps('firstName')}
                        />
                        <TextInput
                          label={t('account.lastName')}
                          leftSection={<IconUser size={16} />}
                          withAsterisk
                          {...form.getInputProps('lastName')}
                        />
                      </SimpleGrid>
                    </StaggerItem>

                    <StaggerItem>
                      <TextInput
                        label={t('account.email')}
                        leftSection={<IconMail size={16} />}
                        withAsterisk
                        disabled
                        {...form.getInputProps('email')}
                      />
                    </StaggerItem>

                    <StaggerItem>
                      <TextInput
                        label={t('account.phone')}
                        leftSection={<IconPhone size={16} />}
                        disabled
                        {...form.getInputProps('phone')}
                      />
                    </StaggerItem>

                    <StaggerItem>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <DateInput
                          label={t('account.dateOfBirth')}
                          placeholder="DD/MM/YYYY"
                          leftSection={<IconCalendar size={16} />}
                          maxDate={new Date()}
                          valueFormat="DD/MM/YYYY"
                          clearable
                          {...form.getInputProps('dateOfBirth')}
                        />
                        <TextInput
                          label={t('account.username')}
                          leftSection={<IconUser size={16} />}
                          disabled
                          {...form.getInputProps('username')}
                        />
                      </SimpleGrid>
                    </StaggerItem>

                    {/* ── Location ─────────────────────────────────────────── */}
                    <StaggerItem>
                      <Stack gap="xs">
                        <Autocomplete
                          label={t('register.location')}
                          placeholder={t('typeToSearchAddress')}
                          value={locationSearchQuery}
                          onChange={handleLocationSearchChange}
                          onOptionSubmit={handleLocationSelect}
                          data={locationSuggestions.map((s) => s.address ?? '').filter(Boolean)}
                          radius="md"
                          leftSection={
                            <IconSearch
                              size={16}
                              style={{ opacity: locationSearchLoading ? 0.4 : 1 }}
                            />
                          }
                          rightSection={
                            locationSearchQuery ? (
                              <ActionIcon
                                variant="subtle"
                                color="gray"
                                size="sm"
                                radius="xl"
                                onClick={handleClearLocation}
                              >
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
                          styles={{
                            root: {
                              borderStyle: 'dashed',
                              borderColor: 'var(--mantine-color-teal-4)',
                            },
                          }}
                          onClick={handleGPS}
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
                              onClose={handleClearLocation}
                              styles={{ message: { fontSize: '0.75rem' } }}
                            >
                              <Stack gap={2}>
                                <Text size="xs" fw={600}>{t('locationSet')}</Text>
                                {location.address && (
                                  <Text size="xs" c="dimmed">{location.address}</Text>
                                )}
                                <Text size="xs" c="dimmed">
                                  {[location.city, location.state, location.country]
                                    .filter(Boolean)
                                    .join(', ')}
                                </Text>
                              </Stack>
                            </Alert>
                          </motion.div>
                        )}
                      </Stack>
                    </StaggerItem>

                    <StaggerItem>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          type="submit"
                          variant="filled"
                          color="teal"
                          w="fit-content"
                          className="ripple-btn"
                        >
                          {t('account.saveChanges')}
                        </Button>
                      </motion.div>
                    </StaggerItem>
                  </Stack>
                </StaggerContainer>
              </form>
            </Box>
          </AnimatedSection>
        </Stack>
      </motion.div>
    </>
  );
}