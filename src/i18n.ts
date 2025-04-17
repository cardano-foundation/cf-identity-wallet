import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Languagedetector from "i18next-browser-languagedetector";
import en from "./locales/en/en.json";
import common from "./locales/en/custom.json";

i18n
  .use(initReactI18next)
  .use(Languagedetector)
  .init({
    resources: {
      en: {
        translation: en,
        common: common,
      },
    },
    lng: "en",
    fallbackLng: "en",
    ns: ["translation, common"],
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
  });

export { i18n };
