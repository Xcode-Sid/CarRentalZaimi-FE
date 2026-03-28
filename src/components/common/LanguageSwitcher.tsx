import { Menu, ActionIcon, Text } from '@mantine/core';
import { IconLanguage } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <Menu shadow="md" width={160} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" size="lg" aria-label={t('nav.changeLanguage')}>
          <Text size="lg">{current.flag}</Text>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {languages.map((lang) => (
          <Menu.Item
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            leftSection={<Text size="md">{lang.flag}</Text>}
            style={{
              fontWeight: i18n.language === lang.code ? 700 : 400,
            }}
          >
            {lang.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
