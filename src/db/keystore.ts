import {SecureStoragePlugin} from 'capacitor-secure-storage-plugin';

export const getKeystore = async (key: string) => {
  return SecureStoragePlugin.get({key});
};

export const setKeystore = async (key: string, encryptedKey: string) => {
  await SecureStoragePlugin.set({key: key, value: encryptedKey});
};

export const removeKeystore = async (key: string) => {
  await SecureStoragePlugin.remove({key});
};
