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
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconCalendar,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { post } from '../../utils/api.utils';
import type { User } from '../../data/users';
import Spinner from '../../components/spinner/Spinner';
import { toImagePath } from '../../utils/general';
import { LocationField, parseLocationFromUser, useLocation } from '../../components/location/Location';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loc = useLocation({ initialLocation: parseLocationFromUser(user?.location) });

  const form = useForm({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth,
      username: user?.username || '',
      // ✅ Read from image object instead of user.name / user.date
      imageName: user?.image?.imageName || '',
      imagePath: user?.image?.imagePath || '',
      imageBase64: '',
    },
    validate: {
      firstName: (v) => v.trim().length < 2 ? t('register.firstNameMin') : null,
      lastName: (v) => v.trim().length < 2 ? t('register.lastNameMin') : null,
      email: (v) => /^\S+@\S+\.\S+$/.test(v) ? null : t('enterAValidEmail'),
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
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1]; // for upload
      form.setFieldValue('imageName', file.name);
      form.setFieldValue('imagePath', dataUrl); // ← full data URL for preview
      form.setFieldValue('imageBase64', base64); // ← raw base64 for API
    };
    reader.readAsDataURL(file);
  };

  const mapApiResponseToUser = (raw: any): User => ({
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phoneNumber: raw.phoneNumber ?? '',
    username: raw.username ?? null,
    dateOfBirth: raw.dateOfBirth ? new Date(raw.dateOfBirth) : null,
    // ✅ role is now a UserRole object, not a string
    role: raw.role
      ? {
        id: raw.role.id,
        name: raw.role.name ?? null,
        normalizedName: raw.role.normalizedName ?? null,
        concurrencyStamp: raw.role.concurrencyStamp ?? null,
      }
      : null,
    // ✅ image is now a UserImage object
    image: raw.image
      ? {
        id: raw.image.id,
        imageName: raw.image.imageName ?? null,
        imagePath: raw.image.imagePath ? toImagePath(raw.image.imagePath) : null,
      }
      : null,
    avatar: raw.avatar ?? null,
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
        // ✅ Use imageName / imagePath
        name: values.imageName || null,
        data: values.imageBase64 || null,
        location: loc.location ? JSON.stringify(loc.location) : null,
      });

      if (response.success) {
        updateProfile(mapApiResponseToUser(response.data));
        notifications.show({ message: t('account.profileSaved'), color: 'teal' });
      } else {
        notifications.show({ color: 'red', title: t('error'), message: response.message ?? t('updateFailed') });
      }
    } catch (error: any) {
      notifications.show({ color: 'red', title: t('error'), message: error?.message ?? t('updateFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Spinner visible={isLoading} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Stack gap="xl">

          <AnimatedSection>
            <Title order={2} fw={700}>{t('account.profile')}</Title>
          </AnimatedSection>

          {/* Avatar */}
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
                    width: 80, height: 80, borderRadius: '50%',
                    border: '2px dashed var(--mantine-color-teal-5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', overflow: 'hidden',
                    background: form.values.imagePath ? 'transparent' : 'var(--mantine-color-body)',
                  }}
                >
                  {form.values.imagePath
                    ? <img src={form.values.imagePath} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <IconUser size={40} color="var(--mantine-color-teal-5)" />
                  }
                </Box>
              </motion.div>

              <Stack gap={4}>
                <Button variant="light" color="teal" size="xs" leftSection={<IconUser size={14} />} onClick={() => fileInputRef.current?.click()}>
                  {form.values.imageName ? t('register.changePhoto') : t('register.uploadPhoto')}
                </Button>
                {form.values.imageName && <Text size="xs" c="dimmed" truncate>{form.values.imageName}</Text>}
                {form.values.imagePath && (
                  <Tooltip label={t('register.removePhoto')} withArrow position="right">
                    <ActionIcon variant="light" color="red" size="sm" radius="xl"
                      onClick={() => {
                        form.setFieldValue('imageName', '');
                        form.setFieldValue('imagePath', '');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Stack>

              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </Group>
          </AnimatedSection>

          {/* Form */}
          <AnimatedSection delay={0.2} scale>
            <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <StaggerContainer stagger={0.06} delay={0.1}>
                  <Stack gap="md">

                    <StaggerItem>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <TextInput label={t('account.firstName')} leftSection={<IconUser size={16} />} withAsterisk {...form.getInputProps('firstName')} />
                        <TextInput label={t('account.lastName')} leftSection={<IconUser size={16} />} withAsterisk {...form.getInputProps('lastName')} />
                      </SimpleGrid>
                    </StaggerItem>

                    <StaggerItem>
                      <TextInput label={t('account.email')} leftSection={<IconMail size={16} />} withAsterisk disabled {...form.getInputProps('email')} />
                    </StaggerItem>

                    <StaggerItem>
                      <TextInput label={t('account.phone')} leftSection={<IconPhone size={16} />} disabled {...form.getInputProps('phone')} />
                    </StaggerItem>

                    <StaggerItem>
                      <SimpleGrid cols={{ base: 1, sm: 2 }}>
                        <DateInput label={t('register.dateOfBirth')} placeholder="DD/MM/YYYY" leftSection={<IconCalendar size={16} />} maxDate={new Date()} valueFormat="DD/MM/YYYY" clearable {...form.getInputProps('dateOfBirth')} />
                        <TextInput label={t('username')} leftSection={<IconUser size={16} />} disabled {...form.getInputProps('username')} />
                      </SimpleGrid>
                    </StaggerItem>

                    <StaggerItem>
                      <LocationField
                        location={loc.location}
                        locationSearchQuery={loc.locationSearchQuery}
                        locationSuggestions={loc.locationSuggestions}
                        locationSearchLoading={loc.locationSearchLoading}
                        gpsLoading={loc.gpsLoading}
                        onSearchChange={loc.handleLocationSearchChange}
                        onSelect={loc.handleLocationSelect}
                        onGPS={loc.handleGPS}
                        onClear={loc.handleClearLocation}
                      />
                    </StaggerItem>

                    <StaggerItem>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button type="submit" variant="filled" color="teal" w="fit-content" className="ripple-btn">
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