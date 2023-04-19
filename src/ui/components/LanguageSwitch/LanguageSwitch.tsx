import { useTranslation } from "react-i18next";

const lngs: { [key: string]: any } = {
  en: { nativeName: "English" },
  de: { nativeName: "Deutsch" },
};

const LanguageSwitch = () => {
  const { t, i18n } = useTranslation();
  return (
    <div>
      {Object.keys(lngs).map((lng) => (
        <button
          type="submit"
          key={lng}
          onClick={() => i18n.changeLanguage(lng)}
          disabled={i18n.resolvedLanguage === lng}
        >
          {lngs[lng].nativeName}
        </button>
      ))}
      <p>{t("test")}</p>
    </div>
  );
};

export { LanguageSwitch };
