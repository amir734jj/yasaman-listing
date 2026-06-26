import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { fa } from './fa';

export const defaultNS = 'translation';

export const resources = {
  en: { translation: en },
  fa: { translation: fa },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'fa',
  fallbackLng: 'en',
  defaultNS,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  returnNull: false,
  react: {
    useSuspense: false,
  },
});

export default i18n;
