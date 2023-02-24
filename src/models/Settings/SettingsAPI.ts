import {PreferencesAPI} from '../../db/preferences';

export const SettingsAPI = {
  table: 'settings',
  theme: 'ocean',
  isDarkMode: false,
  language: 'en',
  network: 'preprod',
  isExtension: false,
  async init() {
    const settings = await PreferencesAPI.get(this.table);
    if (!settings) return;
    this.theme = settings.theme;
    this.isDarkMode = settings.isDarkMode;
    this.language = settings.language;
    this.network = settings.network;
    this.isExtension = settings.isExtension;
  },
  setTheme(theme: string) {
    this.theme = theme;
  },
  setIsDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
  },
  setLanguage(language: string) {
    this.language = language;
  },
  setNetwork(network: string) {
    this.network = network;
  },
  setIsExtension(isExtension: boolean) {
    this.isExtension = isExtension;
  },
  async getLanguage() {
    return this.language;
  },
  getTheme() {
    return this.theme;
  },
  getIsDarkMode() {
    return this.isDarkMode;
  },
  get() {
    return {
      language: this.language,
      theme: this.theme,
      isDarkMode: this.isDarkMode,
      network: this.network,
      isExtension: this.isExtension,
    };
  },
  async commit() {
    await PreferencesAPI.set(this.table, {
      theme: this.theme,
      isDarkMode: this.isDarkMode,
      language: this.language,
      network: this.network,
      isExtension: this.isExtension,
    });
  },
};
