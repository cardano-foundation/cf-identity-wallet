import {
  Wallet,
  WalletConfig,
  WalletConfigRekey,
  WalletExportImportConfig,
  WalletCreateKeyOptions,
  EncryptedMessage,
  UnpackedMessageContext,
  WalletSignOptions,
  Key,
  WalletVerifyOptions,
  Buffer,
  WalletError,
  AriesFrameworkError,
  KeyType,
  WalletKeyExistsError,
  TypedArrayEncoder,
} from "@aries-framework/core";
import { Storage, Drivers } from "@ionic/storage";
import { randomBytes } from "crypto";
import { Ed25519KeyPair } from "@transmute/ed25519-key-pair";
import { StorageObject } from "../storage/ionicStorageService.types";

class IonicStorageWallet implements Wallet {
  private walletConfig?: WalletConfig;
  private session?: Storage;

  static readonly SEED_OR_PRIVATE_KEY_ERROR_MSG =
    "Usage of seed or private key not implemented";
  static readonly UNSUPPORTED_KEY_TYPE_ERROR_MSG = "Unsupported key type: ";
  static readonly KEY_EXISTS_ERROR_MSG =
    "Generated key already exists in the wallet";
  static readonly MISSING_PRIVATE_PART_ERROR_MSG =
    "Generated key pair unexpectedly missing a private key";
  static readonly NOT_IMPLEMENTED_YET_ERROR_MSG =
    "Wallet method not implemented yet";
  static readonly STORAGE_KEY_CATEGORY = "KeyPairRecord";

  private static readonly drivers = [Drivers.IndexedDB];

  get isProvisioned() {
    return this.walletConfig !== undefined;
  }

  get isInitialized() {
    return this.session !== undefined;
  }

  get store() {
    if (!this.session) {
      throw new AriesFrameworkError("No Wallet Session is opened");
    }

    return this.session;
  }

  async create(walletConfig: WalletConfig): Promise<void> {
    await this.createAndOpen(walletConfig);
    await this.close();
  }

  async createAndOpen(walletConfig: WalletConfig): Promise<void> {
    this.session = new Storage({
      name: walletConfig.id,
      driverOrder: IonicStorageWallet.drivers,
    });
    await this.session.create();
  }

  async open(walletConfig: WalletConfig): Promise<void> {
    this.session = new Storage({
      name: walletConfig.id,
      driverOrder: IonicStorageWallet.drivers,
    });
    await this.session.create();
  }

  async close(): Promise<void> {
    this.session = undefined;
  }

  async dispose(): Promise<void> {
    if (this.isInitialized) {
      await this.close();
    }
  }

  async delete(): Promise<void> {
    await this.dispose();
  }

  async createKey({
    seed,
    privateKey,
    keyType,
  }: WalletCreateKeyOptions): Promise<Key> {
    // @TODO - foconnor: This should come from the mnemonic and not be generated here.
    if (seed || privateKey) {
      throw new WalletError(IonicStorageWallet.SEED_OR_PRIVATE_KEY_ERROR_MSG);
    }

    if (keyType === KeyType.Ed25519) {
      let keyPair;
      try {
        keyPair = await Ed25519KeyPair.generate({
          secureRandom: () => randomBytes(32),
        });
        if (!keyPair.privateKey) {
          throw new WalletError(
            IonicStorageWallet.MISSING_PRIVATE_PART_ERROR_MSG
          );
        }
        const publicKeyBase58 = TypedArrayEncoder.toBase58(keyPair.publicKey);
        const privateKeyBase58 = TypedArrayEncoder.toBase58(keyPair.privateKey);
        const keyEntry: StorageObject = {
          name: publicKeyBase58,
          category: IonicStorageWallet.STORAGE_KEY_CATEGORY,
          value: JSON.stringify({
            publicKeyBase58,
            privateKeyBase58,
            keyType: KeyType.Ed25519,
          }),
          tags: { keyType: KeyType.Ed25519 },
        };
        if (await this.store.get(publicKeyBase58)) {
          throw new WalletKeyExistsError(
            IonicStorageWallet.KEY_EXISTS_ERROR_MSG
          );
        }
        await this.store.set(publicKeyBase58, keyEntry);
        return Key.fromPublicKey(keyPair.publicKey, keyType);
      } finally {
        keyPair = undefined;
      }
    } else {
      throw new WalletError(
        `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${keyType}`
      );
    }
  }

  // We don't need this functionality for now.
  async sign(_options: WalletSignOptions): Promise<Buffer> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }

  async verify(_options: WalletVerifyOptions): Promise<boolean> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }

  async pack(
    _payload: Record<string, unknown>,
    _recipientKeys: string[],
    _senderVerkey?: string | undefined
  ): Promise<EncryptedMessage> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }

  async unpack(
    _encryptedMessage: EncryptedMessage
  ): Promise<UnpackedMessageContext> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }

  async generateWalletKey(): Promise<string> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }
  async rotateKey(_walletConfig: WalletConfigRekey): Promise<void> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }
  async generateNonce(): Promise<string> {
    throw new WalletError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
  }

  // These intentionally do nothing - right now we don't support proper safe migration via backups.
  // IndexedDB is not our target storage so this is a temp solution.
  async export(_exportConfig: WalletExportImportConfig): Promise<void> {}
  async import(
    _walletConfig: WalletConfig,
    _importConfig: WalletExportImportConfig
  ): Promise<void> {}
}

export { IonicStorageWallet };
