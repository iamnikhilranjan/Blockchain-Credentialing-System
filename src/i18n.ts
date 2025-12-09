import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import pa from './locales/pa.json';
import mr from './locales/mr.json';
import bn from './locales/bn.json';
import kn from './locales/kn.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { ...en },
            hi: { ...hi },
            pa: { ...pa },
            mr: { ...mr },
            bn: { ...bn },
            kn: { ...kn }
        },
        lng: 'en', // Default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already safes from xss
        }
    });

export default i18n;
