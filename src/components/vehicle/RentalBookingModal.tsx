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
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../contexts/AuthContext';
import type { Vehicle } from '../../data/vehicles';
import { getDayDiscount } from '../../utils/rentalPricing';
import { get, post } from '../../utils/api.utils';
import type { AdditionalService } from '../../data/bookings';

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
  const [display, setDisplay] = useState(0);
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
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  const [promotionDiscount, setPromotionDiscount] = useState<number>(0);

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
    setServicesLoading(true);
    get('AdditionalService/getAll')
      .then((res) => setAdditionalServices(res.data ?? []))
      .catch(() => setAdditionalServices([]))
      .finally(() => setServicesLoading(false));
  }, [opened]);

  const bookedDateSet = useMemo(
    () => new Set(bookedDates.map((d) => new Date(d).toDateString())),
    [bookedDates],
  );


  const days = useMemo(() => {
    const { startDate, endDate } = form.values;
    if (!startDate || !endDate) return 0;
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
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
    }, [vehicle.pricePerDay, days, promotionDiscount, additionalServices, JSON.stringify(form.values.aditionalServiceIds)]);


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

    setConfirmLoading(true);
    try {
      var res = await post('Booking', form.values);
      if (res.success) {
        notifications.show({
          title: t('success'),
          message: t('vehicle.sucessfullReservation'),
          color: 'green',
        });
      }
    } catch {
      notifications.show({
        title: t('error'),
        message: t('vehicle.reservationError'),
        color: 'red',
      });
      setConfirmLoading(false);
      return;
    }

    setConfirmLoading(false);
    setSuccess(true);
  };

  const handleClose = () => {
    setSuccess(false);
    setStep(0);
    setStepDirection('forward');
    setConfirmLoading(false);
    setPromotionDiscount(0);
    form.reset();
    onClose();
  };

  const primaryImage = vehicle.carImages?.[0]?.data ?? '';

  return (
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
                      form.setFieldValue('startDate', start ? new Date(start).toISOString() : '');
                      form.setFieldValue('endDate', end ? new Date(end).toISOString() : '');
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
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

                  {servicesLoading ? (
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

                  <TextInput
                    label={t('rental.phoneNumber')}
                    placeholder="+355 6X XXX XXXX"
                    value={form.values.phoneNumber ?? ''}
                    onChange={(e) => form.setFieldValue('phoneNumber', e.currentTarget.value)}
                    error={form.errors.phoneNumber}
                    radius="md"
                  />
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
                  <Paper className="glass-card" p="md" radius="md">
                    <Text fw={600} mb="sm">
                      {t('rental.summary')}
                    </Text>
                    <Group gap="sm" mb="xs">
                      <Image
                        src={primaryImage}
                        w={60}
                        h={40}
                        radius="sm"
                        fit="cover"
                        fallbackSrc="/placeholder-car.png"
                      />
                      <Text fw={500}>{vehicle.title}</Text>
                    </Group>

                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('account.rentalType')}</Text>
                        <Text size="sm" fw={600}>{t('account.typeDay')}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('rental.dates')}</Text>
                        <Text size="sm">
                          {`${formatDate(form.values.startDate)} — ${formatDate(form.values.endDate)}`}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('rental.duration')}</Text>
                        <Text size="sm">{`${days} ${t('rental.days')}`}</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('rental.basePrice')}</Text>
                        <Text size="sm">
                          {`€${vehicle.pricePerDay}/${t('vehicle.perDay')} × ${days} = €${baseBeforeDiscount}`}
                        </Text>
                      </Group>

                      {discountPct > 0 && (
                        <>
                          <Group justify="space-between" className="animate-scale-in">
                            <Text size="sm" c="dimmed">
                              {isPromotion ? t('rental.promotion') : t('rental.discount')}
                            </Text>
                            <Text size="sm" c="teal" fw={700}>
                              {`-${discountPct}% (-€${discountAmount})`}
                            </Text>
                          </Group>
                          <Group justify="space-between">
                            <Text size="sm" c="dimmed">{t('rental.discountedBase')}</Text>
                            <Text size="sm">{`€${baseAfterDiscount}`}</Text>
                          </Group>
                        </>
                      )}

                      {selectedServices.map((s) => (
                        <Group key={s.id} justify="space-between" className="animate-scale-in">
                          <Text size="sm" c="dimmed">{s.name}</Text>
                          <Text size="sm">{`€${s.pricePerDay} × ${days} = €${s.pricePerDay * days}`}</Text>
                        </Group>
                      ))}

                      <Divider />
                      <Group justify="space-between">
                        <Text size="lg" fw={700}>{t('rental.total')}</Text>
                        <Text size="lg" fw={700} c="teal">
                          €{total}
                        </Text>
                      </Group>
                    </Stack>
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
                      loading={confirmLoading}
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
  );
}