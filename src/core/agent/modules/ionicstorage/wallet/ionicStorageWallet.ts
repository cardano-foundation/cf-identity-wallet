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
  JsonEncoder,
  JsonTransformer,
} from "@aries-framework/core";
import { Storage, Drivers } from "@ionic/storage";
import {
  generateKeyPair,
  KeyPair,
  sign,
  verify,
  convertPublicKeyToX25519,
  convertSecretKeyToX25519,
} from "@stablelib/ed25519";

import {
  crypto_aead_chacha20poly1305_keygen,
  crypto_box_seal,
  randombytes_buf,
  crypto_box_easy,
  crypto_box_NONCEBYTES,
  crypto_aead_chacha20poly1305_ietf_encrypt_detached,
  crypto_aead_chacha20poly1305_ietf_NPUBBYTES,
  crypto_box_seal_open,
  crypto_box_open_easy,
  crypto_aead_chacha20poly1305_ietf_decrypt_detached,
  ready as libsodiumReady,
} from "libsodium-wrappers";
import { KeyPairEntry, JweRecipient } from "./ionicStorageWallet.types";

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
  static readonly MULTI_MESSAGE_SIGNING_UNSUPPORTED_ERROR_MSG =
    "Signing of multiple messages is currently not supported";
  static readonly MULTI_MESSAGE_VERIFYING_UNSUPPORTED_ERROR_MSG =
    "Verifying of multiple messages is currently not supported";
  static readonly SIGNING_ERROR_MSG = "Error signing data with verkey";
  static readonly VERIFYING_ERROR_MSG = "Error verifying data with verkey";
  static readonly KEY_DOES_NOT_EXIST_ERROR_MSG = "Key entry not found";
  static readonly PACK_MSG_SENDER_KEY_MISSING_ERROR_MSG =
    "Unable to pack message. Sender key entry not found for vkey";
  static readonly UNPACK_NO_RECIPIENT_KEY_FOUND_ERROR_MSG =
    "No corresponding recipient key found";
  static readonly SENDER_KEY_NOT_PROVIDED_AUTHCRYPT_ERROR_MSG =
    "Sender public key not provided for Authcrypt";
  static readonly UNSUPPORTED_PACK_ALG_ERROR_MSG =
    "Unsupported pack algorithm:";
  static readonly BLANK_RECIPIENT_KEY_ERROR_MSG = "Blank recipient key";
  static readonly MISSING_IV_ERROR_MSG = "Missing IV";
  static readonly UNEXPECTED_IV_ERROR_MSG = "Unexpected IV";

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

  get supportedKeyTypes() {
    return [KeyType.Ed25519, KeyType.X25519];
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
    await libsodiumReady;
  }

  async open(walletConfig: WalletConfig): Promise<void> {
    this.session = new Storage({
      name: walletConfig.id,
      driverOrder: IonicStorageWallet.drivers,
    });
    await this.session.create();
    await libsodiumReady;
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
      let keyPair: KeyPair | undefined;
      try {
        keyPair = generateKeyPair();
        if (!keyPair.secretKey) {
          throw new WalletError(
            IonicStorageWallet.MISSING_PRIVATE_PART_ERROR_MSG
          );
        }
        const publicKeyBase58 = TypedArrayEncoder.toBase58(keyPair.publicKey);
        const privateKeyBase58 = TypedArrayEncoder.toBase58(keyPair.secretKey);
        const keyEntry: KeyPairEntry = {
          name: publicKeyBase58,
          category: IonicStorageWallet.STORAGE_KEY_CATEGORY,
          value: {
            publicKeyBase58,
            privateKeyBase58,
            keyType: KeyType.Ed25519,
          },
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

  async sign({ data, key }: WalletSignOptions): Promise<Buffer> {
    if (key.keyType === KeyType.Ed25519) {
      if (Array.isArray(data)) {
        throw new WalletError(
          IonicStorageWallet.MULTI_MESSAGE_SIGNING_UNSUPPORTED_ERROR_MSG
        );
      }
      const keyEntry: KeyPairEntry = await this.store.get(key.publicKeyBase58);
      if (!keyEntry) {
        throw new WalletError(IonicStorageWallet.KEY_DOES_NOT_EXIST_ERROR_MSG);
      }
      try {
        return new Buffer(
          sign(
            TypedArrayEncoder.fromBase58(keyEntry.value.privateKeyBase58),
            data
          )
        );
      } catch (error) {
        throw new WalletError(
          `${IonicStorageWallet.SIGNING_ERROR_MSG} ${key.publicKeyBase58}`,
          { cause: error as Error }
        );
      }
    } else {
      throw new WalletError(
        `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${key.keyType}`
      );
    }
  }

  async verify({
    data,
    key,
    signature,
  }: WalletVerifyOptions): Promise<boolean> {
    if (key.keyType === KeyType.Ed25519) {
      if (Array.isArray(data)) {
        throw new WalletError(
          IonicStorageWallet.MULTI_MESSAGE_VERIFYING_UNSUPPORTED_ERROR_MSG
        );
      }
      try {
        return verify(key.publicKey, data, signature);
      } catch (error) {
        throw new WalletError(
          `${IonicStorageWallet.VERIFYING_ERROR_MSG} ${key.publicKeyBase58}`,
          { cause: error as Error }
        );
      }
    } else {
      throw new WalletError(
        `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${key.keyType}`
      );
    }
  }

  async pack(
    payload: Record<string, unknown>,
    recipientKeys: string[],
    senderVerkey?: string | undefined
  ): Promise<EncryptedMessage> {
    let cek: Uint8Array | undefined;
    let senderKey: KeyPairEntry | undefined;

    try {
      cek = crypto_aead_chacha20poly1305_keygen();

      senderKey = senderVerkey ? await this.store.get(senderVerkey) : undefined;
      const recipients: JweRecipient[] = [];
      for (const recipientKey of recipientKeys) {
        const targetExchangeKey = convertPublicKeyToX25519(
          TypedArrayEncoder.fromBase58(recipientKey)
        );
        if (senderVerkey) {
          if (!senderKey) {
            throw new WalletError(
              `${IonicStorageWallet.PACK_MSG_SENDER_KEY_MISSING_ERROR_MSG} ${senderVerkey}`
            );
          }

          const encryptedSender = crypto_box_seal(
            Buffer.from(senderVerkey),
            targetExchangeKey
          );
          const nonce = randombytes_buf(crypto_box_NONCEBYTES);
          const encryptedCek = crypto_box_easy(
            cek,
            nonce,
            targetExchangeKey,
            convertSecretKeyToX25519(
              TypedArrayEncoder.fromBase58(senderKey.value.privateKeyBase58)
            )
          );

          recipients.push({
            encrypted_key: TypedArrayEncoder.toBase64URL(encryptedCek),
            header: {
              kid: recipientKey,
              sender: TypedArrayEncoder.toBase64URL(encryptedSender),
              iv: TypedArrayEncoder.toBase64URL(nonce),
            },
          });
        } else {
          const encryptedCek = crypto_box_seal(cek, targetExchangeKey);
          recipients.push({
            encrypted_key: TypedArrayEncoder.toBase64URL(encryptedCek),
            header: {
              kid: recipientKey,
            },
          });
        }
      }

      const protectedJson = {
        enc: "xchacha20poly1305_ietf",
        typ: "JWM/1.0",
        alg: senderVerkey ? "Authcrypt" : "Anoncrypt",
        recipients: recipients.map((item) => JsonTransformer.toJSON(item)),
      };

      const publicNonce = randombytes_buf(
        crypto_aead_chacha20poly1305_ietf_NPUBBYTES
      );
      const { ciphertext, mac } =
        crypto_aead_chacha20poly1305_ietf_encrypt_detached(
          Buffer.from(JSON.stringify(payload)),
          Buffer.from(JsonEncoder.toBase64URL(protectedJson)),
          null,
          publicNonce,
          cek
        );

      return {
        ciphertext: TypedArrayEncoder.toBase64URL(ciphertext),
        iv: TypedArrayEncoder.toBase64URL(publicNonce),
        protected: JsonEncoder.toBase64URL(protectedJson),
        tag: TypedArrayEncoder.toBase64URL(mac),
      };
    } finally {
      cek = undefined;
      senderKey = undefined;
    }
  }

  async unpack(
    encryptedMessage: EncryptedMessage
  ): Promise<UnpackedMessageContext> {
    const protectedJson = JsonEncoder.fromBase64(encryptedMessage.protected);
    const alg = protectedJson.alg;
    if (!["Anoncrypt", "Authcrypt"].includes(alg)) {
      throw new WalletError(
        `${IonicStorageWallet.UNSUPPORTED_PACK_ALG_ERROR_MSG} ${alg}`
      );
    }

    const recipients = [];
    for (const recip of protectedJson.recipients) {
      const kid = recip.header.kid;
      if (!kid) {
        throw new WalletError(IonicStorageWallet.BLANK_RECIPIENT_KEY_ERROR_MSG);
      }
      const sender = recip.header.sender
        ? TypedArrayEncoder.fromBase64(recip.header.sender)
        : undefined;
      const iv = recip.header.iv
        ? TypedArrayEncoder.fromBase64(recip.header.iv)
        : undefined;
      if (sender && !iv) {
        throw new WalletError(IonicStorageWallet.MISSING_IV_ERROR_MSG);
      } else if (!sender && iv) {
        throw new WalletError(IonicStorageWallet.UNEXPECTED_IV_ERROR_MSG);
      }
      recipients.push({
        kid,
        sender,
        iv,
        encrypted_key: TypedArrayEncoder.fromBase64(recip.encrypted_key),
      });
    }

    let payloadKey, senderKey, recipientKey;

    for (const recipient of recipients) {
      let recipientKeyEntry: KeyPairEntry | null | undefined;

      try {
        recipientKeyEntry = await this.store.get(recipient.kid);
        if (recipientKeyEntry) {
          recipientKey = recipient.kid;

          if (recipient.sender && recipient.iv) {
            senderKey = TypedArrayEncoder.toUtf8String(
              crypto_box_seal_open(
                recipient.sender,
                convertPublicKeyToX25519(
                  TypedArrayEncoder.fromBase58(
                    recipientKeyEntry.value.publicKeyBase58
                  )
                ),
                convertSecretKeyToX25519(
                  TypedArrayEncoder.fromBase58(
                    recipientKeyEntry.value.privateKeyBase58
                  )
                )
              )
            );
            payloadKey = crypto_box_open_easy(
              recipient.encrypted_key,
              recipient.iv,
              convertPublicKeyToX25519(TypedArrayEncoder.fromBase58(senderKey)),
              convertSecretKeyToX25519(
                TypedArrayEncoder.fromBase58(
                  recipientKeyEntry.value.privateKeyBase58
                )
              )
            );
          } else {
            payloadKey = crypto_box_seal_open(
              recipient.encrypted_key,
              convertPublicKeyToX25519(
                TypedArrayEncoder.fromBase58(
                  recipientKeyEntry.value.publicKeyBase58
                )
              ),
              convertSecretKeyToX25519(
                TypedArrayEncoder.fromBase58(
                  recipientKeyEntry.value.privateKeyBase58
                )
              )
            );
          }
          break;
        }
      } finally {
        recipientKeyEntry = undefined;
      }
    }
    if (!payloadKey) {
      throw new WalletError(
        IonicStorageWallet.UNPACK_NO_RECIPIENT_KEY_FOUND_ERROR_MSG
      );
    }

    if (!senderKey && alg === "Authcrypt") {
      throw new WalletError(
        IonicStorageWallet.SENDER_KEY_NOT_PROVIDED_AUTHCRYPT_ERROR_MSG
      );
    }

    try {
      const message = crypto_aead_chacha20poly1305_ietf_decrypt_detached(
        null,
        TypedArrayEncoder.fromBase64(encryptedMessage.ciphertext as string),
        TypedArrayEncoder.fromBase64(encryptedMessage.tag as string),
        TypedArrayEncoder.fromString(encryptedMessage.protected),
        TypedArrayEncoder.fromBase64(encryptedMessage.iv as string),
        payloadKey
      );
      return {
        plaintextMessage: JsonEncoder.fromBuffer(message),
        senderKey,
        recipientKey,
      };
    } finally {
      payloadKey = undefined;
    }
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
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async export(_exportConfig: WalletExportImportConfig): Promise<void> {}
  async import(
    _walletConfig: WalletConfig,
    _importConfig: WalletExportImportConfig
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): Promise<void> {}
}

export { IonicStorageWallet };
