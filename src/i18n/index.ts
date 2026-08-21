import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enAuth from '@/locales/en/auth.json';
import enCommon from '@/locales/en/common.json';
import enNav from '@/locales/en/nav.json';
import koAuth from '@/locales/ko/auth.json';
import koCommon from '@/locales/ko/common.json';
import koNav from '@/locales/ko/nav.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { common: koCommon, nav: koNav, auth: koAuth },
      en: { common: enCommon, nav: enNav, auth: enAuth },
    },
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'en'],
    defaultNS: 'common',
    ns: ['common', 'nav', 'auth'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
