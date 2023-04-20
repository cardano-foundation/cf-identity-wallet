import { useTranslation, I18nextProvider } from "react-i18next";
import { i18n } from "../../../i18n/i18n";

const lngs: { [key: string]: any } = {
  en: { nativeName: "English" },
  de: { nativeName: "Deutsch" },
};

const SwitcherCore = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng: string | undefined) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      {Object.keys(lngs).map((lng) => (
        <button
          type="submit"
          key={lng}
          onClick={() => changeLanguage(lng)}
          disabled={i18n.resolvedLanguage === lng}
        >
          {lngs[lng].nativeName}
        </button>
      ))}
      <p>{t("test")}</p>
    </div>
  );
};

export function LanguageSwitcher() {
  return (
    <I18nextProvider i18n={i18n}>
      <SwitcherCore />
    </I18nextProvider>
  );
}
