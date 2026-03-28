import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const handleToggle = () => {
    toggleColorScheme();
    localStorage.setItem('az-color-scheme', colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      onClick={handleToggle}
      aria-label={t('nav.toggleTheme')}
    >
      {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
    </ActionIcon>
  );
}
