import Store from '.';

export const setAccount = (account) => {
  Store.update((s) => {
    s.account = account;
  });
};

export const setIsDarkTheme = (isDark) => {
  Store.update((s) => {
    s.settings = {
      ...s.settings,
      darkTheme: isDark,
    };
  });
};

export const setSettings = (settings) => {
  Store.update((s) => {
    s.settings = settings;
  });
};

export const setCurrentCache = ({path, payload}) => {
  Store.update((s) => {
    s.cache.path = path;
    s.cache.payload = payload;
  });
};

export const setLanguage = (lang) => {
  Store.update((s) => {
    s.settings.language = lang;
  });
};
