import { BaseAddress, Bip32PrivateKey, Bip32PublicKey, NetworkInfo, RewardAddress, StakeCredential } from "@emurgo/cardano-serialization-lib-browser";
import { entropyToMnemonic, mnemonicToEntropy } from "bip39";
import { NetworkType } from "./addresses.types";

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

  static bip32PrivateHexToPublicHex(privateHex: string) {
    return Bip32PrivateKey.from_hex(privateHex).to_public().to_hex();
  }

  static deriveFirstBaseAndRewardAddrs(rootExtendedPrivateKey: string) {
    const rootKey = Bip32PrivateKey.from_hex(rootExtendedPrivateKey);
    const accountKey = rootKey
      .derive(Addresses.harden(1852))
      .derive(Addresses.harden(1815))
      .derive(Addresses.harden(0));

    const spendingPubKey = accountKey.derive(0).derive(0).to_public();
    const stakePubKey = accountKey.derive(2).derive(0).to_public();

    // Addresses do not change between testnets so we can just pick preprod here.
    const addresses = new Map<NetworkType, string[]>();
    addresses.set(NetworkType.MAINNET, [Addresses.calculateBaseAddressBech32(spendingPubKey, stakePubKey, NetworkInfo.mainnet())]);
    addresses.set(NetworkType.TESTNET, [Addresses.calculateBaseAddressBech32(spendingPubKey, stakePubKey, NetworkInfo.testnet_preprod())]);

    const rewardAddresses = new Map<NetworkType, string[]>();
    rewardAddresses.set(NetworkType.MAINNET, [Addresses.calculateRewardAddressBech32(stakePubKey, NetworkInfo.mainnet())]);
    rewardAddresses.set(NetworkType.TESTNET, [Addresses.calculateRewardAddressBech32(stakePubKey, NetworkInfo.testnet_preprod())]);

    return {
      addresses,
      rewardAddresses
    }
  }

  private static calculateBaseAddressBech32(spendingPubKey: Bip32PublicKey, stakePubKey: Bip32PublicKey, networkInfo: NetworkInfo): string {
    return BaseAddress.new(
      networkInfo.network_id(),
      StakeCredential.from_keyhash(spendingPubKey.to_raw_key().hash()),
      StakeCredential.from_keyhash(stakePubKey.to_raw_key().hash()),
    ).to_address().to_bech32();
  }

  private static calculateRewardAddressBech32(stakePubKey: Bip32PublicKey, networkInfo: NetworkInfo): string {
    return RewardAddress.new(
      networkInfo.network_id(),
      StakeCredential.from_keyhash(stakePubKey.to_raw_key().hash())
    ).to_address().to_bech32();
  }

  private static harden(num: number): number {
    return 0x80000000 + num;
  }
}

export { Addresses };
