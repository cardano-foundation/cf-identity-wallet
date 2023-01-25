import {SecureStoragePlugin} from "capacitor-secure-storage-plugin";

export const getKeystore = async (key:string) => {
    return await SecureStoragePlugin.get({ key});
}

export const setKeystore = (key:string, encryptedKey: string) => {
    SecureStoragePlugin.set({ key: key, value: encryptedKey});
}

export const removeKeystore = (key:string) => {
    SecureStoragePlugin.remove({ key});
}
