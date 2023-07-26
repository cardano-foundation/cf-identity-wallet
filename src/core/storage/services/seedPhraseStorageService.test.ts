import { SeedPhraseStorageService } from "./seedPhraseStorageService";
import { KeyStoreKeys, SecureStorage } from "../secureStorage";
import { AriesAgent } from "../../aries/ariesAgent";
import { Addresses } from "../../cardano/addresses";
import { NetworkType } from "../../cardano/addresses.types";

let seedPhraseSecureStorage: SeedPhraseStorageService;
const displayName = "displayName";
const seedPhrase = "seedPhrase";
const rootExtendedPrivateKey = "rootExtendedPrivateKey";
const rootExtendedPublicKey = "rootExtendedPublicKey";
const addressesMap: Map<
  NetworkType,
  Map<number, Map<number, string[]>>
> = new Map([
  [
    NetworkType.MAINNET,
    new Map([
      [
        1852,
        new Map([
          [0, ["mainnetAddr"]],
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
          [0, ["testnetAddr"]],
          [1, []],
        ]),
      ],
    ]),
  ],
]);
const rewardAddressesMap = new Map([
  [NetworkType.MAINNET, ["mainnetRewardAddr"]],
  [NetworkType.TESTNET, ["testnetRewardAddr"]],
]);
const entropy = "entropy";

jest.mock("../../aries/ariesAgent", () => ({
  AriesAgent: {
    agent: {
      cryptoAccountIdentitySeedPhraseExists: jest.fn().mockResolvedValue(false),
      storeCryptoAccountRecord: jest.fn(),
      removeCryptoAccountRecordById: jest.fn(),
    },
  },
}));

jest.mock("../../cardano/addresses");
Addresses.bip32PrivateHexToPublicHex = jest
  .fn()
  .mockReturnValue(rootExtendedPublicKey);
Addresses.deriveFirstBaseAndRewardAddrs = jest.fn().mockReturnValue({
  addresses: addressesMap,
  rewardAddresses: rewardAddressesMap,
});
Addresses.convertToEntropy = jest.fn().mockReturnValue(entropy);
Addresses.convertToRootXPrivateKeyHex = jest
  .fn()
  .mockReturnValue(rootExtendedPrivateKey);

jest.mock("../secureStorage");

describe("Seed phrase storage service", () => {
  beforeAll(() => {
    seedPhraseSecureStorage = new SeedPhraseStorageService();
  });

  beforeEach(() => {
    AriesAgent.ready = true;
  });

  // Identity Seed Phrase
  test("can create a crypto account from identity seed phrase if available", async () => {
    AriesAgent.agent.cryptoAccountIdentitySeedPhraseExists = jest
      .fn()
      .mockReturnValue(false);
    SecureStorage.get = jest.fn().mockResolvedValue(rootExtendedPrivateKey);
    await seedPhraseSecureStorage.createCryptoAccountFromIdentitySeedPhrase(
      displayName
    );
    expect(AriesAgent.agent.cryptoAccountIdentitySeedPhraseExists).toBeCalled();
    expect(SecureStorage.get).toBeCalledWith(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    expect(AriesAgent.agent.storeCryptoAccountRecord).toBeCalledWith(
      rootExtendedPublicKey,
      addressesMap,
      rewardAddressesMap,
      displayName,
      true
    );
  });

  test("should not attempt to create crypto account from identity seed phrase if the agent is not ready", async () => {
    AriesAgent.ready = false;
    await expect(
      seedPhraseSecureStorage.createCryptoAccountFromIdentitySeedPhrase(
        displayName
      )
    ).rejects.toThrowError(SeedPhraseStorageService.AGENT_NOT_READY);
    expect(SecureStorage.get).not.toBeCalled();
    expect(AriesAgent.agent.storeCryptoAccountRecord).not.toBeCalled();
  });

  test("cannot create a crypto account from identity seed phrase if not available", async () => {
    AriesAgent.agent.cryptoAccountIdentitySeedPhraseExists = jest
      .fn()
      .mockReturnValue(true);
    await expect(
      seedPhraseSecureStorage.createCryptoAccountFromIdentitySeedPhrase(
        displayName
      )
    ).rejects.toThrowError(SeedPhraseStorageService.IDENTITY_SEED_PHRASE_IN_USE);
    expect(AriesAgent.agent.cryptoAccountIdentitySeedPhraseExists).toBeCalled();
    expect(SecureStorage.get).not.toBeCalled();
    expect(AriesAgent.agent.storeCryptoAccountRecord).not.toBeCalled();
  });

  test("cannot create a crypto account if identity seed phrase is missing", async () => {
    AriesAgent.agent.cryptoAccountIdentitySeedPhraseExists = jest
      .fn()
      .mockReturnValue(false);
    SecureStorage.get = jest.fn().mockResolvedValue(null);
    await expect(
      seedPhraseSecureStorage.createCryptoAccountFromIdentitySeedPhrase(
        displayName
      )
    ).rejects.toThrowError(
      SeedPhraseStorageService.IDENTITY_ROOT_XPRV_MISSING_OR_MALFORMED
    );
    expect(SecureStorage.get).toBeCalledWith(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    expect(AriesAgent.agent.storeCryptoAccountRecord).not.toBeCalled();
  });

  test("cannot create a crypto account if identity seed phrase is not a string", async () => {
    AriesAgent.agent.cryptoAccountIdentitySeedPhraseExists = jest
      .fn()
      .mockReturnValue(false);
    SecureStorage.get = jest.fn().mockResolvedValue(15);
    await expect(
      seedPhraseSecureStorage.createCryptoAccountFromIdentitySeedPhrase(
        displayName
      )
    ).rejects.toThrowError(
      SeedPhraseStorageService.IDENTITY_ROOT_XPRV_MISSING_OR_MALFORMED
    );
    expect(SecureStorage.get).toBeCalledWith(
      KeyStoreKeys.IDENTITY_ROOT_XPRV_KEY
    );
    expect(AriesAgent.agent.storeCryptoAccountRecord).not.toBeCalled();
  });

  // New seed phrase
  test("can create a crypto account from a new seed phrase", async () => {
    await seedPhraseSecureStorage.createCryptoAccountFromSeedPhrase(
      displayName,
      seedPhrase
    );
    expect(AriesAgent.agent.storeCryptoAccountRecord).toBeCalledWith(
      rootExtendedPublicKey,
      addressesMap,
      rewardAddressesMap,
      displayName
    );
    expect(SecureStorage.set).toBeCalledWith(
      `${KeyStoreKeys.CRYPTO_ENTROPY_PREFIX}${rootExtendedPublicKey}`,
      entropy
    );
    expect(SecureStorage.set).toBeCalledWith(
      `${KeyStoreKeys.CRYPTO_ROOT_XPRV_KEY_PREFIX}${rootExtendedPublicKey}`,
      rootExtendedPrivateKey
    );
  });

  test("should not attempt to create crypto account from new seed phrase if the agent is not ready", async () => {
    AriesAgent.ready = false;
    await expect(
      seedPhraseSecureStorage.createCryptoAccountFromSeedPhrase(
        displayName,
        seedPhrase
      )
    ).rejects.toThrowError(SeedPhraseStorageService.AGENT_NOT_READY);
    expect(SecureStorage.get).not.toBeCalled();
    expect(AriesAgent.agent.storeCryptoAccountRecord).not.toBeCalled();
  });

  test("should delete the crypto account from the db if it fails to store items in the secure storage", async () => {
    const errorMsg = "unknown";
    SecureStorage.set = jest.fn().mockImplementation(() => {
      throw new Error(errorMsg);
    });
    await expect(
      seedPhraseSecureStorage.createCryptoAccountFromSeedPhrase(
        displayName,
        seedPhrase
      )
    ).rejects.toThrowError(errorMsg);
    expect(AriesAgent.agent.storeCryptoAccountRecord).toBeCalledWith(
      rootExtendedPublicKey,
      addressesMap,
      rewardAddressesMap,
      displayName
    );
    expect(SecureStorage.set).toBeCalledWith(
      `${KeyStoreKeys.CRYPTO_ENTROPY_PREFIX}${rootExtendedPublicKey}`,
      entropy
    );
    expect(SecureStorage.set).not.toBeCalledWith(
      `${KeyStoreKeys.CRYPTO_ROOT_XPRV_KEY_PREFIX}${rootExtendedPublicKey}`,
      rootExtendedPrivateKey
    );
    expect(AriesAgent.agent.removeCryptoAccountRecordById).toBeCalledWith(
      rootExtendedPublicKey
    );
  });
});
