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
import type { Vehicle } from '../../data/vehicles';
import { reviews as allReviews } from '../../data/reviews';
import { ImageGallery } from './ImageGallery';
import { RentalBookingModal } from './RentalBookingModal';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';

export function VehicleDetailView({
  vehicle,
  similarVehicles = [],
  showBreadcrumbs = true,
  containerized = true,
}: {
  vehicle: Vehicle;
  similarVehicles?: Vehicle[];
  showBreadcrumbs?: boolean;
  containerized?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const vehicleReviews = allReviews.filter((r) => String(r.vehicleId) === vehicle.carId);

  const [rentalOpen, setRentalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const avgRating =
    vehicleReviews.length > 0
      ? vehicleReviews.reduce((acc, r) => acc + r.rating, 0) / vehicleReviews.length
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: vehicleReviews.filter((r) => r.rating === star).length,
    pct: vehicleReviews.length
      ? (vehicleReviews.filter((r) => r.rating === star).length / vehicleReviews.length) * 100
      : 0,
  }));

  const priceDisplay = `€${vehicle.pricePerDay}/${t('vehicle.perDay')}`;

  const features = [
    vehicle.abs && 'ABS',
    vehicle.bluetooth && 'Bluetooth',
    vehicle.airConditioner && 'A/C',
    vehicle.gps && 'GPS',
    vehicle.camera && 'Camera',
    vehicle.heatedSeats && 'Heated Seats',
    vehicle.panoramicRoof && 'Panoramic Roof',
    vehicle.parkingSensors && 'Parking Sensors',
    vehicle.cruiseControl && 'Cruise Control',
    vehicle.climateControl && 'Climate Control',
    vehicle.ledHeadlights && 'LED Headlights',
    vehicle.appleCarPlay && 'Apple CarPlay',
    vehicle.androidAuto && 'Android Auto',
    vehicle.laneDepartureAlert && 'Lane Departure Alert',
    vehicle.adaptiveCruiseControl && 'Adaptive Cruise Control',
    vehicle.wirelessCharging && 'Wireless Charging',
    vehicle.electricWindows && 'Electric Windows',
    vehicle.thirdRowSeats && 'Third Row Seats',
  ].filter(Boolean) as string[];

  const specRows = [
    [t('vehicle.brand'), vehicle.carName ?? '—'],
    [t('vehicle.model'), vehicle.modelName ?? '—'],
    [t('vehicle.year'), vehicle.year],
    [t('vehicle.mileage'), vehicle.mileage ?? '—'],
    [t('vehicle.engine'), vehicle.horsePower ? `${vehicle.horsePower} HP` : '—'],
    [t('vehicle.transmission'), vehicle.transmissionType ?? '—'],
    [t('vehicle.fuel'), vehicle.fuelType ?? '—'],
    [t('vehicle.color'), vehicle.exteriorColor ?? '—'],
    [t('vehicle.seatsLabel'), vehicle.seats],
    [t('vehicle.doors'), vehicle.doors],
  ];

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
      style={{ padding: containerized ? 0 : '1rem' }}
    >
      <Box py={containerized ? 'xl' : 'lg'} px={containerized ? 0 : 'lg'}>

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
              <Text size="sm" fw={500}>{vehicle.title}</Text>
            </Breadcrumbs>
          </AnimatedSection>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: containerized ? 'minmax(0, 1fr) 340px' : '1fr',
            gap: containerized ? '2rem' : '1.5rem',
            alignItems: 'start',
            padding: containerized ? 0 : '0.5rem',
          }}
        >
          <AnimatedSection direction="left">
            <Stack gap="xl" style={{ minWidth: 0 }}>

              <ImageGallery images={vehicle.carImages} name={vehicle.title} />

              <Group gap="sm" wrap="wrap">
                <Badge color="teal" size="lg">{t('fleet.forRent')}</Badge>
                {vehicle.categoryName && (
                  <Badge variant="light" size="lg">{vehicle.categoryName}</Badge>
                )}
              </Group>

              <div>
                <Title order={1} fw={800}>{vehicle.title}</Title>
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
                    {features.length > 0 && (
                      <div>
                        <Text fw={600} mb="xs">{t('vehicle.highlights')}</Text>
                        <Group gap="xs" wrap="wrap">
                          {features.map((f) => (
                            <Badge key={f} variant="outline" size="md" radius="xl">
                              {f}
                            </Badge>
                          ))}
                        </Group>
                      </div>
                    )}
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
                          p="xl"
                          style={{
                            borderRadius: 'var(--mantine-radius-xl)',
                            position: containerized ? 'sticky' : 'static',
                            top: 90,
                          }}
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
              style={{ borderRadius: 'var(--mantine-radius-xl)', position: 'sticky', top: 90 }}
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
        {similarVehicles.length > 0 && (
          <Box mt={60}>
            <Divider mb="xl" />
            <AnimatedSection>
              <Title order={3} fw={700} mb="lg">
                {t('vehicle.similarCars')}
              </Title>
            </AnimatedSection>
            <StaggerContainer stagger={0.1}>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                {similarVehicles.map((car, i) => (
                  <StaggerItem key={car.carId} scale>
                    {/* Replace with your VehicleCard once updated for new Vehicle type */}
                    <Box p="md" className="glass-card">
                      <Text fw={600}>{car.title}</Text>
                      <Text size="sm" c="dimmed">€{car.pricePerDay}/{t('vehicle.perDay')}</Text>
                    </Box>
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