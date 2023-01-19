import { initReactI18next } from "react-i18next/*";
import i18n from "src/i18n";

export const defaultNS = "ns1";
export const resources = {
  en: {
    ns1,
    ns2,
  },
} as const;

i18n.use(initReactI18next).init({
  lng: "en",
  ns: ["ns1", "ns2"],
  defaultNS,
  resources,
});
