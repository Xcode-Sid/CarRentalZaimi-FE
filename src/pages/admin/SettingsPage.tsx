import {
  Title,
  Stack,
  TextInput,
  Textarea,
  Button,
  Box,
  Text,
  Group,
  ActionIcon,
  Select,
  Badge,
  Paper,
  SimpleGrid,
  Switch,
  ThemeIcon,
  Progress,
  Grid,
  Tooltip,
  NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  IconPlus,
  IconTrash,
  IconBuildingStore,
  IconClock,
  IconStarFilled,
  IconShare,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconBriefcase,
  IconInfoCircle,
  IconPhone,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandWhatsapp,
  IconChartBar,
  IconCalendar,
  IconCar,
  IconMapPin,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { get, post } from '../../utils/api.utils';
import Spinner from '../../components/spinner/Spinner';
import { toImagePath } from '../../utils/general';

interface PhonePrefix {
  countryName: string | null;
  phonePrefix: string | null;
  flag: string | null;
  phoneRegex: string | null;
}


interface WhyChooseUsItem {
  icon: string;
  title: string;
  description: string;
}

interface WorkingHours {
  day: string;
  openTime: string;
  closeTime: string;
}

interface FormValues {
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
  workingHours: WorkingHours[];
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ICON_OPTIONS = [
  { value: '⭐', label: '⭐ Star' },
  { value: '🚗', label: '🚗 Car' },
  { value: '🔑', label: '🔑 Key' },
  { value: '💰', label: '💰 Money' },
  { value: '🛡️', label: '🛡️ Shield' },
  { value: '⚡', label: '⚡ Lightning' },
  { value: '🏆', label: '🏆 Trophy' },
  { value: '🤝', label: '🤝 Handshake' },
  { value: '📍', label: '📍 Location' },
  { value: '✅', label: '✅ Check' },
  { value: '🔧', label: '🔧 Wrench' },
  { value: '💎', label: '💎 Diamond' },
];

const INITIAL_VALUES: FormValues = {
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

const STEPS = [
  { id: 0, label: 'admin.steps.platform', description: 'admin.steps.platformDesc', icon: IconBuildingStore, color: 'teal' },
  { id: 1, label: 'admin.steps.mission', description: 'admin.steps.missionDesc', icon: IconBriefcase, color: 'blue' },
  { id: 2, label: 'admin.steps.whyUs', description: 'admin.steps.whyUsDesc', icon: IconStarFilled, color: 'yellow' },
  { id: 3, label: 'admin.steps.hours', description: 'admin.steps.hoursDesc', icon: IconClock, color: 'violet' },
  { id: 4, label: 'admin.steps.social', description: 'admin.steps.socialDesc', icon: IconShare, color: 'pink' },
];

const STEP_FIELDS: Record<number, (keyof FormValues | string)[]> = {
  0: ['name', 'email', 'phone', 'address'],
  1: [],
  2: [],
  3: [],
  4: [],
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);
  const [phonePrefix, setPhonePrefix] = useState('+355');
  const [whatsAppPrefix, setWhatsAppPrefix] = useState('+355');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    initialValues: INITIAL_VALUES,
    validate: {
      name: (v) => (v.trim().length === 0 ? t('admin.validation.nameRequired') : null),
      email: (v) =>
        v.trim().length === 0
          ? t('admin.validation.emailRequired')
          : !/^\S+@\S+\.\S+$/.test(v)
            ? t('admin.validation.emailInvalid')
            : null,
             phone: (value) => {
        if (!value || value.trim() === '') return t('phoneIsRequired');
        const selected = phonePrefixes.find((p) => p.phonePrefix === phonePrefix);
        if (!selected?.phoneRegex) return null;
        return new RegExp(selected.phoneRegex).test(`${phonePrefix}${value}`)
          ? null
          : t('enterAValidPhoneNumber');
      },
      address: (v) => (v.trim().length === 0 ? t('admin.validation.addressRequired') : null),
    },
  });

  useEffect(() => {
    setLoading(true);
    const fetchProfile = async () => {
      try {
        const prefixRes = await get('StatePrefix/getAll');
        let prefixes: PhonePrefix[] = [];
        if (prefixRes.success) {
          prefixes = prefixRes.data as PhonePrefix[];
          setPhonePrefixes(prefixes);
        }

        const res = await get('CompanyProfile/get');
        if (res.success) {
          const data = res.data;

          const matchPhone = (phone: string) => {
            if (!phone) return { prefix: prefixes[0]?.phonePrefix ?? '', number: '' };
            const cleaned = phone.replace(/\s+/g, '');
            const sorted = [...prefixes].sort((a, b) =>
              (b.phonePrefix?.length ?? 0) - (a.phonePrefix?.length ?? 0)
            );
            const matched = sorted.find(p => p.phonePrefix && cleaned.startsWith(p.phonePrefix));
            if (matched?.phonePrefix) {
              return { prefix: matched.phonePrefix, number: cleaned.slice(matched.phonePrefix.length) };
            }
            return { prefix: prefixes[0]?.phonePrefix ?? '', number: cleaned };
          };

          const phoneData = matchPhone(data.phone ?? '');
          const whatsAppData = matchPhone(data.whatsAppNumber ?? '');
          setPhonePrefix(phoneData.prefix);
          setWhatsAppPrefix(whatsAppData.prefix);
          form.setValues({
            name: data.name ?? '',
            tagline: data.tagline ?? '',
            logoUrl: data.logoUrl ?? '',
            email: data.email ?? '',
            phone: phoneData.number,
            address: data.address ?? '',
            aboutText: data.aboutText ?? '',
            missionTitle: data.missionTitle ?? '',
            missionDescription: data.missionDescription ?? '',
            whyChooseUs: (() => {
              try {
                const parsed = typeof data.whyChooseUs === 'string'
                  ? JSON.parse(data.whyChooseUs)
                  : data.whyChooseUs;
                return Array.isArray(parsed) && parsed.length > 0
                  ? parsed
                  : [{ icon: '⭐', title: '', description: '' }];
              } catch {
                return [{ icon: '⭐', title: '', description: '' }];
              }
            })(),
            workingHours: (() => {
              try {
                const parsed = typeof data.workingHours === 'string'
                  ? JSON.parse(data.workingHours)
                  : data.workingHours;
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : [];
              } catch {
                return [];
              }
            })(),
            facebookUrl: data.facebookUrl ?? '',
            instagramUrl: data.instagramUrl ?? '',
            twiterUrl: data.twiterUrl ?? '',
            youtubeUrl: data.youtubeUrl ?? '',
            whatsAppNumber: whatsAppData.number,
            years: data.years ?? 0,
            cars: data.cars ?? 0,
            cities: data.cities ?? 0,
            clients: data.clients ?? 0,
          });
          if (data.logoUrl) setLogoPreview(toImagePath(data.logoUrl));
          form.resetDirty();
          setCompletedSteps(new Set([0, 1, 2, 3, 4]));
        }
      } catch { } finally {
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    setCurrentStep(step);
  };

  const validateCurrentStep = (): boolean => {
    const fields = STEP_FIELDS[currentStep] ?? [];
    if (fields.length === 0) return true;

    const result = form.validate();
    const errorKeys = Object.keys(result.errors);
    const stepHasErrors = errorKeys.some((key) =>
      fields.some((f) => key === f || key.startsWith(`${f}.`))
    );

    if (stepHasErrors) return false;

    const foreignErrors = errorKeys.filter(
      (key) => !fields.some((f) => key === f || key.startsWith(`${f}.`))
    );
    foreignErrors.forEach((key) => form.clearFieldError(key));

    return true;
  };

  const handleNext = () => {
    if (currentStep >= STEPS.length - 1) return;
    if (!validateCurrentStep()) return;
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step > currentStep && !validateCurrentStep()) return;
    goToStep(step);
  };

  const handleSave = async (values: FormValues) => {
    setLoading(true);
    setCompletedSteps((prev) => new Set([...prev, currentStep]));

    const payload = {
      name: values.name || null,
      logoUrl: values.logoUrl?.startsWith('images/')
        ? null
        : values.logoUrl?.includes(',')
          ? values.logoUrl.split(',')[1] ?? null
          : values.logoUrl ?? null,
      tagline: values.tagline || null,
      aboutText: values.aboutText || null,
      missionTitle: values.missionTitle || null,
      missionDescription: values.missionDescription || null,
      whyChooseUs: values.whyChooseUs.some(i => i.title.trim())
        ? JSON.stringify(values.whyChooseUs)
        : null,
      email: values.email || null,
      phone: values.phone ? `${phonePrefix}${values.phone}` : null,
      address: values.address || null,
      workingHours: values.workingHours.length > 0
        ? JSON.stringify(values.workingHours)
        : null,
      facebookUrl: values.facebookUrl || null,
      instagramUrl: values.instagramUrl || null,
      twiterUrl: values.twiterUrl || null,
      youtubeUrl: values.youtubeUrl || null,
      whatsAppNumber: values.whatsAppNumber ? `${whatsAppPrefix}${values.whatsAppNumber}` : null,
      years: values.years,
      cars: values.cars,
      cities: values.cities,
      clients: values.clients,
    };

    try {
      const res = await post('CompanyProfile/addCompanyProfileData', payload);
      if (res.success) {
        form.resetDirty();
        notifications.show({
          message: t('account.settingsSaved'),
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({ message: t('admin.notifications.saveFailed'), color: 'red' });
      }
    } catch {
      notifications.show({ message: t('admin.notifications.networkError'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const addWhyChooseItem = () =>
    form.insertListItem('whyChooseUs', { icon: '⭐', title: '', description: '' });

  const removeWhyChooseItem = (index: number) =>
    form.removeListItem('whyChooseUs', index);

  const prefixData = phonePrefixes.map((p) => ({
    value: p.phonePrefix ?? '',
    label: `${p.flag ?? ''} ${p.phonePrefix ?? ''}`.trim(),
  }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      form.setFieldValue('logoUrl', dataUrl);
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const { values } = form;
  const progress = (completedSteps.size / STEPS.length) * 100;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <>
      <Spinner visible={loading} />
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <form>
          <Stack gap="xl">

            <AnimatedSection>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={2} fw={700}>{t('admin.settings')}</Title>
                  <Text c="dimmed" size="sm" mt={4}>{t('admin.settingsSubtitle')}</Text>
                </div>
                <Badge color="teal" variant="light" size="lg" radius="md">
                  {t('admin.stepsCompleted', { done: completedSteps.size, total: STEPS.length })}
                </Badge>
              </Group>
            </AnimatedSection>

            <AnimatedSection delay={0.05}>
              <Progress value={progress} color="teal" size="sm" radius="xl" animated />
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <SimpleGrid cols={{ base: 3, sm: 5 }} spacing="sm">
                {STEPS.map((step) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isDone = completedSteps.has(step.id) && !isActive;
                  return (
                    <Paper
                      key={step.id}
                      p="sm"
                      radius="md"
                      onClick={() => handleStepClick(step.id)}
                      style={{
                        cursor: 'pointer',
                        border: isActive
                          ? '2px solid var(--mantine-color-teal-5)'
                          : '1px solid var(--mantine-color-default-border)',
                        transition: 'all 0.2s ease',
                        background: isActive ? 'var(--mantine-color-teal-light)' : 'transparent',
                      }}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <ThemeIcon
                          size="sm"
                          radius="xl"
                          color={isDone ? 'teal' : isActive ? step.color : 'gray'}
                          variant={isDone || isActive ? 'filled' : 'light'}
                        >
                          {isDone ? <IconCheck size={10} /> : <Icon size={10} />}
                        </ThemeIcon>
                        <div style={{ minWidth: 0 }}>
                          <Text size="xs" fw={600} truncate>{t(step.label)}</Text>
                          <Text size="xs" c="dimmed" truncate visibleFrom="sm">{t(step.description)}</Text>
                        </div>
                      </Group>
                    </Paper>
                  );
                })}
              </SimpleGrid>
            </AnimatedSection>

            <Box style={{ position: 'relative', minHeight: 400, overflow: 'hidden' }}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                >

                  {currentStep === 0 && (
                    <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                      <StaggerContainer stagger={0.06}>
                        <Stack gap="md">
                          <StaggerItem>
                            <Group gap="xs">
                              <ThemeIcon color="teal" variant="light" radius="md"><IconBuildingStore size={16} /></ThemeIcon>
                              <Text fw={600} size="lg">{t('admin.platformSettings')}</Text>
                            </Group>
                          </StaggerItem>
                          <StaggerItem>
                            <Grid>
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                  label={<>{t('admin.siteName')} <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></>}
                                  placeholder={t('admin.siteNamePlaceholder')}
                                  {...form.getInputProps('name')}
                                />
                              </Grid.Col>
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                  label={t('admin.tagline')}
                                  placeholder={t('admin.taglinePlaceholder')}
                                  {...form.getInputProps('tagline')}
                                />
                              </Grid.Col>
                              <Grid.Col span={12}>
                                <Box>
                                  <Text size="sm" fw={500} mb={6}>{t('admin.logoUrl')}</Text>
                                  <Group gap="md" align="center">
                                    <Box
                                      onClick={() => logoInputRef.current?.click()}
                                      style={{
                                        width: 72,
                                        height: 72,
                                        borderRadius: 'var(--mantine-radius-md)',
                                        border: '2px dashed var(--mantine-color-teal-5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        flexShrink: 0,
                                        background: logoPreview ? 'transparent' : 'var(--mantine-color-body)',
                                      }}
                                    >
                                      {logoPreview ? (
                                        <img
                                          src={logoPreview}
                                          alt="logo preview"
                                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                      ) : (
                                        <IconBuildingStore size={28} style={{ opacity: 0.4 }} />
                                      )}
                                    </Box>
                                    <Stack gap={4} style={{ flex: 1 }}>
                                      <Button
                                        variant="light"
                                        color="teal"
                                        size="xs"
                                        leftSection={<IconBuildingStore size={14} />}
                                        onClick={() => logoInputRef.current?.click()}
                                      >
                                        {logoPreview ? t('admin.changeLogo') : t('admin.uploadLogo')}
                                      </Button>
                                      {logoPreview && (
                                        <Tooltip label={t('admin.removeLogo')} withArrow position="right">
                                          <ActionIcon
                                            variant="light"
                                            color="red"
                                            size="sm"
                                            radius="xl"
                                            onClick={() => {
                                              form.setFieldValue('logoUrl', '');
                                              setLogoPreview(null);
                                              if (logoInputRef.current) logoInputRef.current.value = '';
                                            }}
                                          >
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Tooltip>
                                      )}
                                    </Stack>
                                    <input
                                      ref={logoInputRef}
                                      type="file"
                                      accept="image/*"
                                      style={{ display: 'none' }}
                                      onChange={handleLogoChange}
                                    />
                                  </Group>
                                </Box>
                              </Grid.Col>
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                  label={<>{t('register.email')} <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></>}
                                  placeholder={t('admin.emailPlaceholder')}
                                  {...form.getInputProps('email')}
                                />
                              </Grid.Col>
                              <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Box>
                                  <Text size="sm" fw={500} mb={4}>
                                    {t('register.phone')} <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span>
                                  </Text>
                                  <Group gap="xs" align="flex-start">
                                    <Select
                                      data={prefixData}
                                      value={phonePrefix}
                                      onChange={(v) => setPhonePrefix(v ?? '+355')}
                                      radius="md"
                                      w={120}
                                      comboboxProps={{ withinPortal: true }}
                                    />
                                    <TextInput
                                      placeholder={t('admin.phonePlaceholder')}
                                      leftSection={<IconPhone size={16} />}
                                      style={{ flex: 1 }}
                                      {...form.getInputProps('phone')}
                                    />
                                  </Group>
                                </Box>
                              </Grid.Col>
                              <Grid.Col span={12}>
                                <TextInput
                                  label={<>{t('register.address')} <span style={{ color: 'var(--mantine-color-red-6)' }}>*</span></>}
                                  placeholder={t('admin.addressPlaceholder')}
                                  {...form.getInputProps('address')}
                                />
                              </Grid.Col>
                              <Grid.Col span={12}>
                                <Textarea
                                  label={t('admin.aboutText')}
                                  placeholder={t('admin.aboutTextPlaceholder')}
                                  minRows={3}
                                  {...form.getInputProps('aboutText')}
                                />
                              </Grid.Col>

                              <Grid.Col span={12}>
                                <Box
                                  p="md"
                                  style={{
                                    background: 'var(--mantine-color-default-hover)',
                                    borderRadius: 'var(--mantine-radius-md)',
                                    border: '1px solid var(--mantine-color-default-border)',
                                  }}
                                >
                                  <Group mb="md" gap="xs">
                                    <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                                      <IconChartBar size={12} />
                                    </ThemeIcon>
                                    <Text size="sm" fw={700} c="blue">
                                      {t('admin.stats')}
                                    </Text>
                                  </Group>

                                  <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
                                    {[
                                      { field: 'years', label: t('about.stats.yearsTitle'), icon: IconCalendar, color: 'blue' },
                                      { field: 'cars', label: t('about.stats.carsTitle'), icon: IconCar, color: 'teal' },
                                      { field: 'cities', label: t('about.stats.citiesTitle'), icon: IconMapPin, color: 'violet' },
                                      { field: 'clients', label: t('about.stats.clientsTitle'), icon: IconUsers, color: 'orange' },
                                    ].map(({ field, label, icon: Icon, color }) => (
                                      <Paper
                                        key={field}
                                        p="sm"
                                        radius="md"
                                        withBorder
                                        style={{
                                          borderColor: 'var(--mantine-color-default-border)',
                                          background: 'var(--mantine-color-body)',
                                          transition: 'box-shadow 0.2s ease',
                                        }}
                                        onMouseEnter={e => {
                                          (e.currentTarget as HTMLElement).style.boxShadow =
                                            `0 4px 12px var(--mantine-color-dark-4)`;
                                        }}
                                        onMouseLeave={e => {
                                          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                        }}
                                      >
                                        <Group gap={6} mb={6}>
                                          <ThemeIcon size="xs" variant="light" color={color} radius="xl">
                                            <Icon size={10} />
                                          </ThemeIcon>
                                          <Text size="xs" fw={600} c={color}>
                                            {label}
                                          </Text>
                                        </Group>
                                        <NumberInput
                                          placeholder="0"
                                          min={0}
                                          size="sm"
                                          variant="unstyled"
                                          styles={{
                                            input: {
                                              fontWeight: 700,
                                              fontSize: '1.25rem',
                                              color: `var(--mantine-color-${color}-filled)`,
                                              paddingLeft: 0,
                                            },
                                          }}
                                          {...form.getInputProps(field)}
                                        />
                                      </Paper>
                                    ))}
                                  </SimpleGrid>
                                </Box>
                              </Grid.Col>

                            </Grid>
                          </StaggerItem>
                        </Stack>
                      </StaggerContainer>
                    </Box>
                  )}

                  {currentStep === 1 && (
                    <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                      <StaggerContainer stagger={0.06}>
                        <Stack gap="md">
                          <StaggerItem>
                            <Group gap="xs">
                              <ThemeIcon color="blue" variant="light" radius="md"><IconBriefcase size={16} /></ThemeIcon>
                              <Text fw={600} size="lg">{t('admin.mission')}</Text>
                            </Group>
                          </StaggerItem>
                          <StaggerItem>
                            <TextInput
                              label={t('admin.missionTitle')}
                              placeholder={t('admin.missionTitlePlaceholder')}
                              {...form.getInputProps('missionTitle')}
                            />
                          </StaggerItem>
                          <StaggerItem>
                            <Textarea
                              label={t('admin.missionDescription')}
                              placeholder={t('admin.missionDescriptionPlaceholder')}
                              minRows={5}
                              {...form.getInputProps('missionDescription')}
                            />
                          </StaggerItem>
                        </Stack>
                      </StaggerContainer>
                    </Box>
                  )}

                  {currentStep === 2 && (
                    <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                      <Stack gap="md">
                        <Group justify="space-between">
                          <Group gap="xs">
                            <ThemeIcon color="yellow" variant="light" radius="md"><IconStarFilled size={16} /></ThemeIcon>
                            <Text fw={600} size="lg">{t('admin.whyChooseUs')}</Text>
                          </Group>
                          <Button size="xs" variant="light" color="teal" leftSection={<IconPlus size={14} />} onClick={addWhyChooseItem}>
                            {t('admin.addItem')}
                          </Button>
                        </Group>
                        <Stack gap="sm">
                          {values.whyChooseUs.map((_, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                              <Paper p="md" radius="md" withBorder>
                                <Stack gap="sm">
                                  <Group justify="space-between">
                                    <Badge variant="light" color="teal" radius="sm">{t('admin.item')} {index + 1}</Badge>
                                    <ActionIcon
                                      color="red"
                                      variant="subtle"
                                      size="sm"
                                      onClick={() => removeWhyChooseItem(index)}
                                      disabled={values.whyChooseUs.length === 1}
                                    >
                                      <IconTrash size={14} />
                                    </ActionIcon>
                                  </Group>
                                  <Grid>
                                    <Grid.Col span={{ base: 12, sm: 4 }}>
                                      <Select
                                        label={t('admin.icon')}
                                        data={ICON_OPTIONS}
                                        {...form.getInputProps(`whyChooseUs.${index}.icon`)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={{ base: 12, sm: 8 }}>
                                      <TextInput
                                        label={t('admin.title')}
                                        placeholder={t('admin.whyChooseTitlePlaceholder')}
                                        {...form.getInputProps(`whyChooseUs.${index}.title`)}
                                      />
                                    </Grid.Col>
                                    <Grid.Col span={12}>
                                      <Textarea
                                        label={t('admin.description')}
                                        placeholder={t('admin.whyChooseDescriptionPlaceholder')}
                                        minRows={2}
                                        {...form.getInputProps(`whyChooseUs.${index}.description`)}
                                      />
                                    </Grid.Col>
                                  </Grid>
                                </Stack>
                              </Paper>
                            </motion.div>
                          ))}
                        </Stack>
                      </Stack>
                    </Box>
                  )}

                  {currentStep === 3 && (
                    <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                      <Stack gap="md">
                        <Group gap="xs">
                          <ThemeIcon color="violet" variant="light" radius="md"><IconClock size={16} /></ThemeIcon>
                          <Text fw={600} size="lg">{t('admin.workingHours')}</Text>
                        </Group>
                        <Stack gap={4}>
                          {DAYS.map((day, index) => {
                            const entry = values.workingHours.find((h) => h.day === day);
                            const isOpen = !!entry;
                            const isWeekend = day === 'Saturday' || day === 'Sunday';
                            const entryIndex = values.workingHours.findIndex((h) => h.day === day);

                            const toggleDay = () => {
                              if (isOpen) {
                                form.removeListItem('workingHours', entryIndex);
                              } else {
                                form.insertListItem('workingHours', {
                                  day,
                                  openTime: isWeekend ? '10:00' : '08:00',
                                  closeTime: isWeekend ? '14:00' : '17:00',
                                });
                              }
                            };

                            return (
                              <motion.div
                                key={day}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.04 }}
                              >
                                <Box
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '130px 44px 1fr',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 14px',
                                    borderRadius: 10,
                                    border: isOpen
                                      ? '1px solid var(--mantine-color-violet-3)'
                                      : '1px solid var(--mantine-color-default-border)',
                                    background: isOpen
                                      ? 'var(--mantine-color-violet-light)'
                                      : 'transparent',
                                    transition: 'all 0.2s ease',
                                  }}
                                >
                                  <Group gap={6}>
                                    <Box
                                      style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        background: isOpen
                                          ? 'var(--mantine-color-violet-5)'
                                          : 'var(--mantine-color-dimmed)',
                                        transition: 'background 0.2s',
                                      }}
                                    />
                                    <Text size="sm" fw={600} c={isOpen ? undefined : 'dimmed'}>
                                      {t(`admin.days.${day.toLowerCase()}`)}
                                    </Text>
                                    {isWeekend && (
                                      <Badge size="xs" color="orange" variant="light">{t('admin.weekend')}</Badge>
                                    )}
                                  </Group>

                                  <Switch
                                    checked={isOpen}
                                    onChange={toggleDay}
                                    color="violet"
                                    size="sm"
                                  />

                                  {isOpen && entryIndex !== -1 ? (
                                    <Group gap={6} wrap="nowrap">
                                      <TextInput
                                        type="time"
                                        size="sm"
                                        radius="md"
                                        styles={{ input: { width: 100, textAlign: 'center', fontSize: 13 } }}
                                        {...form.getInputProps(`workingHours.${entryIndex}.openTime`)}
                                      />
                                      <Text size="xs" c="dimmed">–</Text>
                                      <TextInput
                                        type="time"
                                        size="sm"
                                        radius="md"
                                        styles={{ input: { width: 100, textAlign: 'center', fontSize: 13 } }}
                                        {...form.getInputProps(`workingHours.${entryIndex}.closeTime`)}
                                      />
                                    </Group>
                                  ) : (
                                    <Text size="xs" fw={500} c="dimmed">{t('admin.closed')}</Text>
                                  )}
                                </Box>
                              </motion.div>
                            );
                          })}
                        </Stack>
                      </Stack>
                    </Box>
                  )}

                  {currentStep === 4 && (
                    <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
                      <StaggerContainer stagger={0.06}>
                        <Stack gap="md">
                          <StaggerItem>
                            <Group gap="xs">
                              <ThemeIcon color="pink" variant="light" radius="md"><IconShare size={16} /></ThemeIcon>
                              <Text fw={600} size="lg">{t('admin.socialLinks')}</Text>
                            </Group>
                          </StaggerItem>
                          <StaggerItem>
                            <TextInput
                              label={t('admin.facebookUrl')}
                              placeholder={t('admin.facebookUrlPlaceholder')}
                              leftSection={<IconBrandFacebook size={16} color="#1877F2" />}
                              {...form.getInputProps('facebookUrl')}
                            />
                          </StaggerItem>
                          <StaggerItem>
                            <TextInput
                              label={t('admin.instagramUrl')}
                              placeholder={t('admin.instagramUrlPlaceholder')}
                              leftSection={<IconBrandInstagram size={16} color="#E1306C" />}
                              {...form.getInputProps('instagramUrl')}
                            />
                          </StaggerItem>
                          <StaggerItem>
                            <TextInput
                              label={t('admin.twitterUrl')}
                              placeholder={t('admin.twitterUrlPlaceholder')}
                              leftSection={<IconBrandTwitter size={16} color="#1DA1F2" />}
                              {...form.getInputProps('twiterUrl')}
                            />
                          </StaggerItem>
                          <StaggerItem>
                            <TextInput
                              label={t('admin.youtubeUrl')}
                              placeholder={t('admin.youtubeUrlPlaceholder')}
                              leftSection={<IconBrandYoutube size={16} color="#FF0000" />}
                              {...form.getInputProps('youtubeUrl')}
                            />
                          </StaggerItem>
                          <StaggerItem>
                            <Box>
                              <Text size="sm" fw={500} mb={4}>{t('admin.whatsAppNumber')}</Text>
                              <Group gap="xs" align="flex-start">
                                <Select
                                  data={prefixData}
                                  value={whatsAppPrefix}
                                  onChange={(v) => setWhatsAppPrefix(v ?? '+355')}
                                  radius="md"
                                  w={120}
                                  comboboxProps={{ withinPortal: true }}
                                />
                                <TextInput
                                  placeholder={t('admin.phonePlaceholder')}
                                  leftSection={<IconBrandWhatsapp size={16} color="#25D366" />}
                                  style={{ flex: 1 }}
                                  {...form.getInputProps('whatsAppNumber')}
                                />
                              </Group>
                            </Box>
                          </StaggerItem>
                          <StaggerItem>
                            <Paper p="sm" radius="md" bg="var(--mantine-color-teal-light)" style={{ border: '1px solid var(--mantine-color-teal-3)' }}>
                              <Group gap="xs">
                                <IconInfoCircle size={16} color="var(--mantine-color-teal-6)" />
                                <Text size="xs" c="teal.7">{t('admin.lastStepHint')}</Text>
                              </Group>
                            </Paper>
                          </StaggerItem>
                        </Stack>
                      </StaggerContainer>
                    </Box>
                  )}

                </motion.div>
              </AnimatePresence>
            </Box>

            <AnimatedSection delay={0.2}>
              <Group justify="space-between">
                <Button
                  variant="default"
                  leftSection={<IconChevronLeft size={16} />}
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  {t('common.back')}
                </Button>

                {!isLastStep ? (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      color="teal"
                      rightSection={<IconChevronRight size={16} />}
                      onClick={handleNext}
                      className="ripple-btn"
                    >
                      {t('common.next')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      color="teal"
                      leftSection={<IconCheck size={16} />}
                      className="ripple-btn"
                      onClick={() => {
                        const result = form.validate();
                        if (!result.hasErrors) {
                          handleSave(form.values);
                        }
                      }}
                    >
                      {t('common.saveAll')}
                    </Button>
                  </motion.div>
                )}
              </Group>
            </AnimatedSection>

          </Stack>
        </form>
      </motion.div>
    </>
  );
}