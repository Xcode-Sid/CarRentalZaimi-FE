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
  Checkbox,
  Modal,
  ScrollArea,
  Loader,
  Alert,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import {
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
  IconCalendar,
  IconId,
  IconTrash,
  IconShieldCheck,
  IconFileText,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { Logo } from '../../components/common/Logo';
import { AnimatedSection, StaggerContainer } from '../../components/common/AnimatedSection';
import { get, post } from '../../utils/api.utils';
import GoogleOAuth from '../oauth/GoogleOAuth';
import Spinner from '../../components/spinner/Spinner';
import MicrosoftOAuth from '../oauth/MicrosoftOAuth';
import FacebookOAuth from '../oauth/FacebookOAuth';
import YahooOAuth from '../oauth/YahooOAuth';
import { LocationField, useLocation } from '../../components/location/Location';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: Date | null;
  password: string;
  confirmPassword: string;
  image: { name: string; data: string };
  acceptPrivacy: boolean;
  acceptTerms: boolean;
}

interface PhonePrefix {
  countryName: string | null;
  phonePrefix: string | null;
  flag: string | null;
  phoneRegex: string | null;
}

interface PolicyItem {
  id?: number | string;
  title?: string;
  name?: string;
  description?: string;
  content?: string;
  text?: string;
  [key: string]: any;
}

// ─── PolicyModal ──────────────────────────────────────────────────────────────

interface PolicyModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
  items: PolicyItem[];
  loading: boolean;
  error: string | null;
}

function PolicyModal({
  opened,
  onClose,
  title,
  subtitle,
  icon,
  accent,
  items,
  loading,
  error,
}: PolicyModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="lg"
      radius="xl"
      centered
      padding={0}
      styles={{
        content: { overflow: 'hidden' },
        body: { padding: 0 },
      }}
    >
      {/* ── Header ── */}
      <Box
        style={{
          background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)`,
          borderBottom: `1px solid ${accent}25`,
          padding: '24px 28px 20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box style={{
          position: 'absolute', top: -48, right: -48,
          width: 160, height: 160, borderRadius: '50%',
          background: `${accent}12`, pointerEvents: 'none',
        }} />
        <Box style={{
          position: 'absolute', bottom: -24, left: '45%',
          width: 90, height: 90, borderRadius: '50%',
          background: `${accent}08`, pointerEvents: 'none',
        }} />

        <Group justify="space-between" align="flex-start">
          <Group gap="md" align="center">
            {/* Icon badge */}
            <Box style={{
              width: 52, height: 52, borderRadius: 16,
              background: `${accent}18`,
              border: `1.5px solid ${accent}35`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 4px 16px ${accent}20`,
            }}>
              {icon}
            </Box>
            <Box>
              <Text fw={800} size="lg" lh={1.2} style={{ letterSpacing: '-0.3px' }}>
                {title}
              </Text>
              <Text size="xs" c="dimmed" mt={3}>{subtitle}</Text>
            </Box>
          </Group>

          {/* Close button */}
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            size="md"
            onClick={onClose}
            style={{ marginTop: 2, flexShrink: 0 }}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Box>

      {/* ── Content ── */}
      <ScrollArea h={420}>
        <Box px={28} py={24}>
          {loading && (
            <Stack align="center" py={56} gap="xs">
              <Loader color="teal" size="md" type="dots" />
              <Text size="sm" c="dimmed" fw={500}>Loading content…</Text>
            </Stack>
          )}

          {error && !loading && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" radius="lg" variant="light">
              {error}
            </Alert>
          )}

          {!loading && !error && items.length === 0 && (
            <Text c="dimmed" ta="center" py={56} size="sm">
              No content available at this time.
            </Text>
          )}

          {!loading && !error && items.length > 0 && (
            <Stack gap={0}>
              {items.map((item, index) => {
                const itemTitle = item.title ?? item.name;
                const itemBody = item.description ?? item.content ?? item.text;
                const fallback = !itemTitle && !itemBody
                  ? Object.values(item)
                      .filter((v) => typeof v === 'string' && v.length > 0)
                      .join(' — ')
                  : null;

                return (
                  <Box
                    key={item.id ?? index}
                    style={{
                      paddingBottom: index < items.length - 1 ? 20 : 0,
                      marginBottom: index < items.length - 1 ? 20 : 0,
                      borderBottom:
                        index < items.length - 1
                          ? '1px solid var(--mantine-color-default-border)'
                          : 'none',
                    }}
                  >
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      {/* Numbered badge */}
                      <Box style={{
                        minWidth: 28, height: 28, borderRadius: 9,
                        background: `${accent}14`,
                        border: `1px solid ${accent}25`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginTop: 1, flexShrink: 0,
                      }}>
                        <Text size="xs" fw={700} style={{ color: accent, lineHeight: 1 }}>
                          {index + 1}
                        </Text>
                      </Box>

                      <Box style={{ flex: 1 }}>
                        {itemTitle && (
                          <Text fw={700} size="sm" mb={5} style={{ color: accent }}>
                            {itemTitle}
                          </Text>
                        )}
                        {(itemBody || fallback) && (
                          <Text size="sm" c="dimmed" style={{ lineHeight: 1.8 }}>
                            {itemBody ?? fallback}
                          </Text>
                        )}
                      </Box>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </ScrollArea>

      {/* ── Footer ── */}
      <Box style={{
        borderTop: '1px solid var(--mantine-color-default-border)',
        padding: '14px 28px',
        background: 'var(--mantine-color-default-hover)',
      }}>
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">Please read carefully before accepting.</Text>
          <Button
            size="sm"
            radius="xl"
            style={{ background: accent, border: 'none', paddingInline: 22 }}
            onClick={onClose}
          >
            I understand
          </Button>
        </Group>
      </Box>
    </Modal>
  );
}

// ─── RegisterPage ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState('+355');
  const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);
  const [passwordPopoverOpened, setPasswordPopoverOpened] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  const [privacyItems, setPrivacyItems] = useState<PolicyItem[]>([]);
  const [privacyLoading, setPrivacyLoading] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  const [termsItems, setTermsItems] = useState<PolicyItem[]>([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const loc = useLocation();

  // ── Fetch phone prefixes ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchPrefixes = async () => {
      try {
        const response = await get('StatePrefix/getAll');
        if (response.success) {
          setPhonePrefixes(response.data as PhonePrefix[]);
          if (response.data.length > 0) setPhonePrefix(response.data[0].phonePrefix ?? '+355');
        }
      } catch (error) {
        console.error('Failed to fetch phone prefixes:', error);
      }
    };
    fetchPrefixes();
  }, []);

  // ── Open Privacy modal (lazy fetch) ───────────────────────────────────────
  const openPrivacyModal = async () => {
    setPrivacyModalOpen(true);
    if (privacyItems.length > 0) return;
    setPrivacyLoading(true);
    setPrivacyError(null);
    try {
      const response = await get('Privacy/getAll');
      if (response.success) setPrivacyItems(response.data as PolicyItem[]);
      else setPrivacyError('Failed to load privacy policy.');
    } catch {
      setPrivacyError('Failed to load privacy policy.');
    } finally {
      setPrivacyLoading(false);
    }
  };

  // ── Open Terms modal (lazy fetch) ─────────────────────────────────────────
  const openTermsModal = async () => {
    setTermsModalOpen(true);
    if (termsItems.length > 0) return;
    setTermsLoading(true);
    setTermsError(null);
    try {
      const response = await get('Terms/getAll');
      if (response.success) setTermsItems(response.data as PolicyItem[]);
      else setTermsError('Failed to load terms and conditions.');
    } catch {
      setTermsError('Failed to load terms and conditions.');
    } finally {
      setTermsLoading(false);
    }
  };

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
      acceptPrivacy: false,
      acceptTerms: false,
    },
    validate: {
      firstname: (v) => v.trim().length < 2 ? t('register.firstNameMin') : null,
      lastname: (v) => v.trim().length < 2 ? t('register.lastNameMin') : null,
      username: (v) => v.trim().length < 2 ? t('usernameMustBeAtLeastTwoCharacters') : null,
      email: (v) => /^\S+@\S+\.\S+$/.test(v) ? null : t('enterAValidEmail'),
      phone: (value) => {
        if (!value || value.trim() === '') return t('phoneIsRequired');
        const selected = phonePrefixes.find((p) => p.phonePrefix === phonePrefix);
        if (!selected?.phoneRegex) return null;
        return new RegExp(selected.phoneRegex).test(`${phonePrefix}${value}`)
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
      confirmPassword: (v, values) => v !== values.password ? t('passwordsDoNotMatch') : null,
      dateOfBirth: (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (date > new Date()) return t('dateOfBirthCannotBeInFuture');
        const minAge = new Date();
        minAge.setFullYear(minAge.getFullYear() - 18);
        if (date > minAge) return t('youMustBeAtLeast18YearsOld');
        return null;
      },
      acceptPrivacy: (v) => !v ? t('register.mustAcceptPrivacy', 'You must accept the Privacy Policy.') : null,
      acceptTerms: (v) => !v ? t('register.mustAcceptTerms', 'You must accept the Terms and Conditions.') : null,
    },
  });

  const allRulesPassed =
    form.values.password.length >= 8 &&
    /[a-z]/.test(form.values.password) &&
    /[A-Z]/.test(form.values.password) &&
    /\d/.test(form.values.password) &&
    /[^a-zA-Z0-9]/.test(form.values.password);

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      form.setFieldValue('image', { name: file.name, data: base64 });
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await post('Authentication/register', {
        firstname: values.firstname,
        lastname: values.lastname,
        username: values.username,
        email: values.email,
        phone: values.phone ? `${phonePrefix}${values.phone}` : undefined,
        dateOfBirth: values.dateOfBirth?.toISOString() ?? null,
        name: values.image.name || null,
        data: values.image.data || null,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: 'User',
        location: loc.location,
      });

      if (response.success) {
        notifications.show({ color: 'teal', title: t('success'), message: t('register.success') });
        await sendVerificationCode(values.email);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      const userRes = await get(`User/user/email/${email}`);
      const id = userRes.data.id;
      if (userRes.success && id) {
        const smsResponse = await post('Phone/send-verification-code', { userId: id });
        if (smsResponse.success) {
          notifications.show({ color: 'green', title: t('success'), message: t('verificationCodeSent') });
          navigate('/verify-phone', { state: { userId: id } });
        }
      }
    } catch (err) {
      console.error('Something went wrong:', err);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <Spinner visible={loading} />}

      {/* Privacy Policy Modal */}
      <PolicyModal
        opened={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
        title={t('register.privacyPolicy', 'Privacy Policy')}
        subtitle={`Last updated · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        icon={<IconShieldCheck size={22} color="#12b886" />}
        accent="#12b886"
        items={privacyItems}
        loading={privacyLoading}
        error={privacyError}
      />

      {/* Terms & Conditions Modal */}
      <PolicyModal
        opened={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        title={t('register.termsAndConditions', 'Terms & Conditions')}
        subtitle={`Last updated · ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
        icon={<IconFileText size={22} color="#228be6" />}
        accent="#228be6"
        items={termsItems}
        loading={termsLoading}
        error={termsError}
      />

      <Box w="100%" py={{ base: 'md', sm: 'xl' }}>
        <Container size={560} w="100%">

          {/* Header */}
          <AnimatedSection>
            <Stack align="center" mb="xl">
              <motion.div whileHover={{ scale: 1.05 }} style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
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

                  {/* Name */}
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <TextInput label={t('register.firstName')} placeholder={t('register.firstName')} leftSection={<IconUser size={16} />} withAsterisk {...form.getInputProps('firstname')} />
                    <TextInput label={t('register.lastName')} placeholder={t('register.lastName')} leftSection={<IconUser size={16} />} withAsterisk {...form.getInputProps('lastname')} />
                  </SimpleGrid>

                  {/* Username */}
                  <TextInput label={t('username')} placeholder={t('usernamePlaceholder')} leftSection={<IconId size={16} />} withAsterisk {...form.getInputProps('username')} />

                  {/* Avatar */}
                  <Box>
                    <Text size="xs" mb={6} fw={500}>{t('register.profilePhoto')}</Text>
                    <Group gap="md" align="center">
                      <Box
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          width: 72, height: 72, borderRadius: '50%',
                          border: '2px dashed var(--mantine-color-teal-5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                          background: imagePreview ? 'transparent' : 'var(--mantine-color-body)',
                        }}
                      >
                        {imagePreview
                          ? <img src={imagePreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <IconUser size={28} style={{ opacity: 0.4 }} />
                        }
                      </Box>
                      <Stack gap={4} style={{ flex: 1 }}>
                        <Button variant="light" color="teal" size="xs" leftSection={<IconUser size={14} />} onClick={() => fileInputRef.current?.click()}>
                          {imagePreview ? t('register.changePhoto') : t('register.uploadPhoto')}
                        </Button>
                        {form.values.image.name && <Text size="xs" c="dimmed" truncate>{form.values.image.name}</Text>}
                        {imagePreview && (
                          <Tooltip label={t('register.removePhoto')} withArrow position="right">
                            <ActionIcon variant="light" color="red" size="sm" radius="xl"
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
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </Group>
                  </Box>

                  {/* Email */}
                  <TextInput label={t('register.email')} placeholder="email@example.com" leftSection={<IconMail size={16} />} withAsterisk {...form.getInputProps('email')} />

                  {/* Phone */}
                  <Box>
                    <Text size="xs" mb={4}>{t('register.phone')} <span style={{ color: 'red' }}>*</span></Text>
                    <Group gap="xs" align="flex-start">
                      <Select
                        data={phonePrefixes.map((p) => ({ value: p.phonePrefix ?? '', label: `${p.flag ?? ''} ${p.phonePrefix ?? ''}`.trim() }))}
                        value={phonePrefix}
                        onChange={(v) => setPhonePrefix(v ?? '+355')}
                        radius="md"
                        w={130}
                        comboboxProps={{ withinPortal: true }}
                      />
                      <TextInput placeholder="6X XXX XXXX" leftSection={<IconPhone size={16} />} style={{ flex: 1 }} {...form.getInputProps('phone')} />
                    </Group>
                  </Box>

                  {/* Date of birth */}
                  <DateInput label={t('register.dateOfBirth')} placeholder="DD/MM/YYYY" leftSection={<IconCalendar size={16} />} maxDate={new Date()} valueFormat="DD/MM/YYYY" clearable {...form.getInputProps('dateOfBirth')} />

                  {/* Location */}
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

                  {/* Password */}
                  <Popover
                    position="bottom"
                    withArrow
                    shadow="md"
                    opened={(passwordPopoverOpened || form.values.password.length > 0) && !allRulesPassed}
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
                            <Text size="xs" c={rule.ok ? 'teal' : 'dimmed'}>{rule.ok ? '✓' : '○'}</Text>
                            <Text size="xs" c={rule.ok ? 'teal' : 'dimmed'}>{rule.label}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </Popover.Dropdown>
                  </Popover>

                  {/* Confirm password */}
                  <PasswordInput label={t('register.confirmPassword')} placeholder="••••••••" leftSection={<IconLock size={16} />} withAsterisk {...form.getInputProps('confirmPassword')} />

                  {/* ── Privacy & Terms checkboxes ─────────────────────── */}
                  <Box
                    style={{
                      background: 'var(--mantine-color-default-hover)',
                      border: '1px solid var(--mantine-color-default-border)',
                      borderRadius: 12,
                      padding: '14px 16px',
                    }}
                  >
                    <Stack gap={10}>
                      <Checkbox
                        color="teal"
                        label={
                          <Text size="sm">
                            {t('register.iAgreeToThe', 'I agree to the ')}{' '}
                            <Anchor
                              size="sm"
                              fw={600}
                              style={{ color: '#12b886', cursor: 'pointer' }}
                              onClick={(e) => { e.preventDefault(); openPrivacyModal(); }}
                            >
                              {t('register.privacyPolicy', 'Privacy Policy')}
                            </Anchor>
                          </Text>
                        }
                        {...form.getInputProps('acceptPrivacy', { type: 'checkbox' })}
                      />
                      <Checkbox
                        color="blue"
                        label={
                          <Text size="sm">
                            {t('register.iAgreeToThe', 'I agree to the ')}{' '}
                            <Anchor
                              size="sm"
                              fw={600}
                              style={{ color: '#228be6', cursor: 'pointer' }}
                              onClick={(e) => { e.preventDefault(); openTermsModal(); }}
                            >
                              {t('register.termsAndConditions', 'Terms & Conditions')}
                            </Anchor>
                          </Text>
                        }
                        {...form.getInputProps('acceptTerms', { type: 'checkbox' })}
                      />
                    </Stack>
                  </Box>

                  {/* Submit */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button type="submit" fullWidth variant="filled" color="teal" size="md" className="ripple-btn">
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
              <Anchor component={Link} to="/login" fw={600}>{t('register.login')}</Anchor>
            </Text>
          </AnimatedSection>

        </Container>
      </Box>
    </>
  );
}