import { useState } from 'react';
import {
    Container,
    Paper,
    PasswordInput,
    Button,
    Text,
    Stack,
    Box,
    Popover,
    Group,
} from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { Logo } from '../components/common/Logo';
import { AnimatedSection } from '../components/common/AnimatedSection';
import { post } from '../utils/api.utils';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [passwordPopoverOpened, setPasswordPopoverOpened] = useState(false);

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const form = useForm({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validate: {
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
        },
    });

    const allRulesPassed =
        form.values.password.length >= 8 &&
        /[a-z]/.test(form.values.password) &&
        /[A-Z]/.test(form.values.password) &&
        /\d/.test(form.values.password) &&
        /[^a-zA-Z0-9]/.test(form.values.password);

    const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
        if (!token || !email) {
            notifications.show({ message: t('invalidOrExpiredResetLink'), color: 'red' });
            return;
        }
        setLoading(true);
        try {
            const response = await post('Authentication/reset-password', {
                email,
                token,
                newPassword: values.password,
            });
            if (!response.success) throw new Error(response.message?.toString());
            notifications.show({ message: t('passwordResetSuccess'), color: 'teal' });
            navigate('/login');
        } catch (err) {
            console.error(err);
            notifications.show({ message: t('passwordResetFailed'), color: 'red' });
        }
        setLoading(false);
    };

    return (
        <Box w="100%" py={{ base: 'md', sm: 'xl' }}>
            <Container size={440} w="100%">
                <AnimatedSection>
                    <Stack align="center" mb="xl">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            <Logo height={44} />
                        </motion.div>
                        <Text size="xl" fw={700}>{t('resetPassword')}</Text>
                        <Text c="dimmed" size="sm">{t('resetPasswordSubtitle')}</Text>
                    </Stack>
                </AnimatedSection>

                <AnimatedSection delay={0.15} scale>
                    <Paper className="glass-card" radius="lg" p="xl">
                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">

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

                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="filled"
                                        color="teal"
                                        size="md"
                                        loading={loading}
                                        className="ripple-btn"
                                    >
                                        {t('resetPassword')}
                                    </Button>
                                </motion.div>

                            </Stack>
                        </form>
                    </Paper>
                </AnimatedSection>
            </Container>
        </Box>
    );
}