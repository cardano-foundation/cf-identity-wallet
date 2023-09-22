import { AriesAgent } from "../../agent/agent";
import { Addresses } from "../../cardano";
import { KeyStoreKeys, SecureStorage } from "..";

// @TODO - foconnor: This probably should be a module of the Aries agent in the future -
// when our DIDs/KERI use the seed phrase. For now here is more appropriate.
class SeedPhraseStorageService {
  static readonly AGENT_NOT_READY = "Aries Agent has not been initialised yet";
  static readonly IDENTITY_SEED_PHRASE_IN_USE =
    "A crypto account already exists that is using the identity seed phrase";
  static readonly IDENTITY_ROOT_XPRV_MISSING_OR_MALFORMED =
    "Identity root extended private key does not exist in the secure storage, or was in an unexpected format";

  async createCryptoAccountFromSeedPhrase(
    displayName: string,
    seedPhrase: string
  ): Promise<void> {
    if (!AriesAgent.ready) {
      throw new Error(SeedPhraseStorageService.AGENT_NOT_READY);
    }

    const entropy = Addresses.convertToEntropy(seedPhrase);
    const rootExtendedPrivateKey = Addresses.entropyToBip32NoPasscode(entropy);
    const id = Addresses.bip32PrivateToPublic(rootExtendedPrivateKey);
    const addresses = Addresses.deriveFirstBaseAndRewardAddrs(
      rootExtendedPrivateKey
    );

    // This will throw if we try to add a seed phrase already in use.
    await AriesAgent.agent.crypto.storeCryptoAccountRecord(
      id,
      addresses.addresses,
      addresses.rewardAddresses,
      displayName
    );

    try {
      // Entropy is only stored in case we ever need to recover the original seed phrase.
      await SecureStorage.set(
        `${KeyStoreKeys.CRYPTO_ENTROPY_PREFIX}${id}`,
        entropy
      );
      await SecureStorage.set(
        `${KeyStoreKeys.CRYPTO_ROOT_XPRV_KEY_PREFIX}${id}`,
        rootExtendedPrivateKey
      );
    } catch (err) {
      await AriesAgent.agent.crypto.removeCryptoAccountRecordById(id);
      throw err;
    }
  }

  async createCryptoAccountFromIdentitySeedPhrase(
    displayName: string
  ): Promise<void> {
    if (!AriesAgent.ready) {
      throw new Error(SeedPhraseStorageService.AGENT_NOT_READY);
    }

    if (await AriesAgent.agent.crypto.cryptoAccountIdentitySeedPhraseExists()) {
      throw new Error(SeedPhraseStorageService.IDENTITY_SEED_PHRASE_IN_USE);
    }

    const storedRootXPRV = (await SecureStorage.get(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    )) as string;
    if (!storedRootXPRV || !(typeof storedRootXPRV === "string")) {
      throw new Error(
        SeedPhraseStorageService.IDENTITY_ROOT_XPRV_MISSING_OR_MALFORMED
      );
    }

    const rootExtendedPrivateKey = storedRootXPRV as string;
    const bech32XPrv = Addresses.hexToBech32Bip32Private(
      rootExtendedPrivateKey
    );
    const id = Addresses.bip32PrivateToPublic(bech32XPrv);
    const addresses = Addresses.deriveFirstBaseAndRewardAddrs(bech32XPrv);
    await AriesAgent.agent.crypto.storeCryptoAccountRecord(
      id,
      addresses.addresses,
      addresses.rewardAddresses,
      displayName,
      true
    );
  }
}

export { SeedPhraseStorageService };
