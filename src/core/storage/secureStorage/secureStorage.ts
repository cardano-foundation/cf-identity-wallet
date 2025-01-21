import { SecureStoragePlugin } from "@jimcase/capacitor-secure-storage-plugin";

enum KeyStoreKeys {
  APP_PASSCODE = "app-login-passcode",
  APP_OP_PASSWORD = "app-operations-password",
  SIGNIFY_BRAN = "signify-bran",
  MEERKAT_SEED = "app-meerkat-seed",
  DB_ENCRYPTION_BRAN = "db-encryption-bran",
}

class SecureStorage {
  static readonly KEY_NOT_FOUND =
    "Item with given key does not exist";

  static async get(key: string): Promise<string | null> {
    try {
      const result = await SecureStoragePlugin.get({ key });
      return result.value;
    } catch (e) {
      const error = e as { message?: string };
      if (!error.message?.includes(SecureStorage.KEY_NOT_FOUND)) {
        throw e;
      }
      return null;
    }
  }

  static async set(key: string, value: string): Promise<void> {
    await SecureStoragePlugin.set({key, value});
  }

  static async delete(key: string) {
    const result = await this.get(key);
    if (result) {
      await SecureStoragePlugin.remove({ key });
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

export { SecureStorage, KeyStoreKeys };
