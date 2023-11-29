import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Languagedetector from "i18next-browser-languagedetector";
import en from "./locales/en/en.json";

i18n
  .use(initReactI18next)
  .use(Languagedetector)
  .init({
    resources: {
      en: {
        translation: en,
      },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export { i18n };
