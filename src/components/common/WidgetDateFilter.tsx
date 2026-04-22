import { useState, useCallback } from 'react';
import { Group, ActionIcon, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export interface WidgetDateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface WidgetDateFilterProps {
  value: WidgetDateRange;
  onChange: (range: WidgetDateRange) => void;
}

export function WidgetDateFilter({ value, onChange }: WidgetDateFilterProps) {
  const { t } = useTranslation();
  const hasFilter = value.startDate || value.endDate;

  return (
    <Group gap={6} wrap="nowrap">
      <DatePickerInput
        value={value.startDate}
        onChange={(val) => onChange({ ...value, startDate: val ? new Date(val) : null })}
        placeholder={t('admin.startDate')}
        clearable
        size="xs"
        w={130}
        styles={{ input: { fontSize: 11, minHeight: 28, height: 28 } }}
      />
      <DatePickerInput
        value={value.endDate}
        onChange={(val) => onChange({ ...value, endDate: val ? new Date(val) : null })}
        placeholder={t('admin.endDate')}
        clearable
        size="xs"
        w={130}
        styles={{ input: { fontSize: 11, minHeight: 28, height: 28 } }}
      />
      {hasFilter && (
        <Tooltip label={t('admin.resetFilter')} withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="xs"
            onClick={() => onChange({ startDate: null, endDate: null })}
          >
            <IconX size={12} />
          </ActionIcon>
        </Tooltip>
      )}
    </Group>
  );
}

export function useWidgetDates() {
  const [range, setRange] = useState<WidgetDateRange>({ startDate: null, endDate: null });

  const params = useCallback(() => ({
    startDate: range.startDate?.toISOString(),
    endDate: range.endDate?.toISOString(),
  }), [range]);

  return { range, setRange, params } as const;
}
