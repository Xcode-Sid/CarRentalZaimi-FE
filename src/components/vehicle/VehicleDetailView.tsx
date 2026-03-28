import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Group,
  Stack,
  Title,
  Text,
  Badge,
  Button,
  Tabs,
  Table,
  Rating,
  Avatar,
  Textarea,
  Progress,
  ActionIcon,
  Tooltip,
  Box,
  Divider,
  Breadcrumbs,
  Anchor,
  SimpleGrid,
} from '@mantine/core';
import {
  IconShieldCheck,
  IconCopy,
  IconBrandWhatsapp,
  IconThumbUp,
  IconThumbDown,
  IconChevronRight,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import { vehicles } from '../../data/vehicles';
import { reviews as allReviews } from '../../data/reviews';
import { ImageGallery } from './ImageGallery';
import { RentalBookingModal } from './RentalBookingModal';
import { VehicleCard } from '../common/VehicleCard';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

export function VehicleDetailView({
  vehicleId,
  showBreadcrumbs = true,
  containerized = true,
}: {
  vehicleId: number;
  showBreadcrumbs?: boolean;
  containerized?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const vehicle = vehicles.find((v) => v.id === Number(vehicleId));
  const vehicleReviews = allReviews.filter((r) => r.vehicleId === Number(vehicleId));

  const [rentalOpen, setRentalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  if (!vehicle) {
    const Content = (
      <Stack>
        <Text>{t('common.error')}</Text>
        <Button mt="md" onClick={() => navigate('/fleet')}>{t('common.back')}</Button>
      </Stack>
    );
    return containerized ? (
      <Container size="lg" py="xl">{Content}</Container>
    ) : (
      <Box p="xl">{Content}</Box>
    );
  }

  const avgRating =
    vehicleReviews.length > 0
      ? vehicleReviews.reduce((acc, r) => acc + r.rating, 0) / vehicleReviews.length
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: vehicleReviews.filter((r) => r.rating === star).length,
    pct: vehicleReviews.length ? (vehicleReviews.filter((r) => r.rating === star).length / vehicleReviews.length) * 100 : 0,
  }));

  const priceDisplay = `€${vehicle.price}/${t('vehicle.perDay')}`;

  const specRows = [
    [t('vehicle.brand'), vehicle.name.split(' ').slice(0, -1).join(' ')],
    [t('vehicle.model'), vehicle.name.split(' ').slice(-1)[0]],
    [t('vehicle.year'), vehicle.year],
    [t('vehicle.mileage'), vehicle.specs.mileage],
    [t('vehicle.engine'), vehicle.specs.engine],
    [t('vehicle.transmission'), vehicle.specs.transmission],
    [t('vehicle.fuel'), vehicle.specs.fuel],
    [t('vehicle.color'), vehicle.specs.color],
    [t('vehicle.seatsLabel'), vehicle.specs.seats],
    [t('vehicle.doors'), vehicle.specs.doors],
  ];

  const similarCars = vehicles
    .filter((v) => v.id !== vehicle.id && v.category === vehicle.category)
    .slice(0, 4);

  const handleReviewSubmit = () => {
    if (reviewRating && reviewText) {
      notifications.show({ message: t('vehicle.reviewSuccess'), color: 'teal' });
      setReviewRating(0);
      setReviewText('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    notifications.show({ message: t('vehicle.linkCopied'), color: 'teal' });
  };

  const Body = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Box py={containerized ? 'xl' : 0}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <AnimatedSection>
            <Breadcrumbs
              separator={<IconChevronRight size={14} style={{ opacity: 0.5 }} />}
              mb="lg"
            >
              <Anchor component="button" size="sm" c="dimmed" onClick={() => navigate('/')}>
                {t('nav.home')}
              </Anchor>
              <Anchor component="button" size="sm" c="dimmed" onClick={() => navigate('/fleet')}>
                {t('nav.fleet')}
              </Anchor>
              <Text size="sm" fw={500}>{vehicle.name}</Text>
            </Breadcrumbs>
          </AnimatedSection>
        )}

        <div
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem', alignItems: 'start' }}
          className="vehicle-detail-grid"
        >
          <AnimatedSection direction="left">
            <Stack gap="xl" style={{ minWidth: 0 }}>
              <ImageGallery images={vehicle.images} name={vehicle.name} />

              <Group gap="sm" wrap="wrap">
                <Badge color="teal" size="lg">{t('fleet.forRent')}</Badge>
                <Badge variant="light" size="lg">{vehicle.category}</Badge>
                <Group gap={6}>
                  <span className={`status-dot ${vehicle.status === 'available' ? 'status-dot-available' : vehicle.status === 'maintenance' ? 'status-dot-maintenance' : 'status-dot-unavailable'}`} />
                  <Text size="xs" c="dimmed" tt="capitalize">{vehicle.status}</Text>
                </Group>
              </Group>

              <div>
                <Title order={1} fw={800}>{vehicle.name}</Title>
                <Text c="dimmed">{vehicle.year}</Text>
              </div>

              <Tabs defaultValue="overview" color="teal">
                <Tabs.List>
                  <Tabs.Tab value="overview">{t('vehicle.overview')}</Tabs.Tab>
                  <Tabs.Tab value="specs">{t('vehicle.specifications')}</Tabs.Tab>
                  <Tabs.Tab value="reviews">
                    {t('vehicle.reviews')} ({vehicleReviews.length})
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="overview" pt="lg">
                  <Stack gap="lg">
                    <div>
                      <Text fw={600} mb="xs">{t('vehicle.description')}</Text>
                      <Text c="dimmed">{vehicle.description}</Text>
                    </div>
                    <div>
                      <Text fw={600} mb="xs">{t('vehicle.highlights')}</Text>
                      <Group gap="xs" wrap="wrap">
                        {vehicle.features.map((f) => (
                          <Badge key={f} variant="outline" size="md" radius="xl">
                            {f}
                          </Badge>
                        ))}
                      </Group>
                    </div>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="specs" pt="lg">
                  <Table.ScrollContainer minWidth={400}>
                    <Table striped highlightOnHover>
                      <Table.Tbody>
                        {specRows.map(([label, value]) => (
                          <Table.Tr key={String(label)}>
                            <Table.Td fw={500}>{label}</Table.Td>
                            <Table.Td>{value}</Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                </Tabs.Panel>

                <Tabs.Panel value="reviews" pt="lg">
                  <Stack gap="lg">
                    <Group align="flex-start" gap="xl" wrap="wrap">
                      <Stack align="center" gap={4}>
                        <Text size="3rem" fw={800}>{avgRating.toFixed(1)}</Text>
                        <Rating value={avgRating} readOnly fractions={2} />
                        <Text size="sm" c="dimmed">{vehicleReviews.length} {t('vehicle.reviews')}</Text>
                      </Stack>
                      <Stack gap={4} style={{ flex: 1, minWidth: 150 }}>
                        {ratingBreakdown.map((rb) => (
                          <Group key={rb.star} gap="xs" wrap="nowrap">
                            <Text size="sm" w={10}>{rb.star}</Text>
                            <Progress value={rb.pct} color="teal" style={{ flex: 1 }} size="sm" />
                            <Text size="xs" c="dimmed" w={20}>{rb.count}</Text>
                          </Group>
                        ))}
                      </Stack>
                    </Group>

                    <Divider />

                    {vehicleReviews.map((review, idx) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.3 }}
                      >
                        <Box
                          className="glass-card"
                          p="md"
                          style={{ borderRadius: 'var(--mantine-radius-md)' }}
                        >
                          <Group justify="space-between" mb="xs" wrap="wrap">
                            <Group gap="sm">
                              <Avatar color="teal" radius="xl" size="sm">
                                {review.authorAvatar}
                              </Avatar>
                              <div>
                                <Text size="sm" fw={600}>{review.authorName}</Text>
                                <Text size="xs" c="dimmed">{review.date}</Text>
                              </div>
                            </Group>
                            <Rating value={review.rating} readOnly size="sm" />
                          </Group>
                          <Text size="sm" c="dimmed">{review.text}</Text>
                          <Group gap="lg" mt="sm">
                            <Group gap={4}>
                              <ActionIcon variant="subtle" size="sm"><IconThumbUp size={14} /></ActionIcon>
                              <Text size="xs" c="dimmed">{review.helpfulCount}</Text>
                            </Group>
                            <Group gap={4}>
                              <ActionIcon variant="subtle" size="sm"><IconThumbDown size={14} /></ActionIcon>
                              <Text size="xs" c="dimmed">{review.notHelpfulCount}</Text>
                            </Group>
                          </Group>
                        </Box>
                      </motion.div>
                    ))}

                    <Divider />

                    <Stack gap="sm">
                      <Text fw={600}>{t('vehicle.writeReview')}</Text>
                      <Rating value={reviewRating} onChange={setReviewRating} size="lg" />
                      <Textarea
                        placeholder={t('vehicle.reviewPlaceholder')}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.currentTarget.value)}
                        minRows={3}
                      />
                      <Button
                        variant="filled"
                        color="teal"
                        onClick={handleReviewSubmit}
                        disabled={!reviewRating || !reviewText}
                      >
                        {t('vehicle.submitReview')}
                      </Button>
                    </Stack>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Stack>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.2} scale>
            <Box
              className="glass-card"
              p="xl"
              style={{
                borderRadius: 'var(--mantine-radius-xl)',
                position: 'sticky',
                top: 90,
              }}
            >
              <Stack gap="md">
                <Text size="2rem" fw={800} c="teal">{priceDisplay}</Text>

                <Badge
                  leftSection={<IconShieldCheck size={14} />}
                  color="green"
                  variant="light"
                  size="lg"
                  fullWidth
                >
                  {t('vehicle.warranty')}
                </Badge>

                <Stack gap={4}>
                  {specRows.slice(0, 4).map(([label, val]) => (
                    <Group key={String(label)} justify="space-between">
                      <Text size="sm" c="dimmed">{label}</Text>
                      <Text size="sm" fw={500}>{val}</Text>
                    </Group>
                  ))}
                </Stack>

                <Divider />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    fullWidth
                    size="lg"
                    variant="filled"
                    color="teal"
                    onClick={() => setRentalOpen(true)}
                    className="ripple-btn"
                  >
                    {t('vehicle.rentNow')}
                  </Button>
                </motion.div>
                <Button fullWidth variant="outline" color="teal">
                  {t('vehicle.contact')}
                </Button>

                <Text size="xs" c="dimmed" ta="center">
                  {t('vehicle.moneyBack')}
                </Text>

                <Divider />

                <Group justify="center" gap="xs">
                  <Tooltip label={t('vehicle.copyLink')}>
                    <ActionIcon variant="subtle" onClick={handleCopyLink}>
                      <IconCopy size={18} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label={t('vehicle.whatsapp')}>
                    <ActionIcon variant="subtle" color="green">
                      <IconBrandWhatsapp size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Stack>
            </Box>
          </AnimatedSection>
        </div>

        {/* Similar Cars */}
        {similarCars.length > 0 && (
          <Box mt={60}>
            <Divider mb="xl" />
            <AnimatedSection>
              <Title order={3} fw={700} mb="lg">
                {t('vehicle.similarCars') || 'Similar Cars'}
              </Title>
            </AnimatedSection>
            <StaggerContainer stagger={0.1}>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                {similarCars.map((car, i) => (
                  <StaggerItem key={car.id} scale>
                    <VehicleCard vehicle={car} index={i} />
                  </StaggerItem>
                ))}
              </SimpleGrid>
            </StaggerContainer>
          </Box>
        )}

        <RentalBookingModal
          opened={rentalOpen}
          onClose={() => setRentalOpen(false)}
          vehicle={vehicle}
        />
      </Box>
    </motion.div>
  );

  return containerized ? <Container size="xl">{Body}</Container> : Body;
}

