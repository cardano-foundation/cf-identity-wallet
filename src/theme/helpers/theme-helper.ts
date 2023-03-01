import {SettingsAPI} from '../../models/Settings/SettingsAPI';

export const isDarkMode = () => {
  return document.body.classList.contains('dark');
};

export const setDarkMode = (isDarkMode: boolean) => {
  if (isDarkMode) {
    SettingsAPI.setIsDarkMode(true);
    SettingsAPI.commit().then(() => {
      document.body.classList.remove('light');
      document.body.classList.toggle('dark', true);
    });
  } else {
    SettingsAPI.setIsDarkMode(false);
    SettingsAPI.commit().then(() => {
      document.body.classList.remove('dark');
      document.body.classList.toggle('light', true);
    });
  }
};
export const toggleDarkMode = () => {
  if (document.body.classList.contains('dark')) {
    setDarkMode(false);
  } else {
    setDarkMode(true);
  }
};

export const currentTheme = () => {
  return SettingsAPI.getTheme();
};

export const changeTheme = (theme: string) => {
  SettingsAPI.setTheme(theme);
  SettingsAPI.commit().then(() => {
    const body = document.querySelector('body');
    if (!body) return;
    body.setAttribute('theme-color', theme);
  });
};
