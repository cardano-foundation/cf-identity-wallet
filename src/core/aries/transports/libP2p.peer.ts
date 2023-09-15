import { PeerIdJSON } from "./libp2p/libP2p.types";
import { KeyStoreKeys, SecureStorage, SecureStorageItem } from "../../storage";

export async function getPeerFromStorage(): Promise<SecureStorageItem | null> {
  try {
    return await SecureStorage.get(KeyStoreKeys.LIBP2P_PEER);
  } catch (e) {
    return null;
  }
}
export async function savePeer(value: PeerIdJSON) {
  return await SecureStorage.set(
    KeyStoreKeys.LIBP2P_PEER,
    JSON.stringify(value)
  );
}
