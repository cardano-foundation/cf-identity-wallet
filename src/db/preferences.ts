import {Preferences} from '@capacitor/preferences';

export const PreferencesAPI = {
  async set(table: string, obj: any) {
    if (obj && Object.keys(obj)?.length) {
      await Preferences.set({
        key: table,
        value: JSON.stringify(obj),
      });
    }
  },
  async get(table: string) {
    const {value} = await Preferences.get({key: table});
    if (!value) return;
    return JSON.parse(value);
  },
  async remove(table: string) {
    await Preferences.remove({key: table});
  },
};
