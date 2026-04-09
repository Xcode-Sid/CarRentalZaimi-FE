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
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCheck,
  IconCalendar,
  IconSettings,
  IconShieldCheck,
  IconBabyCarriage,
  IconCash,
  IconCreditCard,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookings } from '../../contexts/BookingsContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Vehicle } from '../../data/vehicles';
import { getDayDiscount, getDiscountedBaseTotal } from '../../utils/rentalPricing';

interface Props {
  opened: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

function AnimatedTotal({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const duration = 400;
    const step = (to - from) / (duration / 16);
    let current = from;
    const timer = setInterval(() => {
      current += step;
      if ((step > 0 && current >= to) || (step < 0 && current <= to)) {
        current = to;
        clearInterval(timer);
      }
      setDisplay(Math.round(current));
    }, 16);
    prev.current = to;
    return () => clearInterval(timer);
  }, [value]);

  return <>{display}</>;
}

export function RentalBookingModal({ opened, onClose, vehicle }: Props) {
  const { t } = useTranslation();
  const { addBooking } = useBookings();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [stepDirection, setStepDirection] = useState<'forward' | 'back'>('forward');

  const [dateRange, setDateRange] = useState<[string | null, string | null]>([null, null]);

  const [insurance, setInsurance] = useState(false);
  const [gps, setGps] = useState(false);
  const [childSeat, setChildSeat] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const days = useMemo(() => {
    if (dateRange[0] && dateRange[1]) {
      const start = new Date(dateRange[0]);
      const end = new Date(dateRange[1]);
      const diff = end.getTime() - start.getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
    return 0;
  }, [dateRange]);

  const { baseBeforeDiscount, discountPct, discountAmount, baseAfterDiscount, insuranceCost, gpsCost, childSeatCost, total } = useMemo(() => {
    const base = vehicle.pricePerDay * days;
    const discount = getDayDiscount(days);
    const discounted = getDiscountedBaseTotal(base, discount.percent);
    const ins = insurance ? 15 * days : 0;
    const g = gps ? 10 * days : 0;
    const c = childSeat ? 5 * days : 0;
    return {
      baseBeforeDiscount: base,
      discountPct: discount.percent,
      discountAmount: discount.amount,
      baseAfterDiscount: discounted.total,
      insuranceCost: ins,
      gpsCost: g,
      childSeatCost: c,
      total: discounted.total + ins + g + c,
    };
  }, [vehicle.pricePerDay, days, insurance, gps, childSeat]);

  const canContinue = !!(dateRange[0] && dateRange[1] && days >= 1);

  const handleConfirm = () => {
    const ref = `AZR-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    setBookingRef(ref);

    const addons: string[] = [];
    if (insurance) addons.push('insurance');
    if (gps) addons.push('gps');
    if (childSeat) addons.push('childSeat');

    addBooking({
      id: `b-${Date.now()}`,
      ref,
      userId: user?.id || 'guest',
      vehicleId: vehicle.carId, //TODO fix later
      vehicleName: vehicle.title,
      paymentMethod: paymentMethod as 'cash' | 'card',
      startDate: dateRange[0]!,
      endDate: dateRange[1]!,
      total,
      status: 'accepted',
      addons,
    });

    setSuccess(true);
  };

  const handleClose = () => {
    setSuccess(false);
    setStep(0);
    setStepDirection('forward');
    setDateRange([null, null]);
    setInsurance(false);
    setGps(false);
    setChildSeat(false);
    setPaymentMethod('cash');
    onClose();
  };

  const goForward = () => {
    setStepDirection('forward');
    setStep(1);
  };

  const goBack = () => {
    setStepDirection('back');
    setStep(0);
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('sq-AL') : '';

  const stepAnimClass = stepDirection === 'forward' ? 'animate-step-slide-in' : 'animate-step-slide-back';

  const addonDayLabel = `€15/${t('vehicle.perDay')}`;
  const addonGpsLabel = `€10/${t('vehicle.perDay')}`;
  const addonChildLabel = `€5/${t('vehicle.perDay')}`;
  const discountText = discountPct > 0 ? `-${discountPct}%` : '';

  const primaryImage = vehicle.carImages?.[0]?.data ?? '';

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        success ? undefined : (
          <Group gap="sm">
            <Text fw={700} size="lg">{t('rental.title')}</Text>
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
            <Text size="xl" fw={700}>{t('rental.successTitle')}</Text>
            <Text c="dimmed" ta="center">{t('rental.successMsg')}</Text>
            <Paper className="glass-card" p="md" radius="md">
              <Text size="sm" c="dimmed">{t('rental.bookingRef')}</Text>
              <Text size="lg" fw={700} c="teal">{bookingRef}</Text>
            </Paper>
            <Group>
              <Button variant="outline" onClick={handleClose}>
                {t('rental.backHome')}
              </Button>
            </Group>
          </Stack>
        </Box>
      ) : (
        <Stepper active={step} color="teal">
          <Stepper.Step label={t('rental.step1')} icon={<IconCalendar size={18} />}>
            <Box key={`step-0-${stepDirection}`} className={stepAnimClass}>
              <Stack gap="md" mt="md">
                <DatePickerInput
                  type="range"
                  label={t('rental.dateRange')}
                  value={dateRange}
                  onChange={setDateRange}
                  minDate={new Date().toISOString().split('T')[0]}
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

          <Stepper.Step label={t('rental.step2')} icon={<IconSettings size={18} />}>
            <Box key={`step-1-${stepDirection}`} className={stepAnimClass}>
              <Stack gap="md" mt="md">
                <Text fw={600}>{t('rental.addons')}</Text>

                <Paper
                  className={`glass-card ${insurance ? 'animate-card-glow' : ''}`}
                  p="md"
                  radius="md"
                  style={{
                    borderColor: insurance ? 'var(--mantine-color-teal-6)' : undefined,
                    borderWidth: insurance ? 2 : 1,
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setInsurance(!insurance)}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon variant="light" color="teal" size="lg" radius="md">
                        <IconShieldCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={600}>{t('rental.fullInsurance')}</Text>
                        <Text size="xs" c="dimmed">{addonDayLabel}</Text>
                      </div>
                    </Group>
                    <Switch checked={insurance} onChange={() => { }} color="teal" />
                  </Group>
                </Paper>

                <Paper
                  className={`glass-card ${gps ? 'animate-card-glow' : ''}`}
                  p="md"
                  radius="md"
                  style={{
                    borderColor: gps ? 'var(--mantine-color-teal-6)' : undefined,
                    borderWidth: gps ? 2 : 1,
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setGps(!gps)}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon variant="light" color="blue" size="lg" radius="md">
                        <IconShieldCheck size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={600}>{t('rental.gps')}</Text>
                        <Text size="xs" c="dimmed">{addonGpsLabel}</Text>
                      </div>
                    </Group>
                    <Switch checked={gps} onChange={() => { }} color="teal" />
                  </Group>
                </Paper>

                <Paper
                  className={`glass-card ${childSeat ? 'animate-card-glow' : ''}`}
                  p="md"
                  radius="md"
                  style={{
                    borderColor: childSeat ? 'var(--mantine-color-teal-6)' : undefined,
                    borderWidth: childSeat ? 2 : 1,
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onClick={() => setChildSeat(!childSeat)}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <ThemeIcon variant="light" color="orange" size="lg" radius="md">
                        <IconBabyCarriage size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="sm" fw={600}>{t('rental.childSeat')}</Text>
                        <Text size="xs" c="dimmed">{addonChildLabel}</Text>
                      </div>
                    </Group>
                    <Switch checked={childSeat} onChange={() => { }} color="teal" />
                  </Group>
                </Paper>

                <Divider />

                <Radio.Group
                  label={t('rental.paymentMethod')}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                >
                  <Stack gap="xs" mt="xs">
                    <Paper
                      className="glass-card"
                      p="sm"
                      radius="md"
                      style={{
                        cursor: 'pointer',
                        borderColor: paymentMethod === 'cash' ? 'var(--mantine-color-teal-6)' : undefined,
                        borderWidth: paymentMethod === 'cash' ? 2 : 1,
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Group gap="sm">
                        <IconCash size={18} color="var(--mantine-color-teal-6)" />
                        <Radio value="cash" label={t('rental.cashPickup')} />
                      </Group>
                    </Paper>
                    <Paper
                      className="glass-card"
                      p="sm"
                      radius="md"
                      style={{
                        cursor: 'pointer',
                        borderColor: paymentMethod === 'card' ? 'var(--mantine-color-teal-6)' : undefined,
                        borderWidth: paymentMethod === 'card' ? 2 : 1,
                        transition: 'all 0.2s',
                      }}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <Group gap="sm">
                        <IconCreditCard size={18} color="var(--mantine-color-teal-6)" />
                        <Radio value="card" label={t('rental.cardPickup')} />
                      </Group>
                    </Paper>
                  </Stack>
                </Radio.Group>

                <Divider />

                <Paper className="glass-card" p="md" radius="md">
                  <Text fw={600} mb="sm">{t('rental.summary')}</Text>
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
                      <Text size="sm">{`${formatDate(dateRange[0])} — ${formatDate(dateRange[1])}`}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">{t('rental.duration')}</Text>
                      <Text size="sm">{`${days} ${t('rental.days')}`}</Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">{t('rental.basePrice')}</Text>
                      <Text size="sm">{`€${vehicle.pricePerDay}/${t('vehicle.perDay')} × ${days} = €${baseBeforeDiscount}`}</Text>
                    </Group>
                    {discountPct > 0 && (
                      <Group justify="space-between" className="animate-scale-in">
                        <Text size="sm" c="dimmed">{t('rental.discount')}</Text>
                        <Text size="sm" c="teal" fw={700}>{`${discountText} (-€${discountAmount})`}</Text>
                      </Group>
                    )}
                    {discountPct > 0 && (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">{t('rental.discountedBase')}</Text>
                        <Text size="sm">{`€${baseAfterDiscount}`}</Text>
                      </Group>
                    )}
                    {insurance && (
                      <Group justify="space-between" className="animate-scale-in">
                        <Text size="sm" c="dimmed">{t('rental.fullInsurance')}</Text>
                        <Text size="sm">{`€15 × ${days} = €${insuranceCost}`}</Text>
                      </Group>
                    )}
                    {gps && (
                      <Group justify="space-between" className="animate-scale-in">
                        <Text size="sm" c="dimmed">{t('rental.gps')}</Text>
                        <Text size="sm">{`€10 × ${days} = €${gpsCost}`}</Text>
                      </Group>
                    )}
                    {childSeat && (
                      <Group justify="space-between" className="animate-scale-in">
                        <Text size="sm" c="dimmed">{t('rental.childSeat')}</Text>
                        <Text size="sm">{`€5 × ${days} = €${childSeatCost}`}</Text>
                      </Group>
                    )}
                    <Divider />
                    <Group justify="space-between">
                      <Text size="lg" fw={700}>{t('rental.total')}</Text>
                      <Text size="lg" fw={700} c="teal">
                        €<AnimatedTotal value={total} />
                      </Text>
                    </Group>
                  </Stack>
                </Paper>

                <Group grow>
                  <Button variant="outline" onClick={goBack} radius="md">
                    {t('rental.back')}
                  </Button>
                  <Button
                    variant="filled"
                    color="teal"
                    onClick={handleConfirm}
                    radius="md"
                  >
                    {t('rental.confirm')}
                  </Button>
                </Group>
              </Stack>
            </Box>
          </Stepper.Step>
        </Stepper>
      )}
    </Modal>
  );
}