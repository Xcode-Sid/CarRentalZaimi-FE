import {
  Title,
  Stack,
  TextInput,
  Textarea,
  Button,
  Switch,
  Divider,
  Box,
  Text,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';

export default function AdminSettingsPage() {
  const { t } = useTranslation();

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
            {t('admin.settings')}
          </Title>
        </AnimatedSection>

        <AnimatedSection delay={0.1} scale>
          <Box className="glass-card" p="xl" style={{ borderRadius: 'var(--mantine-radius-lg)' }}>
            <StaggerContainer stagger={0.06}>
              <Stack gap="md">
                <StaggerItem>
                  <Text fw={600} size="lg">Platform Settings</Text>
                </StaggerItem>
                <StaggerItem>
                  <TextInput label="Site Name" defaultValue="AutoZaimi" />
                </StaggerItem>
                <StaggerItem>
                  <TextInput label="Contact Email" defaultValue="info@autozaimi.al" />
                </StaggerItem>
                <StaggerItem>
                  <TextInput label="Phone Number" defaultValue="+355 44 123 456" />
                </StaggerItem>
                <StaggerItem>
                  <Textarea label="Site Description" defaultValue="Platforma premium për qira dhe blerje makinash në Shqipëri." minRows={3} />
                </StaggerItem>
                <StaggerItem>
                  <Divider />
                </StaggerItem>
                <StaggerItem>
                  <Switch label="Enable maintenance mode" color="teal" />
                </StaggerItem>
                <StaggerItem>
                  <Switch label="Enable new user registrations" defaultChecked color="teal" />
                </StaggerItem>
                <StaggerItem>
                  <Switch label="Show promotional banner" defaultChecked color="teal" />
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
                      {t('common.save')}
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
