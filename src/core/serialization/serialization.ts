import { Bip32PrivateKey } from "@emurgo/cardano-serialization-lib-browser";
import { mnemonicToEntropy } from "bip39";
import { SecureStorage } from "../storage/secureStorage";

class Serializaton {
    
    static async storeSeedPhrase(seedPhrase: string) {
        try {
            const bip39entropy = mnemonicToEntropy(seedPhrase);
            const passphrase = Buffer.from('');
            
            const bip32privateKey = Bip32PrivateKey.from_bip39_entropy(
                Buffer.from(bip39entropy, 'hex'),
                passphrase
            );

            await SecureStorage.set("seedPhrase", seedPhrase);
            await SecureStorage.set("rootKey", bip32privateKey.to_hex());
        } catch (error) {
            return {
                error,
            };
        }
    }
}