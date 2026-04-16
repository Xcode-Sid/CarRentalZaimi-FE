import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Modal,
  Stepper,
  Switch,
  Radio,
  Button,
  Text,
  Stack,
  Group,
  Divider,
  ThemeIcon,
  Image,
  Box,
  Paper,
  Progress,
  Skeleton,
  TextInput,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCheck,
  IconCalendar,
  IconSettings,
  IconShieldCheck,
  IconCash,
  IconCreditCard,
  IconInfoCircle,
  IconClock,
  IconReceipt,
  IconTag,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../contexts/AuthContext';
import type { Vehicle } from '../../data/vehicles';
import { getDayDiscount } from '../../utils/rentalPricing';
import { get, post } from '../../utils/api.utils';
import type { AdditionalService } from '../../data/bookings';
import Spinner from '../spinner/Spinner';

interface BookingForm {
  userId: string | null;
  carId: string | number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  phoneNumber: string | null;
  paymentMethod: 'cash' | 'card';
  aditionalServiceIds: string[];
}

interface Props {
  opened: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  bookedDates?: string[];
}

function AnimatedTotal({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const duration = 400;
    const stepVal = (to - from) / (duration / 16);
    let current = from;
    const timer = setInterval(() => {
      current += stepVal;
      if ((stepVal > 0 && current >= to) || (stepVal < 0 && current <= to)) {
        current = to;
        clearInterval(timer);
      }
      setDisplay(Math.round(current * 10) / 10);
    }, 16);
    prev.current = to;
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export function RentalBookingModal({ opened, onClose, vehicle, bookedDates = [] }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [stepDirection, setStepDirection] = useState<'forward' | 'back'>('forward');
  const [loading, setLoading] = useState(false);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [promotionDiscount, setPromotionDiscount] = useState<number>(0);
  const [occupiedDates, setOccupiedDates] = useState<Set<string>>(new Set());
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const form = useForm<BookingForm>({
    initialValues: {
      userId: user?.id ?? null,
      carId: vehicle.carId,
      startDate: '',
      endDate: '',
      totalPrice: 0,
      phoneNumber: user?.phoneNumber ?? null,
      paymentMethod: 'cash',
      aditionalServiceIds: [],
    },
    validate: {
      startDate: (value) =>
        !value ? (t('rental.validation.startDateRequired') ?? 'Start date is required') : null,
      endDate: (value) =>
        !value ? (t('rental.validation.endDateRequired') ?? 'End date is required') : null,
      paymentMethod: (value) =>
        !value ? (t('rental.validation.paymentRequired') ?? 'Payment method is required') : null,
    },
  });

  useEffect(() => {
    if (!opened) return;
    setLoading(true);
    get('AdditionalService/getAll')
      .then((res) => setAdditionalServices(res.data ?? []))
      .catch(() => setAdditionalServices([]))
      .finally(() => setLoading(false));
  }, [opened]);

  const bookedDateSet = useMemo(
    () => new Set(bookedDates.map((d) => new Date(d).toDateString())),
    [bookedDates],
  );


  const days = useMemo(() => {
    const { startDate, endDate } = form.values;
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [form.values.startDate, form.values.endDate]);


  // Fetch promotion whenever car + days change
  useEffect(() => {
    if (!days || days < 1) {
      setPromotionDiscount(0);
      return;
    }
    get(`Promotion/getPromotionForCar?CarId=${vehicle.carId}&NumerOfDays=${days}`)
      .then((res) => {
        const value = res.data ?? 0;
        setPromotionDiscount(value > 0 ? value : 0);
      })
      .catch(() => setPromotionDiscount(0));
  }, [vehicle.carId, days]);


  useEffect(() => {
    if (!opened) return;

    // fetch additional services
    setLoading(true);
    get('AdditionalService/getAll')
      .then((res) => setAdditionalServices(res.data ?? []))
      .catch(() => setAdditionalServices([]))
      .finally(() => setLoading(false));

    // fetch occupied/busy dates for the calendar
    fetchOccupiedDates(new Date());
  }, [opened]);

  const fetchOccupiedDates = async (viewDate: Date) => {
    const startDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    const endDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 2, 0);

    const params = new URLSearchParams({
      CarId: String(vehicle.carId),
      StartDate: startDate.toISOString(),
      EndDate: endDate.toISOString(),
    });

    try {
      const res = await get(`OccupiedCarDays/get/calendarData?${params}`);
      if (res.success && res.data) {
        const dates = new Set<string>();
        for (const item of res.data) {
          const cur = new Date(item.startDate);
          const end = new Date(item.endDate);
          while (cur <= end) {
            dates.add(cur.toDateString());
            cur.setDate(cur.getDate() + 1);
          }
        }
        setOccupiedDates(dates);
      }
    } catch {
      setOccupiedDates(new Set());
    }
  };

  // Pricing — promotion applies to base only, not addons
  const { baseBeforeDiscount, discountPct, discountAmount, baseAfterDiscount, total, isPromotion } =
    useMemo(() => {
      const base = vehicle.pricePerDay * days;
      const effectivePct = promotionDiscount > 0 ? promotionDiscount : getDayDiscount(days).percent;
      const discountedAmount = parseFloat(((effectivePct / 100) * base).toFixed(2));
      const baseAfter = parseFloat((base - discountedAmount).toFixed(2));
      const addonsCost = additionalServices
        .filter((s) => form.values.aditionalServiceIds.includes(String(s.id)))
        .reduce((sum, s) => sum + (Number(s.pricePerDay) || 0) * days, 0);

      return {
        baseBeforeDiscount: base,
        discountPct: effectivePct,
        discountAmount: discountedAmount,
        baseAfterDiscount: baseAfter,
        total: baseAfter + addonsCost,
        isPromotion: promotionDiscount > 0,
      };
    }, [vehicle.pricePerDay, days, promotionDiscount, additionalServices, form.values.aditionalServiceIds]);


  const canContinue = !!(form.values.startDate && form.values.endDate && days >= 1);

  const toggleService = (id: string) => {
    const current = form.values.aditionalServiceIds;
    const stringId = String(id);
    form.setFieldValue(
      'aditionalServiceIds',
      current.includes(stringId) ? current.filter((x) => x !== stringId) : [...current, stringId],
    );
  };

  const formatDate = (d: string) => (d ? new Date(d).toLocaleDateString('sq-AL') : '');

  const goForward = () => {
    const s = form.validateField('startDate');
    const e = form.validateField('endDate');
    if (s.hasError || e.hasError) return;
    setStepDirection('forward');
    form.setFieldValue('totalPrice', total);
    setStep(1);
    form.setFieldValue('totalPrice', total);
  };

  const goBack = () => {
    setStepDirection('back');
    setStep(0);
  };

  const stepAnimClass =
    stepDirection === 'forward' ? 'animate-step-slide-in' : 'animate-step-slide-back';

  const selectedServices = additionalServices.filter((s) =>
    form.values.aditionalServiceIds.includes(String(s.id)),
  );

  const handleConfirm = async () => {
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    setLoading(true);
    try {
      const res = await post('Booking', {
        ...form.values,
        totalPrice: total,
      });
      if (res.success) {
        notifications.show({
          title: t('success'),
          message: t('vehicle.sucessfullReservation'),
          color: 'green',
        });
        setSuccess(true);
      }
      else {

        handleClose();
      }
    } catch {
      notifications.show({
        title: t('error'),
        message: t('vehicle.reservationError'),
        color: 'red',
      });
      setLoading(false);

      handleClose();
      return;
    }

    setLoading(false);
  };

  const handleClose = () => {
    setSuccess(false);
    setStep(0);
    setStepDirection('forward');
    setLoading(false);
    setPromotionDiscount(0);
    setOccupiedDates(new Set());
    setCalendarDate(new Date());
    form.reset();
    onClose();
  };

  const primaryImage = vehicle.carImages?.[0]?.data ?? '';

  return (
    <>
      <Spinner visible={loading} />
      <Modal
        opened={opened}
        onClose={handleClose}
        title={
          success ? undefined : (
            <Group gap="sm">
              <Text fw={700} size="lg">
                {t('rental.title')}
              </Text>
            </Group>
          )
        }
        size="lg"
        centered
        radius="lg"
      >
        {!success && (
          <Progress
            value={step === 0 ? 50 : 100}
            color="teal"
            size="xs"
            radius={0}
            mb="md"
            style={{ transition: 'all 0.4s ease' }}
          />
        )}

        {success ? (
          <Box className="confetti-bg">
            <Stack align="center" gap="lg" py="xl" className="animate-bounce-in">
              <ThemeIcon size={80} radius="xl" color="green" variant="light" className="animate-glow">
                <IconCheck size={40} />
              </ThemeIcon>
              <Text size="xl" fw={700}>
                {t('rental.successTitle')}
              </Text>
              <Text c="dimmed" ta="center">
                {t('rental.successMsg')}
              </Text>
              <Paper className="glass-card" p="md" radius="md">
                <Text size="sm" c="dimmed">
                  {t('rental.bookingRef')}
                </Text>
              </Paper>
              <Button variant="outline" onClick={handleClose}>
                {t('rental.backHome')}
              </Button>
            </Stack>
          </Box>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
            <Stepper active={step} color="teal">

              {/* STEP 1 — Date selection */}
              <Stepper.Step label={t('rental.step1')} icon={<IconCalendar size={18} />}>
                <Box key={`step-0-${stepDirection}`} className={stepAnimClass}>
                  <Stack gap="md" mt="md">
                    <DatePickerInput
                      type="range"
                      label={t('rental.dateRange')}
                      value={[form.values.startDate || null, form.values.endDate || null]}
                      onChange={([start, end]) => {
                        if (start) {
                          const s = new Date(start);
                          s.setHours(12, 0, 0, 0); // noon to avoid timezone shifts
                          form.setFieldValue('startDate', s.toISOString());
                        } else {
                          form.setFieldValue('startDate', '');
                        }
                        if (end) {
                          const e = new Date(end);
                          e.setHours(12, 0, 0, 0);
                          form.setFieldValue('endDate', e.toISOString());
                        } else {
                          form.setFieldValue('endDate', '');
                        }
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      date={calendarDate}
                      onDateChange={(date) => {
                        const d = new Date(date);
                        setCalendarDate(d);
                        fetchOccupiedDates(d);           // re-fetch when user navigates months
                      }}
                      getDayProps={(date) => {
                        if (occupiedDates.has(new Date(date).toDateString())) {
                          return {
                            disabled: true,
                            style: {
                              backgroundColor: 'var(--mantine-color-default-hover)',
                              color: 'var(--mantine-color-dimmed)',
                              opacity: 0.5,
                              borderRadius: '4px',
                              cursor: 'not-allowed',
                            },
                          };
                        }
                        return {};
                      }}
                      excludeDate={(date) => bookedDateSet.has(new Date(date).toDateString())}
                      error={form.errors.startDate ?? form.errors.endDate}
                      required
                      radius="md"
                    />
                    <Button
                      fullWidth
                      variant="filled"
                      color="teal"
                      onClick={goForward}
                      disabled={!canContinue}
                      radius="md"
                      size="md"
                      mt="xs"
                    >
                      {t('rental.continue')}
                    </Button>
                  </Stack>
                </Box>
              </Stepper.Step>

              {/* STEP 2 — Addons & confirm */}
              <Stepper.Step label={t('rental.step2')} icon={<IconSettings size={18} />}>
                <Box key={`step-1-${stepDirection}`} className={stepAnimClass}>
                  <Stack gap="md" mt="md">

                    <Text fw={600}>{t('rental.addons')}</Text>

                    {loading ? (
                      <Stack gap="sm">
                        <Skeleton height={72} radius="md" />
                        <Skeleton height={72} radius="md" />
                        <Skeleton height={72} radius="md" />
                      </Stack>
                    ) : additionalServices.length === 0 ? (
                      <Text size="sm" c="dimmed" ta="center">
                        {t('rental.noAddons') ?? 'No additional services available.'}
                      </Text>
                    ) : (
                      additionalServices.map((service) => {
                        const selected = form.values.aditionalServiceIds.includes(String(service.id));
                        return (
                          <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Paper
                              className={`glass-card ${selected ? 'animate-card-glow' : ''}`}
                              p="md"
                              radius="md"
                              style={{
                                borderColor: selected ? 'var(--mantine-color-teal-6)' : undefined,
                                borderWidth: selected ? 2 : 1,
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                              }}
                            >
                              <Group justify="space-between">
                                <Group gap="sm">
                                  <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                                    <IconShieldCheck size={20} />
                                  </ThemeIcon>
                                  <div>
                                    <Text size="sm" fw={600}>
                                      {service.name}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      €{service.pricePerDay}/{t('vehicle.perDay')}
                                    </Text>
                                    {service.description && (
                                      <Text size="xs" c="dimmed">
                                        {service.description}
                                      </Text>
                                    )}
                                  </div>
                                </Group>
                                <Switch
                                  checked={selected}
                                  onChange={() => toggleService(String(service.id))}
                                  onClick={(e) => e.stopPropagation()}
                                  color="teal"
                                />
                              </Group>
                            </Paper>
                          </motion.div>
                        );
                      })
                    )}

                    <div>
                      <TextInput
                        label={t('rental.phoneNumber')}
                        placeholder="+355 6X XXX XXXX"
                        value={form.values.phoneNumber ?? ''}
                        onChange={(e) => form.setFieldValue('phoneNumber', e.currentTarget.value)}
                        error={form.errors.phoneNumber}
                        radius="md"
                      />
                      {user?.phoneNumber && (
                        <Group gap="xs" mt={6}>
                          <IconInfoCircle size={14} color="var(--mantine-color-blue-5)" style={{ flexShrink: 0 }} />
                          <Text size="xs" c="dimmed">
                            {t('rental.phoneFromProfile') ?? 'This number was taken from your profile. You can enter a different one above.'}
                          </Text>
                        </Group>
                      )}
                    </div>
                    <Divider />

                    {/* Payment method */}
                    <Radio.Group
                      label={t('rental.paymentMethod')}
                      value={form.values.paymentMethod}
                      onChange={(val) =>
                        form.setFieldValue('paymentMethod', val as 'cash' | 'card')
                      }
                      error={form.errors.paymentMethod}
                    >
                      <Stack gap="xs" mt="xs">
                        {(['cash', 'card'] as const).map((method) => (
                          <Paper
                            key={method}
                            className="glass-card"
                            p="sm"
                            radius="md"
                            style={{
                              cursor: 'pointer',
                              borderColor:
                                form.values.paymentMethod === method
                                  ? 'var(--mantine-color-teal-6)'
                                  : undefined,
                              borderWidth: form.values.paymentMethod === method ? 2 : 1,
                              transition: 'all 0.2s',
                            }}
                            onClick={() => form.setFieldValue('paymentMethod', method)}
                          >
                            <Group gap="sm">
                              {method === 'cash' ? (
                                <IconCash size={18} color="var(--mantine-color-teal-6)" />
                              ) : (
                                <IconCreditCard size={18} color="var(--mantine-color-teal-6)" />
                              )}
                              <Radio
                                value={method}
                                label={t(method === 'cash' ? 'rental.cashPickup' : 'rental.cardPickup')}
                              />
                            </Group>
                          </Paper>
                        ))}
                      </Stack>
                    </Radio.Group>

                    <Divider />

                    {/* Order summary */}
                    <Paper className="glass-card" p="md" radius="md" style={{ overflow: 'hidden' }}>
                      {/* Header band */}
                      <Box
                        px="md"
                        py="xs"
                        mx="-md"
                        mt="-md"
                        mb="md"
                        style={{
                          background: 'linear-gradient(90deg, var(--mantine-color-teal-9), var(--mantine-color-teal-7))',
                        }}
                      >
                        <Group gap="sm">
                          <Image
                            src={primaryImage}
                            w={52}
                            h={36}
                            radius="sm"
                            fit="cover"
                            fallbackSrc="/placeholder-car.png"
                            style={{ border: '2px solid rgba(255,255,255,0.2)' }}
                          />
                          <div>
                            <Text fw={700} c="white" size="sm">{vehicle.title}</Text>
                            <Text size="xs" c="rgba(255,255,255,0.7)">{t('rental.summary')}</Text>
                          </div>
                        </Group>
                      </Box>

                      <Stack gap={6}>
                        {/* Dates row */}
                        <Group justify="space-between" py={4} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                          <Group gap="xs">
                            <IconCalendar size={14} color="var(--mantine-color-teal-5)" />
                            <Text size="sm" c="dimmed">{t('rental.dates')}</Text>
                          </Group>
                          <Text size="sm" fw={500}>
                            {`${formatDate(form.values.startDate)} — ${formatDate(form.values.endDate)}`}
                          </Text>
                        </Group>

                        {/* Duration row */}
                        <Group justify="space-between" py={4} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                          <Group gap="xs">
                            <IconClock size={14} color="var(--mantine-color-teal-5)" />
                            <Text size="sm" c="dimmed">{t('rental.duration')}</Text>
                          </Group>
                          <Badge variant="light" color="teal" size="sm">{`${days} ${t('rental.days')}`}</Badge>
                        </Group>

                        {/* Base price row */}
                        <Group justify="space-between" py={4} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                          <Group gap="xs">
                            <IconReceipt size={14} color="var(--mantine-color-teal-5)" />
                            <Text size="sm" c="dimmed">{t('rental.basePrice')}</Text>
                          </Group>
                          <Text size="sm">
                            {`€${vehicle.pricePerDay}/${t('vehicle.perDay')} × ${days} = €${baseBeforeDiscount}`}
                          </Text>
                        </Group>

                        {/* Discount row */}
                        {discountPct > 0 && (
                          <>
                            <Group justify="space-between" py={4} className="animate-scale-in">
                              <Group gap="xs">
                                <IconTag size={14} color="var(--mantine-color-green-5)" />
                                <Text size="sm" c="dimmed">
                                  {isPromotion ? t('rental.promotion') : t('rental.discount')}
                                </Text>
                              </Group>
                              <Badge variant="light" color="green" size="sm">
                                {`-${discountPct}% (-€${discountAmount})`}
                              </Badge>
                            </Group>
                            <Group justify="space-between" py={4} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                              <Text size="sm" c="dimmed">{t('rental.discountedBase')}</Text>
                              <Text size="sm" fw={500}>{`€${baseAfterDiscount}`}</Text>
                            </Group>
                          </>
                        )}

                        {/* Addon rows */}
                        {selectedServices.map((s) => (
                          <Group key={s.id} justify="space-between" py={4} className="animate-scale-in"
                            style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                            <Group gap="xs">
                              <IconShieldCheck size={14} color="var(--mantine-color-teal-5)" />
                              <Text size="sm" c="dimmed">{s.name}</Text>
                            </Group>
                            <Text size="sm">{`€${s.pricePerDay} × ${days} = €${s.pricePerDay * days}`}</Text>
                          </Group>
                        ))}
                      </Stack>

                      {/* Total band */}
                      <Box
                        px="md"
                        py="sm"
                        mx="-md"
                        mb="-md"
                        mt="md"
                        style={{
                          background: 'var(--mantine-color-default-hover)',
                          borderTop: '1px solid var(--mantine-color-teal-8)',
                        }}
                      >
                        <Group justify="space-between">
                          <Text fw={700} size="md">{t('rental.total')}</Text>
                          <Text size="xl" fw={800} c="teal">
                            €<AnimatedTotal value={total} />
                          </Text>
                        </Group>
                      </Box>
                    </Paper>

                    {/* Navigation */}
                    <Group grow>
                      <Button variant="outline" onClick={goBack} radius="md" type="button">
                        {t('rental.back')}
                      </Button>
                      <Button
                        type="submit"
                        variant="filled"
                        color="teal"
                        radius="md"
                      >
                        {t('rental.confirm')}
                      </Button>
                    </Group>
                  </Stack>
                </Box>
              </Stepper.Step>
            </Stepper>
          </form>
        )}
      </Modal>
    </>
  );
}
