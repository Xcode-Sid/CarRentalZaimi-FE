import React, { useState, useEffect } from 'react';
import {
    Modal, TextInput, Button, Stack, Text,
    ThemeIcon, Box, Group, Select, ActionIcon,
} from '@mantine/core';
import { IconPhone, IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { get, post } from '../../utils/apiUtils';
import { useNavigate } from 'react-router-dom';
import type { PhonePrefix } from '../../types/company';

interface PhoneNumberModalProps {
    opened: boolean;
    userId: string;
    onSuccess: () => void;
    onClose: () => void;
}

const PhoneNumberModal: React.FC<PhoneNumberModalProps> = ({ opened, userId, onSuccess, onClose }) => {
    const { t } = useTranslation();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const [phonePrefix, setPhonePrefix] = useState('+355');
    const [phonePrefixes, setPhonePrefixes] = useState<PhonePrefix[]>([]);

    useEffect(() => {
        const fetchPrefixes = async () => {
            try {
                const response = await get('StatePrefix/getAll');
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

    const validate = (): boolean => {
        const trimmed = phoneNumber.trim();

        if (!trimmed) {
            setPhoneError(t('phoneIsRequired'));
            return false;
        }

        const selected = phonePrefixes.find((p) => p.phonePrefix === phonePrefix);
        if (selected?.phoneRegex) {
            const fullPhone = `${phonePrefix}${trimmed}`;
            if (!new RegExp(selected.phoneRegex).test(fullPhone)) {
                setPhoneError(t('enterAValidPhoneNumber'));
                return false;
            }
        }

        setPhoneError('');
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;

        const fullPhone = `${phonePrefix}${phoneNumber.trim()}`;
        try {
            const response = await post(`User/user/${userId}/phone`, { phoneNumber: fullPhone });

            if (!response.success) throw new Error(response.message?.toString());

            notifications.show({
                title: t('success'),
                message: t('phoneAdded'),
                color: 'green',
            });
            onSuccess();
            navigate('/account', { replace: true });
        } catch (err) {
            const msg = err instanceof Error ? err.message : t('phoneAddFailed');
            setPhoneError(msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            centered
            radius="lg"
            closeOnClickOutside={false}
            closeOnEscape={false}
            withCloseButton={false}
            size="lg"
            overlayProps={{ backgroundOpacity: 0.6, blur: 6 }}
        >
            {/* Custom close button in top-right corner */}
            <ActionIcon
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
                onClick={onClose}
                disabled={isSaving}
                style={{ position: 'absolute', top: 12, right: 12 }}
            >
                <IconX size={18} />
            </ActionIcon>

            <Stack gap="xl" align="center" py="md" px="sm">
                {/* Icon */}
                <ThemeIcon size={72} radius="xl" color="teal" variant="light">
                    <IconPhone size={36} />
                </ThemeIcon>

                {/* Heading */}
                <Box ta="center">
                    <Text fw={700} size="xl" mb={8}>
                        {t('addPhoneNumber')}
                    </Text>
                    <Text size="md" c="dimmed" maw={380} mx="auto" lh={1.7}>
                        {t('phoneModalDescription')}
                    </Text>
                </Box>

                {/* Prefix + number */}
                <Box w="100%">
                    <Text size="xs" mb={4} fw={500}>
                        {t('register.phone')} <span style={{ color: 'red' }}>*</span>
                    </Text>
                    <Group gap="xs" align="flex-start">
                        <Select
                            data={phonePrefixes.map((p) => ({
                                value: p.phonePrefix ?? '',
                                label: `${p.flag ?? ''} ${p.phonePrefix ?? ''}`.trim(),
                            }))}
                            value={phonePrefix}
                            onChange={(v) => {
                                setPhonePrefix(v ?? '+355');
                                setPhoneError('');
                            }}
                            radius="md"
                            w={130}
                            disabled={isSaving}
                            comboboxProps={{ withinPortal: true }}
                        />
                        <TextInput
                            placeholder={t('register.phonePlaceholder')}
                            leftSection={<IconPhone size={16} />}
                            style={{ flex: 1 }}
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.currentTarget.value);
                                setPhoneError('');
                            }}
                            error={phoneError}
                            radius="md"
                            disabled={isSaving}
                        />
                    </Group>
                </Box>

                {/* Button */}
                <Button
                    onClick={handleSave}
                    loading={isSaving}
                    fullWidth
                    size="md"
                    radius="md"
                    color="teal"
                    styles={{ root: { height: 48 } }}
                >
                    {t('saveAndContinue')}
                </Button>
            </Stack>
        </Modal>
    );
};

export default PhoneNumberModal;