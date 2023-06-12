import { Preferences, GetResult } from "@capacitor/preferences";
import { PreferencesStorageType } from "./preferencesStorage.type";

enum PreferencesKeys {
  APP_STATE_FLAGS = "app-state-flags",
}

class PreferencesStorage {
  static readonly KEY_NOT_FOUND =
    "Preferences Storage does not contain an item with specified key";
  static readonly INVALID_OBJECT = "Object format cannot be parsed";

  static async get(key: string): Promise<GetResult | null> {
    const item = await Preferences.get({ key });
    if (!item || !item?.value) {
      throw new Error(`${PreferencesStorage.KEY_NOT_FOUND} ${key}`);
    }
    return JSON.parse(item.value);
  }

  static async set(key: string, obj: PreferencesStorageType): Promise<void> {
    try {
      const value = JSON.stringify(obj);
      await Preferences.set({
        key,
        value,
      });
    } catch (e) {
      throw new Error(`${PreferencesStorage.INVALID_OBJECT} ${obj}`);
    }
  }

  static async delete(key: string) {
    await Preferences.remove({ key });
  }
}

export { PreferencesStorage, PreferencesKeys };
