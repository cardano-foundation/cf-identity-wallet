import { Bip32PrivateKey } from "@dcspark/cardano-multiplatform-lib-browser";
import { entropyToMnemonic, mnemonicToEntropy } from "bip39";
import { Buffer } from "buffer";

class Addresses {
  static convertToEntropy(seedPhrase: string): string {
    return mnemonicToEntropy(seedPhrase);
  }

  static convertToMnemonic(entropy: string): string {
    return entropyToMnemonic(entropy);
  }

  static entropyToBip32NoPasscode(entropy: string): string {
    return Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, "hex"),
      Buffer.from("")
    ).to_bech32();
  }

  static bech32ToHexBip32Private(Bech32XPrv: string): string {
    const privateKeyBytes = Bip32PrivateKey.from_bech32(Bech32XPrv).as_bytes();
    return Buffer.from(privateKeyBytes).toString("hex");
  }
}

export { Addresses };
