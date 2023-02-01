import {generateMnemonic, mnemonicToEntropy, validateMnemonic as validateMne,} from 'bip39';
import type * as EmurgoSerializationLibrary from '@emurgo/cardano-serialization-lib-browser';
import {BaseAddress, Bip32PrivateKey, Ed25519KeyHash, PrivateKey} from "@emurgo/cardano-serialization-lib-browser";
import {EmurgoModule} from './emurgo';
import cryptoRandomString from 'crypto-random-string';

export const ERA_PARAMS = {
  BYRON: {
    purpose: 44,
    mneSize: {
      12: 128,
    },
  },
  SHELLEY: {
    purpose: 1852,
    mneSize: {
      15: 160,
      24: 256,
    },
  },
  MULTISIG: {
    purpose: 1854,
  },
};
export type CardanoNetwork = 'mainnet' | 'testnet' | 'preview' | 'preprod';

export const CardanoAPI = {
  _lib: undefined as undefined | typeof EmurgoSerializationLibrary,
  async init() {
    this._lib = await EmurgoModule.CardanoWasm();
  },
  generateSeedPhrase(size: number): string {
    return generateMnemonic(size);
  },
  validateSeedPhrase(seedPhrase: string): boolean {
    return validateMne(seedPhrase);
  },
  generateRootKey(seedPhrase: string) {
    try {
      const bip39entropy = mnemonicToEntropy(seedPhrase);
      const passphrase = Buffer.from('');
      // @ts-ignore
      return this._lib.Bip32PrivateKey.from_bip39_entropy(
          Buffer.from(bip39entropy, 'hex'),
          passphrase
      );
    } catch (error) {
      return {
        error,
      };
    }
  },
  encrypt(password: string, data: string) {
    try {
      const passwordHex = Buffer.from(password, 'utf8').toString('hex');

      const salt = cryptoRandomString(2 * 32);
      const nonce = cryptoRandomString(2 * 12);
      // @ts-ignore
      return this._lib.encrypt_with_password(passwordHex, salt, nonce, data);
    } catch (error) {
      return {
        error,
      };
    }
  },
  decrypt(password: string, data: string) {
    try {
      const passwordHex = Buffer.from(password, 'utf8').toString('hex');
      // @ts-ignore
      return this._lib.decrypt_with_password(passwordHex, data);
    } catch (error) {
      return {
        error,
      };
    }
  },
  deriveRootKey(
    rootKey: Bip32PrivateKey,
    purpose: number,
    coinType: number,
    index: number = 0
  ) {
    return rootKey
        .derive(harden(purpose))
        .derive(harden(coinType))
        .derive(harden(index));
  },
  async getAccountKeys(
      rootKey: Bip32PrivateKey,
      purpose: number,
      coinType: number,
      chain: number = 0,
      accountIndex: number = 0,
      stakingKeyIndex: number = 0
  ) {
    try {
      const accountKey: Bip32PrivateKey = this.deriveRootKey(rootKey, purpose, coinType);
      // TODO: refactor
      const chimericAccount = 2;
      return {
        // @ts-ignore
        paymentKey: accountKey.derive(chain).derive(accountIndex).to_raw_key(),
        stakeKey: accountKey
            // @ts-ignore
          .derive(chimericAccount)
          .derive(stakingKeyIndex)
          .to_raw_key(),
      };
    } catch (error) {
      return {
        error,
      };
    }
  },
  stakeAddress(
    accountKey: Bip32PrivateKey,
    networkId: number = 0,
    stakingKeyIndex: number = 0
  ) {
    try {
      const chimericAccount = 2;
      const publicStakeKeyHash: Ed25519KeyHash = accountKey.derive(chimericAccount).derive(stakingKeyIndex).to_raw_key().to_public().hash();

      // @ts-ignore
      return this._lib.RewardAddress.new(
          networkId,
          // @ts-ignore
          this._lib.StakeCredential.from_keyhash(publicStakeKeyHash)
      )
          .to_address()
          .to_bech32();
    } catch (error) {
      return {
        error,
      };
    }
  },
  async generatePaymentAddress(
    accountKey: Bip32PrivateKey,
    chain: number,
    index: number,
    networkId: number
  ) {
    try {
      const chimericAccount = 2; // TODO: refactor
      const publicStakeKeyHash: Ed25519KeyHash = accountKey
          .derive(chimericAccount)
          .derive(0)
          .to_raw_key()
          .to_public()
          .hash();

      const publicPaymentKeyHash: Ed25519KeyHash = accountKey
          .derive(chain)
          .derive(index)
          .to_raw_key()
          .to_public()
          .hash();

      // @ts-ignore
      const addr: BaseAddress = this._lib.BaseAddress.new(
          networkId,
          // @ts-ignore
          this._lib.StakeCredential.from_keyhash(publicPaymentKeyHash),
          // @ts-ignore
          this._lib.StakeCredential.from_keyhash(publicStakeKeyHash)
      );
      return addr.to_address().to_bech32();
    } catch (error) {
      return {
        error,
      };
    }
  },
  async generatePaymentAddresses(
    accountKey: Bip32PrivateKey,
    networkId: number,
    length: number
  ) {
    const externalAddresses = [];
    for (let i = 0; i < length; i++) {
      const address = await this.generatePaymentAddress(
        accountKey,
        0,
        i,
        networkId
      );
      externalAddresses.push({
        index: i,
        network: networkId,
        reference: '',
        tags: [],
        address: address,
        chain: 0,
      });
    }

    const internalAddresses = [];
    for (let i = 0; i < length; i++) {
      const address = await this.generatePaymentAddress(
        accountKey,
        1,
        i,
        networkId
      );
      internalAddresses.push({
        index: i,
        network: networkId,
        reference: '',
        tags: [],
        address: address,
        chain: 1,
      });
    }

    return {
      external: externalAddresses,
      internal: internalAddresses,
    };
  },
  async generateAddresses(
    accountKey: Bip32PrivateKey,
    networkId: number = 0,
    stakingKeyIndex: number = 0,
    totalPaymentAddresses: number = 100 // (100external + 100internal)
  ) {
    const stakeAddress = await this.stakeAddress(accountKey, networkId);

    // @ts-ignore
    if (stakeAddress && stakeAddress.error) return stakeAddress.error;

    const paymentAddresses = await this.generatePaymentAddresses(
      accountKey,
      networkId,
      totalPaymentAddresses
    );

    // @ts-ignore
    if (paymentAddresses && paymentAddresses.error) return paymentAddresses.error;

    return {
      stakeAddress,
      paymentAddresses,
    };
  },
  // CIP-08
  // privKey: paymentKey or stakeKey
  signData(privKey: PrivateKey, data: string) {
    // Get Buffer object
    const msgBuffer = Buffer.from(data);
    // Sign data
    return privKey.sign(msgBuffer);
  },
  buildTx() {
    // TODO
  },
  signTx() {
    // TODO
  },
  sendTx() {
    // TODO
  }
};

export const harden = (num: number) => {
  return 0x80000000 + num;
};
