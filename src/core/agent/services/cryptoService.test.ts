import { Agent } from "@aries-framework/core";
import { NetworkType } from "../../cardano/addresses.types";
import { Blockchain } from "../agent.types";
import { CryptoAccountRecord } from "../modules";
import { CryptoService } from "./cryptoService";

const agent = jest.mocked({
  modules: {
    generalStorage: {
      saveCryptoRecord: jest.fn(),
      getAllCryptoRecord: jest.fn(),
      cryptoAccountIdentitySeedPhraseExists: jest.fn(),
      removeCryptoRecordById: jest.fn(),
    },
  },
});
const cryptoService = new CryptoService(agent as any as Agent);

const addresses = new Map([
  [
    NetworkType.MAINNET,
    new Map([
      [
        1852,
        new Map([
          [0, ["mainnetAddr0"]],
          [1, []],
        ]),
      ],
    ]),
  ],
]);
const rewardAddresses = new Map([
  [NetworkType.MAINNET, ["mainnetRewardAddr0"]],
]);

const cryptoAccountNormalProps = {
  id: "cryptoAccountNormal",
  addresses,
  rewardAddresses,
};
const cryptoAccountNormal = new CryptoAccountRecord(cryptoAccountNormalProps);

const cryptoAccountIdentitySPProps = {
  id: "cryptoAccountIdentity",
  addresses,
  rewardAddresses,
  usesIdentitySeedPhrase: true,
};
const cryptoAccountIdentitySP = new CryptoAccountRecord(
  cryptoAccountIdentitySPProps
);

describe("Crypto service of agent (handles storage)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("can save a crypto record for account with new seed phrase", async () => {
    await cryptoService.storeCryptoAccountRecord(
      cryptoAccountNormalProps.id,
      addresses,
      rewardAddresses
    );
    expect(agent.modules.generalStorage.saveCryptoRecord).toBeCalledWith(
      expect.any(CryptoAccountRecord)
    );
    const newRecord: CryptoAccountRecord =
      agent.modules.generalStorage.saveCryptoRecord.mock.calls[0][0];
    expect(newRecord.id).toEqual(cryptoAccountNormalProps.id);
    expect(newRecord.addresses).toEqual(addresses);
    expect(newRecord.rewardAddresses).toEqual(rewardAddresses);
    expect(newRecord.usesIdentitySeedPhrase).toEqual(false);
  });

  test("can save a crypto record for identity seed phrase account", async () => {
    await cryptoService.storeCryptoAccountRecord(
      cryptoAccountIdentitySPProps.id,
      addresses,
      rewardAddresses,
      true
    );
    expect(agent.modules.generalStorage.saveCryptoRecord).toBeCalledWith(
      expect.any(CryptoAccountRecord)
    );
    const newRecord: CryptoAccountRecord =
      agent.modules.generalStorage.saveCryptoRecord.mock.calls[0][0];
    expect(newRecord.id).toEqual(cryptoAccountIdentitySPProps.id);

    expect(newRecord.addresses).toEqual(addresses);
    expect(newRecord.rewardAddresses).toEqual(rewardAddresses);
    expect(newRecord.usesIdentitySeedPhrase).toEqual(true);
  });

  test("can get all crypto account records", async () => {
    agent.modules.generalStorage.getAllCryptoRecord = jest
      .fn()
      .mockResolvedValue([cryptoAccountNormal, cryptoAccountIdentitySP]);
    expect(await cryptoService.getAllCryptoAccountRecord()).toStrictEqual([
      {
        blockchain: Blockchain.CARDANO,
        id: cryptoAccountNormalProps.id,
        totalADAinUSD: 0,
        usesIdentitySeedPhrase: false,
      },
      {
        blockchain: Blockchain.CARDANO,
        id: cryptoAccountIdentitySPProps.id,
        totalADAinUSD: 0,
        usesIdentitySeedPhrase: true,
      },
    ]);
  });

  test("does not error if there are no crypto account records", async () => {
    agent.modules.generalStorage.getAllCryptoRecord = jest
      .fn()
      .mockResolvedValue([]);
    expect(await cryptoService.getAllCryptoAccountRecord()).toEqual([]);
  });

  test("can check if identity seed phrase has been used for a crypto account", async () => {
    agent.modules.generalStorage.cryptoAccountIdentitySeedPhraseExists = jest
      .fn()
      .mockResolvedValue(false);
    expect(await cryptoService.cryptoAccountIdentitySeedPhraseExists()).toEqual(
      false
    );
    agent.modules.generalStorage.cryptoAccountIdentitySeedPhraseExists = jest
      .fn()
      .mockResolvedValue(true);
    expect(await cryptoService.cryptoAccountIdentitySeedPhraseExists()).toEqual(
      true
    );
  });

  test("can remove a crypto account by ID", async () => {
    const id = "id";
    agent.modules.generalStorage.removeCryptoRecordById = jest.fn();
    await cryptoService.removeCryptoAccountRecordById(id);
    expect(agent.modules.generalStorage.removeCryptoRecordById).toBeCalledWith(
      id
    );
  });
});
