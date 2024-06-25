import {
  SecureStorage as CapacitorSecureStorage,
  DataType,
} from "@aparajita/capacitor-secure-storage";

enum KeyStoreKeys {
  APP_PASSCODE = "app-login-passcode",
  APP_OP_PASSWORD = "app-operations-password",
  SIGNIFY_BRAN = "signify-bran",
  MEERKAT_SEED = "app-meerkat-seed",
  RECOVERY_WALLET = "recovery-wallet",
  RECOVERY_WALLET_LAST_FAIL_ATTEMPT_TIME = "recovery-wallet-last-fail-attempt-time",
}

class SecureStorage {
  static readonly KEY_NOT_FOUND =
    "Secure Storage does not contain an item with specified key";

  static async get(key: string): Promise<DataType | null> {
    const item = await CapacitorSecureStorage.get(key);
    if (item === null) {
      throw new Error(`${SecureStorage.KEY_NOT_FOUND} ${key}`);
    }
    return item;
  }

  static async set(key: string, value: string): Promise<void> {
    await CapacitorSecureStorage.set(key, value, true, false);
  }

  static async delete(key: string) {
    await CapacitorSecureStorage.remove(key);
  }
}

// This is just to allow us to make change libs if needed without refactoring other code.
export type { DataType as SecureStorageItem };
export { SecureStorage, KeyStoreKeys };
