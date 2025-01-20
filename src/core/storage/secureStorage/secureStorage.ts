import {
  SecureStoragePlugin as CapacitorSecureStorage,
} from "@jimcase/capacitor-secure-storage-plugin";

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
    const item = await CapacitorSecureStorage.get({ key });
    if (item === null) {
      throw new Error(`${SecureStorage.KEY_NOT_FOUND} ${key}`);
    }
    return item.value;
  }

  static async set(key: string, value: string): Promise<{ value: boolean }> {
    return await CapacitorSecureStorage.set({ key, value });
  }

  static async delete(key: string): Promise<{ value: boolean }> {
    return await CapacitorSecureStorage.remove({ key });
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
