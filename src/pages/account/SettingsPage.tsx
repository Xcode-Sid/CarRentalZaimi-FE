import {
  Title,
  PasswordInput,
  Button,
  Stack,
  Box,
  Text,
  Group,
  ThemeIcon,
  Progress,
  Paper,
  Divider,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconLock, IconShield, IconCheck, IconX } from '@tabler/icons-react';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';
import { post } from '../../utils/apiUtils';

// ─── Password strength helpers ────────────────────────────────────────────────

interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

function getPasswordRules(t: (k: string) => string): PasswordRule[] {
  return [
    { label: t('passwordRules.minLength'), test: (v) => v.length >= 8 },
    { label: t('passwordRules.lowercase'), test: (v) => /[a-z]/.test(v) },
    { label: t('passwordRules.uppercase'), test: (v) => /[A-Z]/.test(v) },
    { label: t('passwordRules.number'),    test: (v) => /\d/.test(v) },
    { label: t('passwordRules.special'),   test: (v) => /[^a-zA-Z0-9]/.test(v) },
  ];
}

function getStrengthColor(passed: number): string {
  if (passed <= 1) return '#ef4444';
  if (passed <= 2) return '#f97316';
  if (passed <= 3) return '#eab308';
  if (passed <= 4) return '#22c55e';
  return '#14b8a6';
}

function getStrengthLabel(passed: number, t: (k: string) => string): string {
  if (passed <= 1) return t('passwordStrength.weak');
  if (passed <= 2) return t('passwordStrength.fair');
  if (passed <= 3) return t('passwordStrength.good');
  if (passed <= 4) return t('passwordStrength.strong');
  return t('passwordStrength.excellent');
}

// ─── Form values ──────────────────────────────────────────────────────────────

interface FormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);

  const rules = getPasswordRules(t);

  const form = useForm<FormValues>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (v) =>
        v.trim().length === 0 ? t('account.currentPasswordRequired') : null,
      newPassword: (v) => {
        if (v.length < 8) return t('passwordMustBeAtLeast8Characters');
        if (!/[a-z]/.test(v)) return t('passwordMustContainAtLeastOneLowercaseLetter');
        if (!/[A-Z]/.test(v)) return t('passwordMustContainAtLeastOneUppercaseLetter');
        if (!/\d/.test(v)) return t('passwordMustContainAtLeastOneNumber');
        if (!/[^a-zA-Z0-9]/.test(v)) return t('passwordMustContainAtLeastOneSpecialCharacter');
        return null;
      },
      confirmPassword: (v, values) =>
        v !== values.newPassword ? t('passwordsDoNotMatch') : null,
    },
  });

  const passedRules = rules.filter((r) => r.test(form.values.newPassword));
  const strengthPct = (passedRules.length / rules.length) * 100;
  const strengthColor = getStrengthColor(passedRules.length);
  const showStrength = form.values.newPassword.length > 0;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await post('Authentication/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.success) {
        notifications.show({
          color: 'teal',
          title: t('success'),
          message: t('account.passwordChanged'),
          icon: <IconCheck size={16} />,
        });
        form.reset();
      } else {
        notifications.show({
          color: 'red',
          title: t('error'),
          message: response.message ?? t('account.passwordChangeFailed'),
          icon: <IconX size={16} />,
        });
      }
    } catch (error: any) {
      notifications.show({
        color: 'red',
        title: t('error'),
        message: t('account.passwordChangeFailed'),
        icon: <IconX size={16} />,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Stack gap="xl">
        <AnimatedSection>
          <Group gap="sm">
            <ThemeIcon size={40} radius="xl" color="teal" variant="light">
              <IconShield size={22} />
            </ThemeIcon>
            <Box>
              <Title order={2} fw={700}>
                {t('account.settings')}
              </Title>
              <Text size="sm" c="dimmed">{t('account.settingsSubtitle')}</Text>
            </Box>
          </Group>
        </AnimatedSection>

        <AnimatedSection delay={0.1} scale>
          <Box
            className="glass-card"
            p="xl"
            style={{ borderRadius: 'var(--mantine-radius-lg)' }}
          >
            {/* Section header */}
            <Group gap="sm" mb="lg">
              <ThemeIcon size={32} radius="md" color="teal" variant="light">
                <IconLock size={16} />
              </ThemeIcon>
              <Box>
                <Text fw={600} size="md">{t('account.changePassword')}</Text>
                <Text size="xs" c="dimmed">{t('account.changePasswordSubtitle')}</Text>
              </Box>
            </Group>

            <Divider mb="lg" />

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <StaggerContainer stagger={0.06}>
                <Stack gap="lg">

                  {/* Current password */}
                  <StaggerItem>
                    <PasswordInput
                      label={t('account.currentPassword')}
                      placeholder="••••••••"
                      leftSection={<IconLock size={16} />}
                      withAsterisk
                      {...form.getInputProps('currentPassword')}
                    />
                  </StaggerItem>

                  <StaggerItem>
                    <Divider
                      label={
                        <Text size="xs" c="dimmed">
                          {t('account.newCredentials')}
                        </Text>
                      }
                      labelPosition="left"
                    />
                  </StaggerItem>

                  {/* New password */}
                  <StaggerItem>
                    <Stack gap="xs">
                      <PasswordInput
                        label={t('account.newPassword')}
                        placeholder="••••••••"
                        leftSection={<IconLock size={16} />}
                        withAsterisk
                        onFocus={() => setNewPasswordFocused(true)}
                        onBlur={() => setNewPasswordFocused(false)}
                        {...form.getInputProps('newPassword')}
                      />

                      {/* Strength bar */}
                      <AnimatePresence>
                        {showStrength && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Stack gap={6}>
                              <Group justify="space-between">
                                <Text size="xs" c="dimmed">{t('register.passwordRules')}</Text>
                                <Badge
                                  size="xs"
                                  variant="light"
                                  style={{ color: strengthColor, background: strengthColor + '20' }}
                                >
                                  {getStrengthLabel(passedRules.length, t)}
                                </Badge>
                              </Group>
                              <Progress
                                value={strengthPct}
                                color={strengthColor}
                                size="sm"
                                radius="xl"
                                style={{ transition: 'all 0.3s ease' }}
                              />

                              {/* Rules checklist */}
                              <AnimatePresence>
                                {(newPasswordFocused || form.values.newPassword.length > 0) && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                  >
                                    <Paper
                                      p="sm"
                                      radius="md"
                                      withBorder
                                      style={{ borderColor: 'var(--mantine-color-default-border)' }}
                                    >
                                      <Stack gap={4}>
                                        {rules.map((rule, i) => {
                                          const ok = rule.test(form.values.newPassword);
                                          return (
                                            <motion.div
                                              key={i}
                                              initial={{ opacity: 0, x: -8 }}
                                              animate={{ opacity: 1, x: 0 }}
                                              transition={{ delay: i * 0.05 }}
                                            >
                                              <Group gap={8}>
                                                <ThemeIcon
                                                  size={16}
                                                  radius="xl"
                                                  color={ok ? 'teal' : 'gray'}
                                                  variant={ok ? 'filled' : 'light'}
                                                >
                                                  {ok
                                                    ? <IconCheck size={10} />
                                                    : <IconX size={10} />
                                                  }
                                                </ThemeIcon>
                                                <Text size="xs" c={ok ? 'teal' : 'dimmed'} fw={ok ? 500 : 400}>
                                                  {rule.label}
                                                </Text>
                                              </Group>
                                            </motion.div>
                                          );
                                        })}
                                      </Stack>
                                    </Paper>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Stack>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Stack>
                  </StaggerItem>

                  {/* Confirm password */}
                  <StaggerItem>
                    <PasswordInput
                      label={t('account.confirmPassword')}
                      placeholder="••••••••"
                      leftSection={<IconLock size={16} />}
                      withAsterisk
                      {...form.getInputProps('confirmPassword')}
                    />
                  </StaggerItem>

                  {/* Submit */}
                  <StaggerItem>
                    <Group justify="flex-end" pt="xs">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                        <Button
                          type="submit"
                          variant="filled"
                          color="teal"
                          size="md"
                          loading={loading}
                          leftSection={!loading && <IconShield size={16} />}
                          className="ripple-btn"
                          px="xl"
                        >
                          {t('account.save')}
                        </Button>
                      </motion.div>
                    </Group>
                  </StaggerItem>

                </Stack>
              </StaggerContainer>
            </form>
          </Box>
        </AnimatedSection>
      </Stack>
    </motion.div>
  );
}