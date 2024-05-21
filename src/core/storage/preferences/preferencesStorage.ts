import { Preferences } from "@capacitor/preferences";
import {
  RemoveOptions,
  SetOptions,
} from "@capacitor/preferences/dist/esm/definitions";
import { PreferencesStorageItem } from "./preferencesStorage.type";

enum PreferencesKeys {
  APP_ALREADY_INIT = "app-already-init",
  APP_STATE_FLAGS = "app-state-flags",
  APP_LANGUAGE = "app-language",
  APP_IDENTIFIERS_FAVOURITES = "app-identifiers-favourites",
  APP_CREDS_FAVOURITES = "app-creds-favourites",
  APP_USER_NAME = "app-user-name",
  APP_BIOMETRY = "app-biometry",
  APP_KERIA_NOTIFICATION_MARKER = "app-keria-notification-marker",
  APP_IDENTIFIER_VIEW_TYPE = "app-identifier-view-type",
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
