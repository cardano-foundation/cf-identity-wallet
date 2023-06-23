import { Bip32PrivateKey } from "@emurgo/cardano-serialization-lib-browser";
import { entropyToMnemonic, mnemonicToEntropy } from "bip39";

class Addresses {
  static convertToRootXPrivateKeyHex(seedPhrase: string): string {
    const bip39entropy = mnemonicToEntropy(seedPhrase);
    const rootExtendedPrivateKey = Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(bip39entropy, "hex"),
      Buffer.from("")
    );

    return rootExtendedPrivateKey.to_hex();
  }

  static convertToMnemonic(rootXPrivateKeyHex: string): string {
    const rootExtendedPrivateKey = Bip32PrivateKey.from_hex(rootXPrivateKeyHex);

    return entropyToMnemonic(
      Buffer.from(rootExtendedPrivateKey.chaincode()).toString("hex")
    );
  }
}

export { Addresses };
