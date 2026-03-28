import {
  Title,
  PasswordInput,
  Switch,
  Select,
  Button,
  Stack,
  Divider,
  Box,
  Text,
  SegmentedControl,
} from '@mantine/core';
import { useMantineColorScheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const handleSave = () => {
    notifications.show({ message: t('account.settingsSaved'), color: 'teal' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Stack gap="xl">
        <AnimatedSection>
          <Title order={2} fw={700}>
            {t('account.settings')}
          </Title>
        </AnimatedSection>

        <AnimatedSection delay={0.1} scale>
          <Box
            className="glass-card"
            p="xl"
            style={{ borderRadius: 'var(--mantine-radius-lg)' }}
          >
            <StaggerContainer stagger={0.06}>
              <Stack gap="lg">
                <StaggerItem>
                  <Text fw={600} size="lg">
                    {t('account.currentPassword')}
                  </Text>
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput label={t('account.currentPassword')} />
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput label={t('account.newPassword')} />
                </StaggerItem>
                <StaggerItem>
                  <PasswordInput label={t('account.confirmPassword')} />
                </StaggerItem>

                <StaggerItem><Divider /></StaggerItem>

                <StaggerItem>
                  <Switch
                    label={t('account.emailNotifications')}
                    checked={emailNotif}
                    onChange={(e) => setEmailNotif(e.currentTarget.checked)}
                    color="teal"
                  />
                </StaggerItem>
                <StaggerItem>
                  <Switch
                    label={t('account.smsNotifications')}
                    checked={smsNotif}
                    onChange={(e) => setSmsNotif(e.currentTarget.checked)}
                    color="teal"
                  />
                </StaggerItem>

                <StaggerItem><Divider /></StaggerItem>

                <StaggerItem>
                  <Select
                    label={t('account.languagePref')}
                    value={i18n.language}
                    onChange={(v) => v && i18n.changeLanguage(v)}
                    data={[
                      { value: 'sq', label: 'Shqip' },
                      { value: 'en', label: 'English' },
                      { value: 'it', label: 'Italiano' },
                    ]}
                  />
                </StaggerItem>

                <StaggerItem>
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      {t('account.themePref')}
                    </Text>
                    <SegmentedControl
                      value={colorScheme}
                      onChange={(v) => {
                        setColorScheme(v as 'dark' | 'light');
                        localStorage.setItem('az-color-scheme', v);
                      }}
                      data={[
                        { value: 'dark', label: t('account.dark') },
                        { value: 'light', label: t('account.light') },
                      ]}
                      color="teal"
                    />
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="filled"
                      color="teal"
                      w="fit-content"
                      onClick={handleSave}
                      className="ripple-btn"
                    >
                      {t('account.save')}
                    </Button>
                  </motion.div>
                </StaggerItem>
              </Stack>
            </StaggerContainer>
          </Box>
        </AnimatedSection>
      </Stack>
    </motion.div>
  );
}
