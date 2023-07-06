import { CryptoAccountRecord } from "./cryptoAccountRecord";
import { NetworkType } from "../../../../cardano/addresses.types";

const recordId = "EXAMPLE_RECORD";
const address = "cryptoAccount-item-address";
const rewardAddr = "cryptoAccount-item-reward-addr";
const displayName = "cryptoAccount1";
const addresses = new Map<NetworkType, string[]>();
addresses.set(NetworkType.TESTNET, [address]);
const rewardAddrs = new Map<NetworkType, string[]>();
rewardAddrs.set(NetworkType.TESTNET, [rewardAddr]);

describe("CryptoAccount Record", () => {
  test("should fill the record based on supplied props", () => {
    const record = new CryptoAccountRecord({
      id: recordId,
      addresses: addresses,
      rewardAddresses: rewardAddrs,
      displayName,
      usesIdentitySeedPhrase: true,
    });

    expect(record.type).toBe(CryptoAccountRecord.type);
    expect(record.id).toBe(recordId);
    expect(record.addresses.get(NetworkType.TESTNET)).toEqual([address]);
    expect(record.rewardAddresses.get(NetworkType.TESTNET)).toEqual([
      rewardAddr,
    ]);
    expect(record.displayName).toBe(displayName);
    expect(record.usesIdentitySeedPhrase).toBe(true);
    expect(record.getTags()).toMatchObject({
      usesIdentitySeedPhrase: true,
      displayName,
    });
  });

  test("should fall back to not using identity seed phrase", () => {
    const record = new CryptoAccountRecord({
      id: recordId,
      addresses: addresses,
      rewardAddresses: rewardAddrs,
      displayName,
    });

    expect(record.type).toBe(CryptoAccountRecord.type);
    expect(record.id).toBe(recordId);
    expect(record.addresses.get(NetworkType.TESTNET)).toEqual([address]);
    expect(record.rewardAddresses.get(NetworkType.TESTNET)).toEqual([
      rewardAddr,
    ]);
    expect(record.displayName).toBe(displayName);
    expect(record.usesIdentitySeedPhrase).toBe(false);
    expect(record.getTags()).toMatchObject({
      usesIdentitySeedPhrase: false,
      displayName,
    });
  });
});
