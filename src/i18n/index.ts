import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sq from './locales/sq.json';
import en from './locales/en.json';
import it from './locales/it.json';
import { STORAGE_KEYS, DEFAULT_LANGUAGE } from '../data/storageKeys';

const savedLang =
  localStorage.getItem(STORAGE_KEYS.LANGUAGE) ||
  localStorage.getItem('az-language') ||
  DEFAULT_LANGUAGE;

i18n.use(initReactI18next).init({
  resources: {
    sq: { translation: sq },
    en: { translation: en },
    it: { translation: it },
  },
  lng: savedLang,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lng);
  localStorage.setItem('az-language', lng);
});

export default i18n;
