import { SecureStoragePlugin } from "@jimcase/capacitor-secure-storage-plugin";

export type DataType = string | number | boolean | Record<string, unknown> | unknown[] | Date;

enum KeyStoreKeys {
  APP_PASSCODE = "app-login-passcode",
  APP_OP_PASSWORD = "app-operations-password",
  SIGNIFY_BRAN = "signify-bran",
  MEERKAT_SEED = "app-meerkat-seed",
  DB_ENCRYPTION_BRAN = "db-encryption-bran",
}

class SecureStorage {
  static readonly KEY_NOT_FOUND =
    "Secure Storage does not contain an item with specified key";

  static async get(key: string): Promise<string> {
    const result = await SecureStoragePlugin.get({ key });
    if (!result || result.value === null) {
      throw new Error(`${SecureStorage.KEY_NOT_FOUND} ${key}`);
    }
    return result.value;
  }

  static async set(key: string, value: string): Promise<void> {
    await SecureStoragePlugin.set({key, value});
  }

  static async delete(key: string) {
    try {
      await SecureStoragePlugin.remove({ key });
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("Item with given key does not exist")) {
        throw error;
      }
    }
  }

  static async isKeyStoreSupported() {
    try {
      await this.set("testKey", "testValue");
      await this.delete("testKey");
      return true;
    } catch (e) {
      return false;
    }
  }
}

// This is just to allow us to make change libs if needed without refactoring other code.
export type { DataType as SecureStorageItem };
export { SecureStorage, KeyStoreKeys };
