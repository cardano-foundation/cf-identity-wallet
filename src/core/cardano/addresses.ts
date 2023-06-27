import { Bip32PrivateKey } from "@emurgo/cardano-serialization-lib-browser";
import { entropyToMnemonic, mnemonicToEntropy } from "bip39";

class Addresses {
  static convertToEntropy(seedPhrase: string): string {
    return mnemonicToEntropy(seedPhrase);
  }

  static convertToRootXPrivateKeyHex(entropy: string): string {
    const rootExtendedPrivateKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, "hex"),
      Buffer.from("")
    );

    return rootExtendedPrivateKey.to_hex();
  }

  static convertToMnemonic(entropy: string): string {
    return entropyToMnemonic(entropy);
  }
}

export { Addresses };
