import i18n from 'i18next';
import en from './en.json';
import es from './es.json';
import {SettingsAPI} from '../models/Settings/SettingsAPI';
import {initReactI18next} from 'react-i18next';

SettingsAPI.getLanguage().then((language) => {
  i18n
    .use(initReactI18next)

    .init({
      // we init with resources

      resources: {
        en: {
          translations: {
            ...en,
          },
        },

        es: {
          translations: {
            ...es,
          },
        },
      },

      fallbackLng: 'en',

      debug: false,

      // have a common namespace used around the full app

      ns: ['translations'],

      defaultNS: 'translations',

      interpolation: {
        escapeValue: false,
      },

      react: {
        wait: true,
      },
    });
});

export default i18n;
