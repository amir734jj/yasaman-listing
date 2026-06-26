import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

export type Language = 'en' | 'fa';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggle: () => void;
}

const applyLanguage = (language: Language) => {
  document.documentElement.setAttribute('lang', language);
  document.documentElement.setAttribute('dir', language === 'fa' ? 'rtl' : 'ltr');
  if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'fa',
      setLanguage: (language) => {
        applyLanguage(language);
        set({ language });
      },
      toggle: () => {
        const next: Language = get().language === 'en' ? 'fa' : 'en';
        applyLanguage(next);
        set({ language: next });
      },
    }),
    {
      name: 'yasaman-language',
      onRehydrateStorage: () => (state) => {
        if (state) applyLanguage(state.language);
      },
    },
  ),
);
