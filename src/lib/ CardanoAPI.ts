import {generateMnemonic, mnemonicToEntropy, validateMnemonic as validateMne} from "bip39";
import type * as EmurgoSerializationLibrary from '@emurgo/cardano-serialization-lib-browser';
import type {Bip32PrivateKey, PrivateKey} from '@emurgo/cardano-serialization-lib-browser';
import {EmurgoModule} from "./emurgo";
import cryptoRandomString from "crypto-random-string";
import {harden} from "./account";

export const Cardano = {
    _network: null,
    lib: undefined as
        | undefined
        | typeof EmurgoSerializationLibrary,
    async init() {
        // @ts-ignore
        this.lib = await EmurgoModule.CardanoWasm();
    },
    generateSeedPhrase(size:number): string {
        return generateMnemonic(size);
    },
    validateSeedPhrase(seedPhrase:string): boolean {
        return validateMne(seedPhrase);
    },
    generateRootKey(seedPhrase:string) {
        try {
            const bip39entropy = mnemonicToEntropy(seedPhrase);
            const passphrase = Buffer.from('');
            // @ts-ignore
            return this.lib.Bip32PrivateKey.from_bip39_entropy(
                Buffer.from(bip39entropy, 'hex'),
                passphrase
            );
        } catch (e) {
            console.log('error');
            console.log(e);
        }
    },
    encrypt(password:string, data:string) {
        try{
            const passwordHex = Buffer.from(password, 'utf8').toString('hex');

            const salt = cryptoRandomString(2 * 32);
            const nonce = cryptoRandomString(2 * 12);
            // @ts-ignore
            return this.lib.encrypt_with_password(passwordHex, salt, nonce, data);
        } catch (error) {
            return {
                error
            }
        }
    },
    decrypt(password:string, data:string) {
        try {
            const passwordHex = Buffer.from(password, 'utf8').toString('hex');
            // @ts-ignore
            return this.lib.decrypt_with_password(passwordHex, data);
        } catch (error) {
            return {
                error
            }
        }
    },
    deriveRootKey(rootKey:Bip32PrivateKey, purpose:number, coinType:number, index:number = 0) {
        try {
            return rootKey
                .derive(harden(purpose))
                .derive(harden(coinType))
                .derive(harden(index));
        } catch (error) {
            return {
                error
            }
        }
    },
    stakeAddress(accountKey:Bip32PrivateKey, networkId= 0, stakingKeyIndex:number = 0) {
        try{
            const chimericAccount = 2;
            const stakeKey = accountKey.derive(chimericAccount);
            const stakeKey2 = stakeKey.derive(stakingKeyIndex);
            const stakeKey3 = stakeKey2.to_raw_key();

            const stakeKeyPub = stakeKey3.to_public();

            // @ts-ignore
            return this.lib.RewardAddress.new(
                networkId,
                // @ts-ignore
                this.lib.StakeCredential.from_keyhash(stakeKeyPub.hash())
            )
                .to_address()
                .to_bech32();
        } catch (error) {
            return {
                error
            }
        }
    },
    async generatePaymentAddress(accountKey: Bip32PrivateKey,
                                 chain: number,
                                 index: number,
                                 networkId: number) {
        try {
            const chimericAccount = 2; // TODO: refactor
            const stakeKeyPubHash = accountKey
                .derive(chimericAccount)
                .derive(0)
                .to_raw_key().to_public().hash();

            const paymentKeyPubHash = accountKey.derive(chain).derive(index).to_raw_key().to_public().hash();

            // @ts-ignore
            const addr = this.lib.BaseAddress.new(
                networkId,
                // @ts-ignore
                this.lib.StakeCredential.from_keyhash(paymentKeyPubHash),
                // @ts-ignore
                this.lib.StakeCredential.from_keyhash(stakeKeyPubHash)
            );
            return addr.to_address().to_bech32();

        } catch (error) {
            return {
                error
            }
        }
    },
    async generatePaymentAddresses(accountKey:Bip32PrivateKey, networkId: number, length:number) {
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
            externalAddresses,
            internalAddresses
        };
    },
    // CIP-08
    // privKey: paymentKey or stakeKey
    signData(privKey:PrivateKey, data:string) {
        // Get Buffer object
        const msgBuffer = Buffer.from(data);
        // Sign data
        return privKey.sign(msgBuffer);
    }
}
