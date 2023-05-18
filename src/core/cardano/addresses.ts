import { Bip32PrivateKey } from "@emurgo/cardano-serialization-lib-browser";
import { mnemonicToEntropy } from "bip39";

class Addresses {
  static async convertToRootXPrivateKeyHex(
    seedPhrase: string
  ): Promise<string> {
    const bip39entropy = mnemonicToEntropy(seedPhrase);
    const rootExtendedPrivateKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(bip39entropy, "hex"),
      Buffer.from("")
    );

    return rootExtendedPrivateKey.to_hex();
  }
}

export { Addresses };
