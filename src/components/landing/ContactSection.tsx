import { useState } from 'react';
import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
  Button,
  Paper,
  ThemeIcon,
  Group,
  Box,
  useMantineColorScheme,
} from '@mantine/core';
import {
  IconMapPin,
  IconPhone,
  IconMail,
  IconClock,
  IconSend,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

const contactInfo = [
  { icon: IconMapPin, titleKey: 'contact.officeTitle', valueKey: 'contact.officeAddress', color: 'teal' },
  { icon: IconPhone, titleKey: 'contact.phoneTitle', valueKey: 'contact.phoneValue', color: 'teal' },
  { icon: IconMail, titleKey: 'contact.emailTitle', valueKey: 'contact.emailValue', color: 'blue' },
  { icon: IconClock, titleKey: 'contact.hoursTitle', valueKey: 'contact.hoursValue', color: 'orange' },
];

export function ContactSection() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (name && email && message) {
      notifications.show({
        title: '✅',
        message: t('contact.sendSuccess'),
        color: 'teal',
      });
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    }
  };

  return (
    <Box id="contact" py={80} style={{ position: 'relative', scrollMarginTop: 80 }}>
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          background: isDark
            ? 'linear-gradient(180deg, transparent 0%, rgba(0,191,165,0.03) 50%, transparent 100%)'
            : '#ffffff',
          pointerEvents: 'none',
        }}
      />
      <Container size="lg" style={{ position: 'relative' }}>
        <AnimatedSection scale>
          <Stack align="center" gap="xs" mb={50}>
            <Title order={2} ta="center" fw={800} style={!isDark ? { color: '#1a1b1e' } : undefined}>
              {t('contact.title')}
            </Title>
            <Text
              ta="center"
              maw={500}
              size="lg"
              c={isDark ? 'dimmed' : undefined}
              style={!isDark ? { color: '#868e96' } : undefined}
            >
              {t('contact.subtitle')}
            </Text>
          </Stack>
        </AnimatedSection>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          {/* Contact form */}
          <AnimatedSection direction="left" delay={0.1}>
            <Paper
              className="glass-card"
              p="xl"
              radius="lg"
              style={{
                ...(!isDark && {
                  background: '#ffffff',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                }),
              }}
            >
              <Stack gap="md">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label={t('contact.nameLabel')}
                    placeholder={t('contact.namePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
                    required
                    radius="md"
                  />
                  <TextInput
                    label={t('contact.emailLabel')}
                    placeholder={t('contact.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                    required
                    radius="md"
                  />
                </SimpleGrid>
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <TextInput
                    label={t('contact.phoneLabel')}
                    placeholder={t('contact.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.currentTarget.value)}
                    radius="md"
                  />
                  <TextInput
                    label={t('contact.subjectLabel')}
                    placeholder={t('contact.subjectPlaceholder')}
                    value={subject}
                    onChange={(e) => setSubject(e.currentTarget.value)}
                    radius="md"
                  />
                </SimpleGrid>
                <Textarea
                  label={t('contact.messageLabel')}
                  placeholder={t('contact.messagePlaceholder')}
                  value={message}
                  onChange={(e) => setMessage(e.currentTarget.value)}
                  required
                  minRows={5}
                  radius="md"
                />
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="filled"
                    color="teal"
                    size="md"
                    fullWidth
                    leftSection={<IconSend size={18} />}
                    onClick={handleSubmit}
                    disabled={!name || !email || !message}
                    radius="md"
                    className="ripple-btn"
                  >
                    {t('contact.send')}
                  </Button>
                </motion.div>
              </Stack>
            </Paper>
          </AnimatedSection>

          {/* Contact info cards */}
          <StaggerContainer stagger={0.12} delay={0.2}>
            <Stack gap="md">
              {contactInfo.map((item) => (
                <StaggerItem key={item.titleKey} direction="right">
                  <motion.div whileHover={{ x: 6 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Paper
                      className="glass-card card-shimmer"
                      p="lg"
                      radius="lg"
                      style={{
                        ...(!isDark && {
                          background: '#ffffff',
                          border: '1px solid #e9ecef',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                        }),
                      }}
                    >
                      <Group gap="md" align="flex-start">
                        <motion.div
                          whileHover={{ rotate: 15 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <ThemeIcon size={48} radius="xl" variant="light" color={item.color}>
                            <item.icon size={24} />
                          </ThemeIcon>
                        </motion.div>
                        <Stack gap={2} style={{ flex: 1 }}>
                          <Text fw={700} size="sm" style={!isDark ? { color: '#1a1b1e' } : undefined}>
                            {t(item.titleKey)}
                          </Text>
                          <Text
                            size="sm"
                            c={isDark ? 'dimmed' : undefined}
                            style={!isDark ? { color: '#868e96' } : undefined}
                          >
                            {t(item.valueKey)}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stack>
          </StaggerContainer>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
