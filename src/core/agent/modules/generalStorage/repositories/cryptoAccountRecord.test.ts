import { CryptoAccountRecord } from "./cryptoAccountRecord";
import { NetworkType } from "../../../../cardano/addresses.types";

const recordId = "EXAMPLE_RECORD";
const address = "cryptoAccount-item-address";
const rewardAddr = "cryptoAccount-item-reward-addr";

const addresses = new Map<number, string[]>();
addresses.set(0, [address]);
addresses.set(1, []);
const addressesAllPurposes = new Map<number, Map<number, string[]>>();
addressesAllPurposes.set(1852, addresses);
const addressesAllNetworks = new Map<
  NetworkType,
  Map<number, Map<number, string[]>>
>();
addressesAllNetworks.set(NetworkType.TESTNET, addressesAllPurposes);
const rewardAddrs = new Map<NetworkType, string[]>();
rewardAddrs.set(NetworkType.TESTNET, [rewardAddr]);

describe("CryptoAccount Record", () => {
  test("should fill the record based on supplied props", () => {
    const record = new CryptoAccountRecord({
      id: recordId,
      addresses: addressesAllNetworks,
      rewardAddresses: rewardAddrs,
      usesIdentitySeedPhrase: true,
    });

    expect(record.type).toBe(CryptoAccountRecord.type);
    expect(record.id).toBe(recordId);
    const addressesMap = record.addresses.get(NetworkType.TESTNET);
    expect(addressesMap).toBeDefined();
    const purpose1852 = addressesMap?.get(1852);
    expect(purpose1852).toBeDefined();
    const externalAddresses = purpose1852?.get(0);
    const internalAddresses = purpose1852?.get(1);
    expect(externalAddresses).toEqual([address]);
    expect(internalAddresses).toEqual([]);
    expect(record.rewardAddresses.get(NetworkType.TESTNET)).toEqual([
      rewardAddr,
    ]);
    expect(record.usesIdentitySeedPhrase).toBe(true);
    expect(record.getTags()).toMatchObject({
      usesIdentitySeedPhrase: true,
    });
  });

  test("should fall back to not using identity seed phrase", () => {
    const record = new CryptoAccountRecord({
      id: recordId,
      addresses: addressesAllNetworks,
      rewardAddresses: rewardAddrs,
    });

    expect(record.type).toBe(CryptoAccountRecord.type);
    expect(record.id).toBe(recordId);
    const addressesMap = record.addresses.get(NetworkType.TESTNET);
    expect(addressesMap).toBeDefined();
    const purpose1852 = addressesMap?.get(1852);
    expect(purpose1852).toBeDefined();
    const externalAddresses = purpose1852?.get(0);
    const internalAddresses = purpose1852?.get(1);
    expect(externalAddresses).toEqual([address]);
    expect(internalAddresses).toEqual([]);
    expect(record.rewardAddresses.get(NetworkType.TESTNET)).toEqual([
      rewardAddr,
    ]);
    expect(record.usesIdentitySeedPhrase).toBe(false);
    expect(record.getTags()).toMatchObject({
      usesIdentitySeedPhrase: false,
    });
  });
});
