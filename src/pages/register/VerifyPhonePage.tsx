import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Paper,
    Button,
    Text,
    Stack,
    Box,
    Anchor,
    Group,
    PinInput,
} from '@mantine/core';
import { IconPhone, IconPhoneCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';

import { post } from '../../utils/apiUtils';
import { Logo } from '../../components/common/Logo';
import { AnimatedSection } from '../../components/common/AnimatedSection';
import Spinner from '../../components/spinner/Spinner';


export default function VerifyPhonePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = (location.state as { userId: string }) ?? {};

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // Redirect if no userId in state
    if (!userId) {
        navigate('/login', { replace: true });
        return null;
    }

    const startCooldown = () => {
        setResendCooldown(60);
        const interval = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleVerify = async () => {
        if (code.length !== 6) {
            notifications.show({
                color: 'red',
                title: t('error'),
                message: t('enterFullCode'),
            });
            return;
        }

        setLoading(true);
        try {
            const response = await post('Phone/confirm-phone', {
                userId,
                token: code,
            });

            if (response.success) {
                notifications.show({
                    color: 'green',
                    title: t('success'),
                    message: t('phoneVerifiedSuccessfully'),
                });
                navigate('/login', { replace: true });
            }
        } catch (err) {
            console.error('Verify phone error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);
        try {
            const response = await post('Phone/send-verification-code', {
                userId,
            });

            if (response.success) {
                notifications.show({
                    color: 'green',
                    title: t('success'),
                    message: t('verificationCodeSent'),
                });
                startCooldown();
            }
        } catch (err) {
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <>
            <Spinner visible={loading} />
            <Box w="100%" py={{ base: 'md', sm: 'xl' }}>
                <Container size={440} w="100%">
                    {/* Logo + Title */}
                    <AnimatedSection>
                        <Stack align="center" mb="xl">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/')}
                            >
                                <Logo height={44} />
                            </motion.div>
                            <Text size="xl" fw={700}>
                                {t('verifyPhone.title')}
                            </Text>
                            <Text c="dimmed" size="sm" ta="center">
                                {t('verifyPhone.subtitle')}
                            </Text>
                        </Stack>
                    </AnimatedSection>

                    {/* Card */}
                    <AnimatedSection delay={0.15} scale>
                        <Paper className="glass-card" radius="lg" p="xl">
                            <Stack align="center" gap="lg">

                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    <Box
                                        style={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: '50%',
                                            background: 'rgba(20, 184, 166, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <IconPhone size={32} color="var(--mantine-color-teal-5)" />
                                    </Box>
                                </motion.div>

                                {/* PIN Input */}
                                <Stack align="center" gap="xs" w="100%">
                                    <Text size="sm" c="dimmed">
                                        {t('verifyPhone.enterCode')}
                                    </Text>
                                    <PinInput
                                        length={6}
                                        type="number"
                                        size="lg"
                                        gap="sm"
                                        value={code}
                                        onChange={setCode}
                                        onComplete={handleVerify}
                                        placeholder="○"
                                        styles={{
                                            input: {
                                                borderColor: 'var(--mantine-color-teal-5)',
                                                fontWeight: 700,
                                                fontSize: '1.25rem',
                                            },
                                        }}
                                    />
                                </Stack>

                                {/* Verify Button */}
                                <motion.div
                                    style={{ width: '100%' }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <Button
                                        fullWidth
                                        variant="filled"
                                        color="teal"
                                        size="md"
                                        loading={loading}
                                        onClick={handleVerify}
                                        leftSection={<IconPhoneCheck size={18} />}
                                        className="ripple-btn"
                                    >
                                        {t('verifyPhone.verify')}
                                    </Button>
                                </motion.div>

                                {/* Resend */}
                                <Group gap={4}>
                                    <Text size="sm" c="dimmed">
                                        {t('verifyPhone.didntReceive')}
                                    </Text>
                                    <Anchor
                                        component="button"
                                        type="button"
                                        size="sm"
                                        fw={600}
                                        onClick={handleResend}
                                        style={{
                                            opacity: resendCooldown > 0 ? 0.5 : 1,
                                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {resendLoading
                                            ? t('sending')
                                            : resendCooldown > 0
                                                ? `${t('verifyPhone.resendIn')} ${resendCooldown}s`
                                                : t('verifyPhone.resend')}
                                    </Anchor>
                                </Group>
                            </Stack>
                        </Paper>
                    </AnimatedSection>

                    {/* Back to login */}
                    <AnimatedSection delay={0.3}>
                        <Text ta="center" mt="md" size="sm">
                            <Anchor
                                component="button"
                                type="button"
                                fw={600}
                                onClick={() => navigate('/login')}
                            >
                                {t('backToLogin')}
                            </Anchor>
                        </Text>
                    </AnimatedSection>
                </Container>
            </Box>
        </>
    );
}