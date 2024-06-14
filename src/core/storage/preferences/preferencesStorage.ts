import { Preferences } from "@capacitor/preferences";
import {
  RemoveOptions,
  SetOptions,
} from "@capacitor/preferences/dist/esm/definitions";
import { PreferencesStorageItem } from "./preferencesStorage.types";

enum PreferencesKeys {
  APP_ALREADY_INIT = "app-already-init",
}

class PreferencesStorage {
  static readonly KEY_NOT_FOUND =
    "Preferences Storage does not contain an item with specified key";
  static readonly INVALID_OBJECT = "Object format cannot be parsed";

  static async get(key: string): Promise<PreferencesStorageItem> {
    const item = await Preferences.get({ key });
    if (!item || !item?.value) {
      throw new Error(`${PreferencesStorage.KEY_NOT_FOUND} ${key}`);
    }
    return JSON.parse(item.value);
  }

  static async set(key: string, obj: PreferencesStorageItem): Promise<void> {
    const objStr: string = JSON.stringify(obj);
    await Preferences.set({
      key,
      value: objStr,
    } as SetOptions);
  }

  static async remove(key: string): Promise<void> {
    await Preferences.remove({ key } as RemoveOptions);
  }
}

export { PreferencesStorage, PreferencesKeys };
