import { Stack, Text, Button, ThemeIcon } from '@mantine/core';
import { IconMoodEmpty } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
}

export function EmptyState({ icon, title, description, actionLabel, actionPath }: Props) {
  const navigate = useNavigate();

  return (
    <Stack align="center" gap="md" py={60}>
      <ThemeIcon size={80} radius="xl" variant="light" color="teal">
        {icon || <IconMoodEmpty size={40} />}
      </ThemeIcon>
      <Text size="xl" fw={600}>
        {title}
      </Text>
      {description && (
        <Text c="dimmed" ta="center" maw={400}>
          {description}
        </Text>
      )}
      {actionLabel && actionPath && (
        <Button
          variant="filled"
          color="teal"
          size="md"
          onClick={() => navigate(actionPath)}
          mt="sm"
        >
          {actionLabel}
        </Button>
      )}
    </Stack>
  );
}
