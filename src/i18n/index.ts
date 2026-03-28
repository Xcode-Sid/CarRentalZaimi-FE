import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import sq from './locales/sq.json';
import en from './locales/en.json';
import it from './locales/it.json';

const savedLang = localStorage.getItem('az-language') || 'sq';

i18n.use(initReactI18next).init({
  resources: {
    sq: { translation: sq },
    en: { translation: en },
    it: { translation: it },
  },
  lng: savedLang,
  fallbackLng: 'sq',
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('az-language', lng);
});

export default i18n;
