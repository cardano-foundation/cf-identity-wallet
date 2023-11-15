import {
  SecureStorage as CapacitorSecureStorage,
  DataType,
} from "@aparajita/capacitor-secure-storage";

enum KeyStoreKeys {
  APP_PASSCODE = "app-login-passcode",
  IDENTITY_ENTROPY = "identity-entropy",
  IDENTITY_ROOT_XPRV_KEY = "identity-root-xprv-key",
  APP_OP_PASSWORD = "app-operations-password",
  CRYPTO_ENTROPY_PREFIX = "crypto-entropy-",
  CRYPTO_ROOT_XPRV_KEY_PREFIX = "crypto-root-xprv-key-",
  LIBP2P_PEER = "libp2p-peer",
  SIGNIFY_BRAN = "signify-bran",
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
