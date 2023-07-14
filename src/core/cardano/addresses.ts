import { Bip32PrivateKey } from "@dcspark/cardano-multiplatform-lib-browser";
import { mnemonicToEntropy } from "bip39";

class Addresses {
  static convertToRootXPrivateKeyHex(seedPhrase: string): string {
    const bip39entropy = mnemonicToEntropy(seedPhrase);
    const rootExtendedPrivateKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(bip39entropy, "hex"),
      Buffer.from("")
    );

    return rootExtendedPrivateKey.to_128_xprv().toString();
  }
}

export { Addresses };
