import { PreferencesAPI } from '../../db/preferences';

export const SettingsAPI = {
  table: 'settings',
  theme: '',
  language: '',
  network: 'preprod',

  async init() {
    const settings = await PreferencesAPI.get(this.table);
    if (!settings) return;
    this.theme = settings.theme;
    this.language = settings.language;
    this.network = settings.network;
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
  get() {
    return {
      theme: this.theme,
      language: this.language,
      network: this.network,
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
    });
  },
};
