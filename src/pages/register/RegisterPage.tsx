import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Group,
  Box,
  Anchor,
  SimpleGrid,
  Divider,
  Select,
  Popover,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
  IconBrandGoogle,
  IconBrandFacebook,
  IconBrandWindows,
  IconBrandYahoo,
  IconCalendar,
  IconId,
  IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { Logo } from '../../components/common/Logo';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { get, post } from '../../utils/api.utils';
import GoogleOAuth from '../oauth/GoogleOAuth';
import Spinner from '../../components/spinner/Spinner';
import MicrosoftOAuth from '../oauth/MicrosoftOAuth';
import FacebookOAuth from '../oauth/FacebookOAuth';
import YahooOAuth from '../oauth/YahooOAuth';


// ─── Types ───────────────────────────────────────────────────────────────────

interface UserImage {
  name: string;
  data: string; // base64
}

interface FormValues {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  password: string;
  confirmPassword: string;
  image: UserImage;
}

interface PhonePrefix {
  countryName: string | null;
  phonePrefix: string | null;
  flag: string | null;
  phoneRegex: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState('+355');
  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);
  const [passwordPopoverOpened, setPasswordPopoverOpened] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch phone prefixes on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchPrefixes = async () => {
      try {
        const response = await get('StatePrefix/getAll');
        console.log("response.data", response)
        if (response.success) {
          setPhonePrefixes(response.data as PhonePrefix[]);
          if (response.data.length > 0) {
            setPhonePrefix(response.data[0].phonePrefix ?? '+355');
          }
        }
      } catch (error) {
        console.error('Failed to fetch phone prefixes:', error);
      }
    };
    fetchPrefixes();
  }, []);

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<FormValues>({
    initialValues: {
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      phone: '',
      dateOfBirth: null,
      password: '',
      confirmPassword: '',
      image: { name: '', data: '' },
    },
    validate: {
      firstname: (v) =>
        v.trim().length < 2 ? t('register.firstNameMin') : null,
      lastname: (v) =>
        v.trim().length < 2 ? t('register.lastNameMin') : null,
      username: (v) =>
        v.trim().length < 2 ? t('usernameMustBeAtLeastTwoCharacters') : null,
      email: (v) =>
        /^\S+@\S+\.\S+$/.test(v) ? null : t('enterAValidEmail'),
      phone: (value) => {
        if (!value || value.trim() === '') return t('phoneIsRequired');
        const selected = phonePrefixes.find((p) => p.phonePrefix === phonePrefix);
        if (!selected?.phoneRegex) return null;
        const fullPhone = `${phonePrefix}${value}`;
        return new RegExp(selected.phoneRegex).test(fullPhone)
          ? null
          : t('enterAValidPhoneNumber');
      },
      password: (v) => {
        if (v.length < 8) return t('passwordMustBeAtLeast8Characters');
        if (!/[a-z]/.test(v)) return t('passwordMustContainAtLeastOneLowercaseLetter');
        if (!/[A-Z]/.test(v)) return t('passwordMustContainAtLeastOneUppercaseLetter');
        if (!/\d/.test(v)) return t('passwordMustContainAtLeastOneNumber');
        if (!/[^a-zA-Z0-9]/.test(v)) return t('passwordMustContainAtLeastOneSpecialCharacter');
        return null;
      },
      confirmPassword: (v, values) =>
        v !== values.password ? t('passwordsDoNotMatch') : null,
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

  const allRulesPassed =
    form.values.password.length >= 8 &&
    /[a-z]/.test(form.values.password) &&
    /[A-Z]/.test(form.values.password) &&
    /\d/.test(form.values.password) &&
    /[^a-zA-Z0-9]/.test(form.values.password);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    const fullPhone = values.phone ? `${phonePrefix}${values.phone}` : undefined;

    try {
      const response = await post('Authentication/register', {
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.username,
        email: values.email,
        phone: fullPhone,
        dateOfBirth: values.dateOfBirth?.toISOString() ?? null,
        name: values.image.name || null,   // maps BE "Name" to image filename
        data: values.image.data || null,   // maps BE "Data" to base64 image
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: "User",
      });
      if (response.success) {
        notifications.show({
          color: 'teal',
          title: t('success'),
          message: t('register.success'),
        });
        navigate('/login');
      } else {
        notifications.show({
          color: 'red',
          title: t('error'),
          message: response.message ?? t('registrationFailed'),
        });
      }
    } catch (error: any) {
      notifications.show({
        color: 'red',
        title: t('error'),
        message: error?.message ?? t('registrationFailed'),
      });
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // strip data:...;base64,
      form.setFieldValue('image', { name: file.name, data: base64 });
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Social (unchanged — no real auth yet) ──────────────────────────────────
  const handleSocialRegister = (provider: string) => {
    notifications.show({
      message: `${t('register.success')} (${provider})`,
      color: 'teal',
    });
    navigate('/login');
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <Spinner visible={loading} />}
      <Box w="100%" py={{ base: 'md', sm: 'xl' }}>
        <Container size={560} w="100%">
          {/* Header */}
          <AnimatedSection>
            <Stack align="center" mb="xl">
              <motion.div
                whileHover={{ scale: 1.05 }}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <Logo height={44} />
              </motion.div>
              <Text size="xl" fw={700}>{t('register.title')}</Text>
              <Text c="dimmed" size="sm">{t('register.subtitle')}</Text>
            </Stack>
          </AnimatedSection>

          {/* Card */}
          <AnimatedSection delay={0.15} scale>
            <Paper className="glass-card" radius="lg" p="xl">
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">

                  {/* First & Last name */}
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput
                      label={t('register.firstName')}
                      placeholder={t('register.firstName')}
                      leftSection={<IconUser size={16} />}
                      withAsterisk
                      {...form.getInputProps('firstname')}
                    />
                    <TextInput
                      label={t('register.lastName')}
                      placeholder={t('register.lastName')}
                      leftSection={<IconUser size={16} />}
                      withAsterisk
                      {...form.getInputProps('lastname')}
                    />
                  </SimpleGrid>

                  {/* Username */}
                  <TextInput
                    label={t('username')}
                    placeholder={t('usernamePlaceholder')}
                    leftSection={<IconId size={16} />}
                    withAsterisk
                    {...form.getInputProps('username')}
                  />

                  {/* Avatar upload */}
                  <Box>
                    <Text size="xs" mb={6} fw={500}>{t('register.profilePhoto')}</Text>
                    <Group gap="md" align="center">
                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          border: '2px dashed var(--mantine-color-teal-5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: imagePreview ? 'transparent' : 'var(--mantine-color-body)',
                        }}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <IconUser size={28} style={{ opacity: 0.4 }} />
                        )}
                      </Box>
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Button
                          variant="light"
                          color="teal"
                          size="xs"
                          leftSection={<IconUser size={14} />}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {imagePreview ? t('register.changePhoto') : t('register.uploadPhoto')}
                        </Button>
                        {form.values.image.name && (
                          <Text size="xs" c="dimmed" truncate>
                            {form.values.image.name}
                          </Text>
                        )}
                        {imagePreview && (
                          <Tooltip label={t('register.removePhoto')} withArrow position="right">
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="sm"
                              radius="xl"
                              onClick={() => {
                                form.setFieldValue('image', { name: '', data: '' });
                                setImagePreview(null);
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
                  </Box>

                  {/* Email */}
                  <TextInput
                    label={t('register.email')}
                    placeholder="email@example.com"
                    leftSection={<IconMail size={16} />}
                    withAsterisk
                    {...form.getInputProps('email')}
                  />

                  {/* Phone with prefix */}
                  <Box>
                    <Text size="xs" mb={4}>
                      {t('register.phone')} <span style={{ color: 'red' }}>*</span>
                    </Text>
                    <Group gap="xs" align="flex-start">
                      <Select
                        data={phonePrefixes.map((p) => ({
                          value: p.phonePrefix ?? '',
                          label: `${p.flag ?? ''} ${p.phonePrefix ?? ''}`.trim(),
                        }))}
                        value={phonePrefix}
                        onChange={(v) => setPhonePrefix(v ?? '+355')}
                        radius="md"
                        w={130}
                        comboboxProps={{ withinPortal: true }}
                      />
                      <TextInput
                        placeholder="6X XXX XXXX"
                        leftSection={<IconPhone size={16} />}
                        style={{ flex: 1 }}
                        {...form.getInputProps('phone')}
                      />
                    </Group>
                  </Box>

                  {/* Date of birth */}
                  <Box>
                    <DateInput
                      label={t('register.dateOfBirth')}
                      placeholder="DD/MM/YYYY"
                      leftSection={<IconCalendar size={16} />}
                      maxDate={new Date()}
                      valueFormat="DD/MM/YYYY"
                      clearable
                      {...form.getInputProps('dateOfBirth')}
                    />
                  </Box>


                  {/* Password with popover rules */}
                  <Popover
                    position="bottom"
                    withArrow
                    shadow="md"
                    opened={
                      (passwordPopoverOpened || form.values.password.length > 0) &&
                      !allRulesPassed
                    }
                    width={260}
                    withinPortal={false}
                    trapFocus={false}
                  >
                    <Popover.Target>
                      <div style={{ width: '100%' }}>
                        <PasswordInput
                          label={t('register.password')}
                          placeholder="••••••••"
                          leftSection={<IconLock size={16} />}
                          withAsterisk
                          onFocus={() => setPasswordPopoverOpened(true)}
                          {...form.getInputProps('password')}
                        />
                      </div>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text fw={600} size="xs" mb={6}>{t('register.passwordRules')}</Text>
                      <Stack gap={4}>
                        {[
                          { ok: form.values.password.length >= 8, label: t('passwordRules.minLength') },
                          { ok: /[a-z]/.test(form.values.password), label: t('passwordRules.lowercase') },
                          { ok: /[A-Z]/.test(form.values.password), label: t('passwordRules.uppercase') },
                          { ok: /\d/.test(form.values.password), label: t('passwordRules.number') },
                          { ok: /[^a-zA-Z0-9]/.test(form.values.password), label: t('passwordRules.special') },
                        ].map((rule, i) => (
                          <Group key={i} gap={6}>
                            <Text size="xs" c={rule.ok ? 'teal' : 'dimmed'}>
                              {rule.ok ? '✓' : '○'}
                            </Text>
                            <Text size="xs" c={rule.ok ? 'teal' : 'dimmed'}>
                              {rule.label}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>

                  {/* Confirm password */}
                  <PasswordInput
                    label={t('register.confirmPassword')}
                    placeholder="••••••••"
                    leftSection={<IconLock size={16} />}
                    withAsterisk
                    {...form.getInputProps('confirmPassword')}
                  />

                  {/* Submit */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="filled"
                      color="teal"
                      size="md"
                      className="ripple-btn"
                    >
                      {t('register.submit')}
                    </Button>
                  </motion.div>
                </Stack>
              </form>

              <Divider label={t('register.orSocial')} labelPosition="center" my="lg" />

              <StaggerContainer stagger={0.06}>
                <Box mb="lg">
                  <Stack gap="sm">
                    <GoogleOAuth />
                    <FacebookOAuth />
                    <MicrosoftOAuth />
                    <YahooOAuth />
                  </Stack>
                </Box>
              </StaggerContainer>
            </Paper>
          </AnimatedSection>

          {/* Footer */}
          <AnimatedSection delay={0.3}>
            <Text ta="center" mt="md" size="sm">
              {t('register.hasAccount')}{' '}
              <Anchor component={Link} to="/login" fw={600}>
                {t('register.login')}
              </Anchor>
            </Text>
          </AnimatedSection>
        </Container>
      </Box>
    </>
  );
}