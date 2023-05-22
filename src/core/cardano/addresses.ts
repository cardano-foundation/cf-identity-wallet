import { mnemonicToEntropy } from "bip39";
import { CML } from "@cardano-sdk/core";
import { CmlBip32Ed25519 } from "@cardano-sdk/crypto";

class Addresses {
  static cml = new CmlBip32Ed25519(CML);

  static async convertToRootXPrivateKeyHex(
    seedPhrase: string
  ): Promise<string> {
    const bip39entropy = mnemonicToEntropy(seedPhrase);
    const rootXPrvKeyHex = await Addresses.cml.fromBip39Entropy(Buffer.from(bip39entropy, "hex"), "");
    return rootXPrvKeyHex;
  }
}

export { Addresses };
