import { useState, useEffect } from 'react';
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
  Skeleton,
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
import { get, post } from '../../utils/apiUtils';


import type { WorkingHoursEntry } from '../../types/company';

function parseWorkingHours(raw?: string): WorkingHoursEntry[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

type ContactCompanyProfile = Pick<import('../../types/company').CompanyProfileDto, 'email' | 'phone' | 'address' | 'workingHours'>;

export function ContactSection() {
  const { t } = useTranslation();
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [profile, setProfile] = useState<ContactCompanyProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await get('CompanyProfile/get');
        if (res.success) {
          setProfile(res.data as ContactCompanyProfile);
        }
      } catch {
        // silently fail — cards will show '—'
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const contactInfo = [
    {
      icon: IconMapPin,
      titleKey: 'contact.officeTitle',
      value: profile?.address,
      color: 'teal',
      renderValue: null,
    },
    {
      icon: IconPhone,
      titleKey: 'contact.phoneTitle',
      value: profile?.phone,
      color: 'teal',
      renderValue: null,
    },
    {
      icon: IconMail,
      titleKey: 'contact.emailTitle',
      value: profile?.email,
      color: 'blue',
      renderValue: null,
    },
    {
      icon: IconClock,
      titleKey: 'contact.hoursTitle',
      value: profile?.workingHours,
      color: 'orange',
      renderValue: () => {
        const hours = parseWorkingHours(profile?.workingHours);
        if (!hours.length) return <Text size="sm" c={isDark ? 'dimmed' : undefined} style={!isDark ? { color: '#868e96' } : undefined}>—</Text>;
        return (
          <Stack gap={2}>
            {hours.map((h) => (
              <Text key={h.day} size="sm" c={isDark ? 'dimmed' : undefined} style={!isDark ? { color: '#868e96' } : undefined}>
                <Text component="span" fw={600} size="sm" style={!isDark ? { color: '#495057' } : undefined}>
                  {h.day}:
                </Text>{' '}
                {h.openTime} – {h.closeTime}
              </Text>
            ))}
          </Stack>
        );
      },
    },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    if (name && email && message) {
      try {
        const res = await post('ContactMessage/contact', {
          fullName: name,
          email,
          phone: phone || null,
          subject: subject || null,
          message,
        });

        if (res.success) {
          notifications.show({
            title: t('success'),
            message: t('contact.sendSuccess'),
            color: 'teal',
          });
          setName('');
          setEmail('');
          setPhone('');
          setSubject('');
          setMessage('');
        } else {
          notifications.show({
            title: t('error'),
            message: t('contact.sendError'),
            color: 'red',
          });
        }
      } catch {
        notifications.show({
          title: t('error'),
          message: t('contact.sendError'),
          color: 'red',
        });
      } finally {
        setLoading(false)
      }
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
                    loading={loading}
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
                          {loadingProfile ? (
                            <Skeleton height={16} width="70%" radius="sm" />
                          ) : item.renderValue ? (
                            item.renderValue()
                          ) : (
                            <Text
                              size="sm"
                              c={isDark ? 'dimmed' : undefined}
                              style={!isDark ? { color: '#868e96' } : undefined}
                            >
                              {item.value ?? '—'}
                            </Text>
                          )}
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