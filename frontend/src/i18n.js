// i18n configuration for React app
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en.json';
import translationRU from './locales/ru.json';
import translationKK from './locales/kk.json';

const resources = {
    en: { translation: translationEN },
    ru: { translation: translationRU },
    kk: { translation: translationKK },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        detection: { order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'], caches: ['cookie'] },
    });

export default i18n;
