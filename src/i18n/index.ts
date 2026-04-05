import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from "./locales/en.json";
import th from "./locales/th.json";
import enPages from "./locales/en.pages.json";
import thPages from "./locales/th.pages.json";

const resources = {
  en: { translation: { ...en, ...enPages } },
  th: { translation: { ...th, ...thPages } },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "th",
    fallbackLng: "en",
    supportedLngs: ["th", "en"],
    interpolation: {
      escapeValue: false,
    },
    returnObjects: true,
    detection: {
      // Prefer saved choice; new visitors default to Thai (lng above), not browser language
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
