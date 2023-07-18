import {
  BaseAddress,
  Bip32PrivateKey,
  Bip32PublicKey,
  NetworkInfo,
  RewardAddress,
  StakeCredential,
} from "@dcspark/cardano-multiplatform-lib-browser";
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

    return rootExtendedPrivateKey.to_bech32();
  }

  static convertToMnemonic(entropy: string): string {
    return entropyToMnemonic(entropy);
  }

  static bip32PrivateHexToPublicHex(privateBech32: string) {
    return Bip32PrivateKey.from_bech32(privateBech32).to_public().to_bech32();
  }

  static deriveFirstBaseAndRewardAddrs(rootExtendedPrivateKey: string) {
    const rootKey = Bip32PrivateKey.from_bech32(rootExtendedPrivateKey);
    const accountKey = rootKey
      .derive(Addresses.harden(1852))
      .derive(Addresses.harden(1815))
      .derive(Addresses.harden(0));

    const spendingPubKey = accountKey.derive(0).derive(0).to_public();
    const stakePubKey = accountKey.derive(2).derive(0).to_public();

    // Addresses do not change between testnets so we can just pick preprod here.
    const mainnetAddresses = [
      Addresses.calculateBaseAddressBech32(
        spendingPubKey,
        stakePubKey,
        NetworkInfo.mainnet()
      ),
    ];
    const testnetAddresses = [
      Addresses.calculateBaseAddressBech32(
        spendingPubKey,
        stakePubKey,
        NetworkInfo.testnet()
      ),
    ];
    const addresses: Map<
      NetworkType,
      Map<number, Map<number, string[]>>
    > = new Map([
      [
        NetworkType.MAINNET,
        new Map([
          [
            1852,
            new Map([
              [0, mainnetAddresses],
              [1, []],
            ]),
          ],
        ]),
      ],
      [
        NetworkType.TESTNET,
        new Map([
          [
            1852,
            new Map([
              [0, testnetAddresses],
              [1, []],
            ]),
          ],
        ]),
      ],
    ]);

    const rewardAddresses = new Map<NetworkType, string[]>();
    rewardAddresses.set(NetworkType.MAINNET, [
      Addresses.calculateRewardAddressBech32(
        stakePubKey,
        NetworkInfo.mainnet()
      ),
    ]);
    rewardAddresses.set(NetworkType.TESTNET, [
      Addresses.calculateRewardAddressBech32(
        stakePubKey,
        NetworkInfo.testnet()
      ),
    ]);

    return {
      addresses: addresses,
      rewardAddresses,
    };
  }

  private static calculateBaseAddressBech32(
    spendingPubKey: Bip32PublicKey,
    stakePubKey: Bip32PublicKey,
    networkInfo: NetworkInfo
  ): string {
    return BaseAddress.new(
      networkInfo.network_id(),
      StakeCredential.from_keyhash(spendingPubKey.to_raw_key().hash()),
      StakeCredential.from_keyhash(stakePubKey.to_raw_key().hash())
    )
      .to_address()
      .to_bech32();
  }

  private static calculateRewardAddressBech32(
    stakePubKey: Bip32PublicKey,
    networkInfo: NetworkInfo
  ): string {
    return RewardAddress.new(
      networkInfo.network_id(),
      StakeCredential.from_keyhash(stakePubKey.to_raw_key().hash())
    )
      .to_address()
      .to_bech32();
  }

  private static harden(num: number): number {
    return 0x80000000 + num;
  }
}

export { Addresses };
