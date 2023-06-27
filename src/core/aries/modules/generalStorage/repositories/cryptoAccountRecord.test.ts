import { Addresses } from "../../../../cardano/addresses";
import { CryptoAccountRecord } from "./cryptoAccountRecord";

const recordId = "EXAMPLE_RECORD";
const recordAddress = "cryptoAccount-item-address";
const recordStakeKey = "cryptoAccount-item-stake-key";

describe("CryptoAccount Record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new CryptoAccountRecord({
      id: recordId,
      address: recordAddress,
      stakeKey: recordStakeKey,
    });

    expect(settingsRecord.type).toBe(CryptoAccountRecord.type);
    expect(settingsRecord.id).toBe(recordId);
    expect(settingsRecord.addresses[0]).toBe(recordAddress);
    expect(settingsRecord.stakeKeys[0]).toBe(recordStakeKey);
    expect(settingsRecord.getTags()).toMatchObject({});
  });
});
