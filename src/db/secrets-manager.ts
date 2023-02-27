import { Agent, SecretsManager as SDKSecretsManager, CreateKeyOptions, Key, StorageManager, BaseRecord } from '@cf-identity-tools/sdk';
import { Account } from '../models/Account/Account';
import { CardanoAPI } from '../lib/CardanoAPI';
import { getKeystore, setKeystore } from './keystore';
import { agentStorageManager } from './agent-storage-manager';
import { Mutex } from 'async-mutex';

class SecretsManagerImpl<T extends BaseRecord> implements SDKSecretsManager {
  private static readonly keyIndexLocks: Map<string, Mutex> = new Map();  // Mutex in case await is forgotten when initialising agents.
  private storageManager: StorageManager<T>;

  constructor(storageManager: StorageManager<T>) {
    this.storageManager = storageManager;
  }

  async setupAgent(agent: Agent): Promise<void> {
    SecretsManagerImpl.keyIndexLocks.set(agent.getId(), new Mutex());
  }

  async createKey(agent: Agent, _options: CreateKeyOptions): Promise<Key> {
    let lock = SecretsManagerImpl.keyIndexLocks.get(agent.getId());
    if (lock === undefined) {
      throw new Error("Agent is missing key index lock.");
    }

    return lock.runExclusive(async () => {
      // @TODO - foconnor: This needs to come from the UI in the current design.
      // The spending password makes sense in browser extensions but not sure about mobile if using keychain (e.g. on iOS it's encrypted using a key from secure enclave).
      const pass = "SpendMe1";

      const keyContext = agent.getDerivationKeyContext();
      if (!keyContext) {
        throw new Error(`Missing key context for agent ${agent.getId()}`);
      }

      const account = await Account.getAccount(keyContext.rootKeyId);
      if (!account) {
        throw new Error(`Missing account ID ${keyContext.rootKeyId}`);
      }

      const encryptedRootKeyHex = await account.getEncryptedRootKey();
      if (!encryptedRootKeyHex) {
        throw new Error(`Missing encrypted root key for account ID ${keyContext.rootKeyId}`);
      }
      
      // @TODO - foconnor: init/._lib hopefully to be removed once tested on mobile
      await CardanoAPI.init();

      const decrypted = CardanoAPI.decrypt(pass, encryptedRootKeyHex);
      if (!decrypted.result) {
        throw new Error(`Could not decrypt seed phrase [account ${keyContext.rootKeyId}] with given passphrase: ${decrypted.error}`);
      }

      const rootKey = CardanoAPI.hexToBip32PrivateKey(decrypted.result);
      const keyPairHex = CardanoAPI.deriveIdentityKeyPairHex(rootKey, keyContext.accountIndex, keyContext.nextKeyIndex);

      const privateKeyBase64 = Buffer.from(keyPairHex.privateKey, "hex").toString("base64");
      const publicKeyBase64 = Buffer.from(keyPairHex.publicKey, "hex").toString("base64");

      const id = `${keyContext.accountIndex}/0/${keyContext.nextKeyIndex}`;

      keyContext.nextKeyIndex++;
      await this.storageManager.setAgentContext(agent.getId(), agent.context());

      // For testing in browser or in extension this goes in IndexedDB which can be wiped but right now that isn't a target release platform.
      await setKeystore(id, privateKeyBase64);

      return { id, publicKeyBase64, privateKeyBase64 };
    });
  }

  async getBase64SecretById(_agent: Agent, id: string): Promise<Key> {
    const privateKeyBase64 = (await getKeystore(id)).value;
    const publicKeyBase64 = CardanoAPI.hexPrivateToHexPublic(Buffer.from(privateKeyBase64, "base64").toString("hex"));
    return { id, publicKeyBase64, privateKeyBase64 };
  }
}

const secretsManager = new SecretsManagerImpl(agentStorageManager);

export {
  secretsManager
}
