import { useState, useEffect } from 'react';
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
  Modal,
  ThemeIcon,
  Paper,
} from '@mantine/core';
import {
  IconShieldCheck,
  IconCopy,
  IconBrandWhatsapp,
  IconChevronRight,
  IconLock,
  IconEdit,
  IconTrash,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { motion } from 'framer-motion';
import type { Vehicle } from '../../data/vehicles';
import { ImageGallery } from './ImageGallery';
import { RentalBookingModal } from './RentalBookingModal';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../common/AnimatedSection';
import { useAuth } from '../../contexts/AuthContext';
import { get, post, put, del } from '../../utils/api.utils';
import Spinner from '../spinner/Spinner';
import { toImagePath } from '../../utils/general';

type CarReview = {
  id: string;
  createdOn: string;
  modifiedOn: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    image: {
      imageName: string;
      imageData: string;
    } | null;
  };
};

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
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [rentalOpen, setRentalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const [vehicleReviews, setVehicleReviews] = useState<CarReview[]>([]);

  const [editingReview, setEditingReview] = useState<CarReview | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editText, setEditText] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  const refreshReviews = async () => {
    const res = await get(`CarReview/getAll/${vehicle.carId}`);
    setVehicleReviews(res.data);
  };

  useEffect(() => {
    if (activeTab !== 'reviews') return;

    const fetchReviews = async () => {
      setLoading(true);
      try {
        await refreshReviews();
      } catch {
        notifications.show({
          title: t('error'),
          message: t('vehicle.reviewError'),
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [activeTab, vehicle.carId]);

  const avgRating =
    Array.isArray(vehicleReviews) && vehicleReviews.length > 0
      ? vehicleReviews.reduce((acc, r) => acc + r.rating, 0) / vehicleReviews.length
      : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: Array.isArray(vehicleReviews) ? vehicleReviews.filter((r) => r.rating === star).length : 0,
    pct:
      Array.isArray(vehicleReviews) && vehicleReviews.length
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

  const handleReviewSubmit = async () => {
    if (!reviewRating || !reviewText) return;
    setLoading(true);
    try {
      const response = await post('CarReview/create', {
        userId: user?.id,
        carId: vehicle.carId,
        rating: reviewRating,
        comment: reviewText,
      });

      if (!response.success) throw new Error('Failed to submit review');

      notifications.show({ title: t('success'), message: t('vehicle.reviewSuccess'), color: 'teal' });
      setReviewRating(0);
      setReviewText('');
      await refreshReviews();
    } catch {
      notifications.show({ title: t('error'), message: t('vehicle.reviewError'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (review: CarReview) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditText(review.comment);
  };

  const handleEditSubmit = async () => {
    if (!editingReview || !editRating || !editText) return;
    setLoading(true);
    try {
      await put(`CarReview/update/${editingReview.id}`, {
        rating: editRating,
        comment: editText,
      });

      notifications.show({ title: t('success'), message: t('vehicle.reviewUpdated') ?? 'Review updated!', color: 'teal' });
      setEditingReview(null);
      await refreshReviews();
    } catch {
      notifications.show({ title: t('error'), message: t('vehicle.reviewError'), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingReviewId) return;
    setLoading(true);
    try {
      await del(`CarReview/${deletingReviewId}`);

      notifications.show({ title: t('success'), message: t('vehicle.reviewDeleted') ?? 'Review deleted!', color: 'teal' });
      setDeletingReviewId(null);
      setVehicleReviews((prev) => prev.filter((r) => r.id !== deletingReviewId));
    } catch {
      notifications.show({ title: t('error'), message: t('vehicle.reviewError'), color: 'red' });
    } finally {
      setLoading(false);
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

              <Tabs value={activeTab} onChange={setActiveTab} color="teal">
                <Tabs.List>
                  <Tabs.Tab value="overview">{t('vehicle.overview')}</Tabs.Tab>
                  <Tabs.Tab value="specs">{t('vehicle.specifications')}</Tabs.Tab>
                  <Tabs.Tab value="reviews">
                    {t('vehicle.reviews')} ({vehicle.totalReviews ?? vehicleReviews.length})
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
                        <Text size="sm" c="dimmed">
                          {vehicle.totalReviews ?? vehicleReviews.length} {t('vehicle.reviews')}
                        </Text>
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

                    {loading ? (
                      <Text c="dimmed" ta="center">{t('loading') ?? 'Loading...'}</Text>
                    ) : vehicleReviews.length === 0 ? (
                      <Text c="dimmed" ta="center">{t('vehicle.noReviews')}</Text>
                    ) : (
                      vehicleReviews.map((review, idx) => {
                        const isOwner = user?.id === review.user.id;

                        return (
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
                              style={{ borderRadius: 'var(--mantine-radius-xl)' }}
                            >
                              <Group justify="space-between" mb="xs" wrap="wrap">
                                <Group gap="sm">
                                  <Avatar
                                    color="teal"
                                    radius="xl"
                                    size="sm"
                                    src={review.user.image ? toImagePath(review.user.image.imageData) : undefined}
                                  >
                                    {!review.user.image?.imageData &&
                                      `${review.user.firstName?.[0] ?? ''}${review.user.lastName?.[0] ?? ''}`}
                                  </Avatar>
                                  <div>
                                    <Text size="sm" fw={600}>
                                      {review.user.firstName} {review.user.lastName}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      {new Date(review.createdOn).toLocaleDateString()}
                                    </Text>
                                  </div>
                                </Group>

                                <Group gap="xs">
                                  <Rating value={review.rating} readOnly size="sm" />
                                  {isOwner && (
                                    <>
                                      <Tooltip label={t('vehicle.editReview')}>
                                        <ActionIcon
                                          variant="subtle"
                                          color="teal"
                                          size="sm"
                                          onClick={() => handleEditOpen(review)}
                                        >
                                          <IconEdit size={15} />
                                        </ActionIcon>
                                      </Tooltip>
                                      <Tooltip label={t('vehicle.deleteReview')}>
                                        <ActionIcon
                                          variant="subtle"
                                          color="red"
                                          size="sm"
                                          onClick={() => setDeletingReviewId(review.id)}
                                        >
                                          <IconTrash size={15} />
                                        </ActionIcon>
                                      </Tooltip>
                                    </>
                                  )}
                                </Group>
                              </Group>
                              <Text size="sm" c="dimmed">{review.comment}</Text>
                            </Box>
                          </motion.div>
                        );
                      })
                    )}

                    <Divider />

                    {user ? (
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
                    ) : (
                      <Button
                        variant="subtle"
                        color="teal"
                        leftSection={<IconLock size={16} />}
                        onClick={() => navigate('/login')}
                        fullWidth
                      >
                        {t('vehicle.loginToReview')}
                      </Button>
                    )}
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
                {similarVehicles.map((car) => (
                  <StaggerItem key={car.carId} scale>
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

        <Modal
          opened={!!editingReview}
          onClose={() => setEditingReview(null)}
          title={
            <Group gap={10}>
              <ThemeIcon color="teal" variant="light" size={32} radius="md">
                <IconEdit size={16} />
              </ThemeIcon>
              <Text fw={500} size="md">{t('vehicle.editReview')}</Text>
            </Group>
          }
          size="md"
          centered
          radius="lg"
          styles={{
            header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
            body: { padding: '20px 24px 24px' },
          }}
        >
          <Stack gap="md">
            <div>
              <Text size="sm" fw={500} mb={8}>{t('vehicle.ratingLabel')}</Text>
              <Rating value={editRating} onChange={setEditRating} size="lg" color="yellow" />
            </div>
            <Textarea
              label={t('vehicle.commentLabel')}
              placeholder={t('vehicle.reviewPlaceholder')}
              value={editText}
              onChange={(e) => setEditText(e.currentTarget.value)}
              minRows={3}
              radius="md"
              styles={{
                input: { borderColor: 'var(--mantine-color-default-border)' },
              }}
            />
            <Group justify="flex-end" gap="sm" mt={4}>
              <Button variant="default" radius="md" onClick={() => setEditingReview(null)}>
                {t('cancel') ?? 'Cancel'}
              </Button>
              <Button
                color="teal"
                radius="md"
                leftSection={<IconDeviceFloppy size={16} />}
                disabled={!editRating || !editText}
                loading={loading}
                onClick={handleEditSubmit}
              >
                {t('save')}
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={!!deletingReviewId}
          onClose={() => setDeletingReviewId(null)}
          title={
            <Group gap={10}>
              <ThemeIcon color="red" variant="light" size={32} radius="md">
                <IconTrash size={16} />
              </ThemeIcon>
              <Text fw={500} size="md">{t('vehicle.deleteReview')}</Text>
            </Group>
          }
          size="sm"
          centered
          radius="lg"
          styles={{
            header: { paddingBottom: 12, borderBottom: '0.5px solid var(--mantine-color-default-border)' },
            body: { padding: '20px 24px 24px' },
          }}
        >
          <Stack gap="lg" align="center">
            <Paper
              radius="md"
              p="md"
              w="100%"
              style={{
                background: 'var(--mantine-color-red-light)',
                border: '0.5px solid var(--mantine-color-red-light-hover)',
              }}
            >
              <Stack gap={4} align="center">
                <Text size="sm" ta="center" fw={500} c="red.8">
                  {t('vehicle.deleteReviewConfirm') ?? 'Are you sure you want to delete this review?'}
                </Text>
                <Text size="xs" ta="center" c="dimmed">
                  {t('carData.deleteUndone') ?? 'This action cannot be undone.'}
                </Text>
              </Stack>
            </Paper>

            <Group w="100%" gap="sm">
              <Button
                variant="default"
                flex={1}
                radius="md"
                onClick={() => setDeletingReviewId(null)}
                disabled={loading}
              >
                {t('cancel') ?? 'Cancel'}
              </Button>
              <Button
                color="red"
                flex={1}
                radius="md"
                loading={loading}
                leftSection={<IconTrash size={15} />}
                onClick={handleDeleteConfirm}
              >
                {t('delete')}
              </Button>
            </Group>
          </Stack>
        </Modal>

      </Box>
    </motion.div>
  );

  return containerized ? (
    <>
      <Spinner visible={loading} />
      <Container size="xl">{Body}</Container>
    </>
  ) : Body;
}