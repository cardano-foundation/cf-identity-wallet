import { PreferencesAPI } from '../../db/preferences';

export const SettingsAPI = {
  table: 'settings',
  theme: '',
  language: '',
  network: 'preprod',
  isExtension: false,
  async init() {
    const settings = await PreferencesAPI.get(this.table);
    if (!settings) return;
    this.theme = settings.theme;
    this.language = settings.language;
    this.network = settings.network;
    this.isExtension = settings.isExtension;
  },
  set setTheme(theme: string) {
    this.theme = theme;
  },
  set setLanguage(language: string) {
    this.language = language;
  },
  set setNetwork(network: string) {
    this.network = network;
  },
  set setIsExtension(isExtension: boolean) {
    this.isExtension = isExtension;
  },
  get() {
    return {
      theme: this.theme,
      language: this.language,
      network: this.network,
      isExtension: this.isExtension,
    };
  },
  async getLanguage() {
    return this.language
  },
  async commit() {
    await PreferencesAPI.set(this.table, {
      theme: this.theme,
      language: this.language,
      network: this.network,
      isExtension: this.isExtension,
    });
  },
};
