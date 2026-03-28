import {
  Title,
  TextInput,
  Button,
  Stack,
  SimpleGrid,
  Avatar,
  Group,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../../components/common/AnimatedSection';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();

  const form = useForm({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    updateProfile(values);
    notifications.show({ message: t('account.profileSaved'), color: 'teal' });
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
            {t('account.profile')}
          </Title>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <Group>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <Avatar size={80} radius="xl" color="teal">
                {user?.avatar}
              </Avatar>
            </motion.div>
          </Group>
        </AnimatedSection>

        <AnimatedSection delay={0.2} scale>
          <Box
            className="glass-card"
            p="xl"
            style={{ borderRadius: 'var(--mantine-radius-lg)' }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <StaggerContainer stagger={0.06} delay={0.1}>
                <Stack gap="md">
                  <StaggerItem>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <TextInput
                        label={t('account.firstName')}
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('firstName')}
                      />
                      <TextInput
                        label={t('account.lastName')}
                        leftSection={<IconUser size={16} />}
                        {...form.getInputProps('lastName')}
                      />
                    </SimpleGrid>
                  </StaggerItem>
                  <StaggerItem>
                    <TextInput
                      label={t('account.email')}
                      leftSection={<IconMail size={16} />}
                      {...form.getInputProps('email')}
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <TextInput
                      label={t('account.phone')}
                      leftSection={<IconPhone size={16} />}
                      {...form.getInputProps('phone')}
                    />
                  </StaggerItem>
                  <StaggerItem>
                    <SimpleGrid cols={{ base: 1, sm: 2 }}>
                      <TextInput
                        label={t('account.address')}
                        leftSection={<IconMapPin size={16} />}
                        {...form.getInputProps('address')}
                      />
                    </SimpleGrid>
                  </StaggerItem>
                  <StaggerItem>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        type="submit"
                        variant="filled"
                        color="teal"
                        w="fit-content"
                        className="ripple-btn"
                      >
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
  );
}
