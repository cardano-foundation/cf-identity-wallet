import {
  KeyType,
  WalletConfig,
  Buffer,
  TypedArrayEncoder,
  Key,
  EncryptedMessage,
} from "@aries-framework/core";
import ed25519 from "@stablelib/ed25519";
import { SqliteStorageWallet } from "./sqliteStorageWallet";

// ------ TEST OBJECTS ------
const existingPublicKeyBase58 = "BaLQbiee3X8VUAz4gQ66Na7sZKaedJbEiuxq699nUSUc";
const existingPrivateKeyBase58 =
  "5w6qdf7u9N2RMzYNXz5ibSmZ3bvH2At9kMF4UMzD1NfSUfASboP4myMwdViWTseVqQn2NTcmgxi9edn18raByudN";
const existingKeyPair = {
  publicKey: TypedArrayEncoder.fromBase58(existingPublicKeyBase58),
  secretKey: TypedArrayEncoder.fromBase58(existingPrivateKeyBase58),
};

const newPublicKeyBase58 = "HPA6SoJ6v97UemMAnSF8qee3jMpQ4fj1NKW5Rj8FY2oP";
const newPrivateKeyBase58 =
  "3HY3UzazoEubAxghj62GxosBSURMQcGAMhRxEnUcb7mSmNCqZSBBth5oWSsfsttqMHDw9HdANoCrohWSfZfmWX9o";
const newKeyPair = {
  publicKey: TypedArrayEncoder.fromBase58(newPublicKeyBase58),
  secretKey: TypedArrayEncoder.fromBase58(newPrivateKeyBase58),
};

const data = Buffer.from("1ag123", "hex");
const signature = Buffer.from("1ag124", "hex");

const authCryptMsg: EncryptedMessage = {
  ciphertext: "WhAHL6hvQebx2GEwApXC4lOx",
  iv: "3XYgJwLsI-aB9P0x",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJkNXByclpqcUtUVUVTckhPQ2E2cFJoSHl2OHBQeGtSSXFfa3pESGp2M3pab0x3aUtqbkZvN3NGQS1PQTJxVVR1IiwiaGVhZGVyIjp7ImtpZCI6IkJhTFFiaWVlM1g4VlVBejRnUTY2TmE3c1pLYWVkSmJFaXV4cTY5OW5VU1VjIiwic2VuZGVyIjoiUFNKNC0tWFI2cG1LUlJtSHFUbTN0R0VHMGtEQ01KOXFTNTFiblN2Ykcxall6dUdYRHZjdTlUTkx2N0wtYWdyWEZ0VEhJOWROdHpYeEdEdzV3SU0zUDFFc3ZrQkpFTGViTXN4blQycDBGRk1SUVNfRUxkN0lMdGkwSjN3IiwiaXYiOiIxYVFDcGpKQk12VThFWjFoZFFRdEZiekc2eUJrOTdJayJ9fV19",
  tag: "tNrmW3Y_KL0rj5LrZ8-pvA",
};
const foreignAuthCryptMsg: EncryptedMessage = {
  ciphertext: "yuxDFWvqUPzaS1UYB0UfMnnU",
  iv: "VpyV1kA2caF14kGj",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJYS1Y4dWpWVkl2NTJXall6Y0lDQkNaRzA0RXBoNmtSdmxWcC13UUJVTTV2VHVNckpBOTBKazhldVFVNnZ3Rjh5IiwiaGVhZGVyIjp7ImtpZCI6IkhQQTZTb0o2djk3VWVtTUFuU0Y4cWVlM2pNcFE0ZmoxTktXNVJqOEZZMm9QIiwic2VuZGVyIjoiVE1QbWNhc3JfSHQ0OFNOUWJSZnJDWVFlUVljVWVvYXhrU1AxMFhIV3B3bHh6bERuS1J4ckk4UktNNUpjQUZlaE4xZzBvNWNOR0VwV0M4WXd3eDZEOUNEQnBXaWVsREY0RW5hVWdneEVtUVY5NUR6cW9GRUNOQVlqSElnIiwiaXYiOiIzSHoxQzZxblBnd1JLRTcyNU9LaVFQNXFDVzhNZjAtdyJ9fV19",
  tag: "qXARyQBFh3IvzJZzhuH8zw",
};
const anonCryptMsg: EncryptedMessage = {
  ciphertext: "W-2zuEmWvKZC4Tn7CanruOQF",
  iv: "NSbXylrJueHBaBxd",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkFub25jcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJDV3Y2ckVpbmN0NlJKaW9aell6OVgwdDhrN1JvdXhZZG9iOVJVSzA3aXlhTEhJRkRTUjRYMWxlSzhmREVtYTdrcExEdHV2VXBjcXp0eWUwekthZURZNi16OUJYeHBRRW9PX0M3UE9TNm5mSSIsImhlYWRlciI6eyJraWQiOiJCYUxRYmllZTNYOFZVQXo0Z1E2Nk5hN3NaS2FlZEpiRWl1eHE2OTluVVNVYyJ9fV19",
  tag: "qdjrhgtmbyiGcR3o3cq9eg",
};
const foreignAnonCryptMsg: EncryptedMessage = {
  ciphertext: "Ba06a_Q306gBGrlmPL-GAD5v",
  iv: "nrf7SKGXqGKlrV8c",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkFub25jcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJYcWN3a2JLYnZhaGstMU1Gc0pOeDJwMjRPTFBtUDlSX1p1cUJCYnAxb2dYVkJ0OGNycDd6VHd2bjF3cUZIc2ZaUnNtV2RpVVA5OWFmbkVNR1BTc2RHOFpXS1lVRXZqbzdmMGF1NWthTEJQTSIsImhlYWRlciI6eyJraWQiOiJIUEE2U29KNnY5N1VlbU1BblNGOHFlZTNqTXBRNGZqMU5LVzVSajhGWTJvUCJ9fV19",
  tag: "pB52KkNE8cNrkEdk04EGhw",
};
const anonCryptMsgWithAuthCryptHeader: EncryptedMessage = {
  ciphertext: "W-2zuEmWvKZC4Tn7CanruOQF",
  iv: "NSbXylrJueHBaBxd",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJDV3Y2ckVpbmN0NlJKaW9aell6OVgwdDhrN1JvdXhZZG9iOVJVSzA3aXlhTEhJRkRTUjRYMWxlSzhmREVtYTdrcExEdHV2VXBjcXp0eWUwekthZURZNi16OUJYeHBRRW9PX0M3UE9TNm5mSSIsImhlYWRlciI6eyJraWQiOiJCYUxRYmllZTNYOFZVQXo0Z1E2Nk5hN3NaS2FlZEpiRWl1eHE2OTluVVNVYyJ9fV19",
  tag: "qdjrhgtmbyiGcR3o3cq9eg",
};
const unknownAlgMsg: EncryptedMessage = {
  ciphertext: "W-2zuEmWvKZC4Tn7CanruOQF",
  iv: "NSbXylrJueHBaBxd",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IlVua25vd24iLCJyZWNpcGllbnRzIjpbeyJlbmNyeXB0ZWRfa2V5IjoiQ1d2NnJFaW5jdDZSSmlvWnpZejlYMHQ4azdSb3V4WWRvYjlSVUswN2l5YUxISUZEU1I0WDFsZUs4ZkRFbWE3a3BMRHR1dlVwY3F6dHllMHpLYWVEWTYtejlCWHhwUUVvT19DN1BPUzZuZkkiLCJoZWFkZXIiOnsia2lkIjoiQmFMUWJpZWUzWDhWVUF6NGdRNjZOYTdzWkthZWRKYkVpdXhxNjk5blVTVWMifX1dfQ",
  tag: "qdjrhgtmbyiGcR3o3cq9eg",
};
const blankRecipientKeyMsg: EncryptedMessage = {
  ciphertext: "W-2zuEmWvKZC4Tn7CanruOQF",
  iv: "NSbXylrJueHBaBxd",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkFub25jcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJDV3Y2ckVpbmN0NlJKaW9aell6OVgwdDhrN1JvdXhZZG9iOVJVSzA3aXlhTEhJRkRTUjRYMWxlSzhmREVtYTdrcExEdHV2VXBjcXp0eWUwekthZURZNi16OUJYeHBRRW9PX0M3UE9TNm5mSSIsImhlYWRlciI6eyJraWQiOiIifX1dfQ==",
  tag: "qdjrhgtmbyiGcR3o3cq9eg",
};
const missingIvWithSenderMsg: EncryptedMessage = {
  ciphertext: "WhAHL6hvQebx2GEwApXC4lOx",
  iv: "3XYgJwLsI-aB9P0x",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJkNXByclpqcUtUVUVTckhPQ2E2cFJoSHl2OHBQeGtSSXFfa3pESGp2M3pab0x3aUtqbkZvN3NGQS1PQTJxVVR1IiwiaGVhZGVyIjp7ImtpZCI6IkJhTFFiaWVlM1g4VlVBejRnUTY2TmE3c1pLYWVkSmJFaXV4cTY5OW5VU1VjIiwic2VuZGVyIjoiUFNKNC0tWFI2cG1LUlJtSHFUbTN0R0VHMGtEQ01KOXFTNTFiblN2Ykcxall6dUdYRHZjdTlUTkx2N0wtYWdyWEZ0VEhJOWROdHpYeEdEdzV3SU0zUDFFc3ZrQkpFTGViTXN4blQycDBGRk1SUVNfRUxkN0lMdGkwSjN3In19XX0=",
  tag: "tNrmW3Y_KL0rj5LrZ8-pvA",
};
const unexpectedIvWithoutSenderMsg: EncryptedMessage = {
  ciphertext: "WhAHL6hvQebx2GEwApXC4lOx",
  iv: "3XYgJwLsI-aB9P0x",
  protected:
    "eyJlbmMiOiJ4Y2hhY2hhMjBwb2x5MTMwNV9pZXRmIiwidHlwIjoiSldNLzEuMCIsImFsZyI6IkF1dGhjcnlwdCIsInJlY2lwaWVudHMiOlt7ImVuY3J5cHRlZF9rZXkiOiJkNXByclpqcUtUVUVTckhPQ2E2cFJoSHl2OHBQeGtSSXFfa3pESGp2M3pab0x3aUtqbkZvN3NGQS1PQTJxVVR1IiwiaGVhZGVyIjp7ImtpZCI6IkJhTFFiaWVlM1g4VlVBejRnUTY2TmE3c1pLYWVkSmJFaXV4cTY5OW5VU1VjIiwiaXYiOiIxYVFDcGpKQk12VThFWjFoZFFRdEZiekc2eUJrOTdJayJ9fV19",
  tag: "tNrmW3Y_KL0rj5LrZ8-pvA",
};

// ------ MOCKS ------
const createMock = jest.fn();
const getMock = jest
  .spyOn(SqliteStorageWallet.prototype, "getKv")
  .mockImplementation((key) => {
    if (key === existingPublicKeyBase58) {
      return {
        value: {
          publicKeyBase58: existingPublicKeyBase58,
          privateKeyBase58: existingPrivateKeyBase58,
          keyType: KeyType.Ed25519,
        } as any,
      };
    }

    if (key === "VERSION_DATABASE_KEY") return "0.0.1";
    return false as any;
  });
const setMock = jest
  .spyOn(SqliteStorageWallet.prototype, "setKv")
  .mockImplementation();

const connectionMock = {
  open: jest.fn(),
  execute: jest.fn(),
  query: jest.fn(),
  close: jest.fn(),
  executeTransaction: jest.fn(),
};

jest.mock("@capacitor-community/sqlite", () => ({
  CapacitorSQLite: jest.fn().mockImplementation(() => {
    return {};
  }),
  SQLiteConnection: jest.fn().mockImplementation(() => {
    return {
      checkConnectionsConsistency: jest.fn().mockReturnValue({
        result: "OK",
      }),
      isConnection: jest.fn().mockReturnValue({
        result: true,
      }),
      retrieveConnection: jest.fn().mockReturnValue(connectionMock),
      createConnection: jest.fn().mockReturnValue(connectionMock),
    };
  }),
  SQLiteDBConnection: jest.fn(),
}));

jest.mock("@stablelib/ed25519", () => ({
  ...jest.requireActual("@stablelib/ed25519"),
  generateKeyPair: jest.fn().mockImplementation(() => {
    return {};
  }),
  sign: jest.fn().mockReturnValue(new Uint8Array()),
  verify: jest.fn(),
}));

const fromPublicKeySpy = jest.spyOn(Key, "fromPublicKey");

let wallet: SqliteStorageWallet;

const walletConfig: WalletConfig = {
  id: "sqlite-storage-wallet-unit-test",
  key: "testkey",
};

describe("Aries - SQLite Storage Module: Wallet Open and Close", () => {
  beforeEach(async () => {
    wallet = new SqliteStorageWallet();
  });

  afterEach(async () => {
    await wallet.delete();
  });

  test("create wallet should provision the wallet", async () => {
    expect(wallet.isProvisioned).toEqual(false);
    await wallet.create(walletConfig);
    expect(wallet.isProvisioned).toEqual(false);
  });

  test("create wallet should close it after", async () => {
    await wallet.create(walletConfig);
    expect(wallet.isInitialized).toEqual(false);
  });

  test("createAndOpen wallet should keep the session open", async () => {
    await wallet.createAndOpen(walletConfig);
    expect(wallet.isInitialized).toEqual(true);
  });

  test("open wallet should keep the session open", async () => {
    await wallet.open(walletConfig);
    expect(wallet.isInitialized).toEqual(true);
  });

  test("session should not exist after closing", async () => {
    await wallet.open(walletConfig);
    expect(wallet.isInitialized).toEqual(true);
    await wallet.close();
    expect(wallet.isInitialized).toEqual(false);
  });

  test("dispose should close the session", async () => {
    await wallet.open(walletConfig);
    expect(wallet.isInitialized).toEqual(true);
    await wallet.dispose();
    expect(wallet.isInitialized).toEqual(false);
  });

  test("delete should close the session", async () => {
    await wallet.open(walletConfig);
    expect(wallet.isInitialized).toEqual(true);
    await wallet.delete();
    expect(wallet.isInitialized).toEqual(false);
  });

  test("store getter should throw if the wallet session is not open", async () => {
    expect(() => wallet.store).toThrowError("No Wallet Session is opened");
  });

  test("wallet supported key types", async () => {
    expect(wallet.supportedKeyTypes).toEqual([KeyType.Ed25519, KeyType.X25519]);
  });
});

describe("Aries - SQLite Storage Module: Wallet Key Operations", () => {
  beforeAll(async () => {
    wallet = new SqliteStorageWallet();
    await wallet.createAndOpen(walletConfig);
  });

  beforeEach(() => {
    ed25519.generateKeyPair = jest.fn().mockReturnValue(newKeyPair);
  });

  test("can create and insert a random key of type Ed25519", async () => {
    await wallet.createKey({ keyType: KeyType.Ed25519 });
    expect(ed25519.generateKeyPair).toBeCalled();
    expect(getMock).toBeCalledWith(newPublicKeyBase58);
    expect(setMock).toBeCalledWith(newPublicKeyBase58, {
      category: SqliteStorageWallet.STORAGE_KEY_CATEGORY,
      name: newPublicKeyBase58,
      value: {
        publicKeyBase58: newPublicKeyBase58,
        privateKeyBase58: newPrivateKeyBase58,
        keyType: KeyType.Ed25519,
      },
      tags: { keyType: KeyType.Ed25519 },
    });
    expect(Key.fromPublicKey).toBeCalledWith(
      newKeyPair.publicKey,
      KeyType.Ed25519
    );
  });

  test("should not insert a new key if it already exists", async () => {
    ed25519.generateKeyPair = jest.fn().mockReturnValue(existingKeyPair);
    await expect(
      wallet.createKey({ keyType: KeyType.Ed25519 })
    ).rejects.toThrowError(SqliteStorageWallet.KEY_EXISTS_ERROR_MSG);
    expect(ed25519.generateKeyPair).toBeCalled();
    expect(getMock).toBeCalledWith(existingPublicKeyBase58);
    expect(setMock).not.toBeCalled();
    expect(Key.fromPublicKey).not.toBeCalled();
  });

  test("should not insert a new key if the private key part is missing", async () => {
    ed25519.generateKeyPair = jest
      .fn()
      .mockReturnValue({ publicKey: newKeyPair.publicKey });
    await expect(
      wallet.createKey({ keyType: KeyType.Ed25519 })
    ).rejects.toThrowError(SqliteStorageWallet.MISSING_PRIVATE_PART_ERROR_MSG);
    expect(ed25519.generateKeyPair).toBeCalled();
    expect(getMock).not.toBeCalled();
    expect(setMock).not.toBeCalled();
    expect(Key.fromPublicKey).not.toBeCalled();
  });

  test("should reject usage of provided seed or privateKey when creating a key", async () => {
    await expect(
      wallet.createKey({
        seed: Buffer.from("1ag123", "hex"),
        keyType: KeyType.Ed25519,
      })
    ).rejects.toThrowError(SqliteStorageWallet.SEED_OR_PRIVATE_KEY_ERROR_MSG);
    expect(ed25519.generateKeyPair).not.toBeCalled();
    expect(getMock).not.toBeCalled();
    expect(setMock).not.toBeCalled();
    expect(Key.fromPublicKey).not.toBeCalled();
  });

  test("should only create keys of type Ed25519", async () => {
    await expect(
      wallet.createKey({ keyType: KeyType.Bls12381g1 })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1}`
    );
    await expect(
      wallet.createKey({ keyType: KeyType.Bls12381g1g2 })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1g2}`
    );
    await expect(
      wallet.createKey({ keyType: KeyType.Bls12381g2 })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g2}`
    );
    await expect(
      wallet.createKey({ keyType: KeyType.X25519 })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.X25519}`
    );
    expect(ed25519.generateKeyPair).not.toBeCalled();
    expect(getMock).not.toBeCalled();
    expect(setMock).not.toBeCalled();
    expect(fromPublicKeySpy).not.toBeCalled();
  });

  test("can sign data with an Ed25519 key", async () => {
    await wallet.sign({
      data,
      key: Key.fromPublicKeyBase58(existingPublicKeyBase58, KeyType.Ed25519),
    });
    expect(getMock).toBeCalledWith(existingPublicKeyBase58);
    expect(ed25519.sign).toBeCalledWith(
      TypedArrayEncoder.fromBase58(existingPrivateKeyBase58),
      data
    );
  });

  test("should throw if signing fails", async () => {
    ed25519.sign = jest.fn().mockImplementation(() => {
      throw new Error("Unknown");
    });
    await expect(
      wallet.sign({
        data,
        key: Key.fromPublicKeyBase58(existingPublicKeyBase58, KeyType.Ed25519),
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.SIGNING_ERROR_MSG} ${existingPublicKeyBase58}`
    );
    expect(getMock).toBeCalledWith(existingPublicKeyBase58);
    expect(ed25519.sign).toBeCalledWith(
      TypedArrayEncoder.fromBase58(existingPrivateKeyBase58),
      data
    );
  });

  test("cannot sign data with a key that does not exist in the wallet", async () => {
    await expect(
      wallet.sign({
        data,
        key: Key.fromPublicKeyBase58(newPublicKeyBase58, KeyType.Ed25519),
      })
    ).rejects.toThrowError(SqliteStorageWallet.KEY_DOES_NOT_EXIST_ERROR_MSG);
    expect(getMock).toBeCalledWith(newPublicKeyBase58);
    expect(ed25519.sign).not.toBeCalled();
  });

  test("only supports Ed25519 signing", async () => {
    await expect(
      wallet.sign({
        data,
        key: Key.fromPublicKeyBase58(
          existingPublicKeyBase58,
          KeyType.Bls12381g1
        ),
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1}`
    );
    await expect(
      wallet.sign({
        data,
        key: Key.fromPublicKeyBase58(
          existingPublicKeyBase58,
          KeyType.Bls12381g1g2
        ),
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1g2}`
    );
    await expect(
      wallet.sign({
        data,
        key: Key.fromPublicKeyBase58(
          existingPublicKeyBase58,
          KeyType.Bls12381g2
        ),
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g2}`
    );
    await expect(
      wallet.sign({
        data,
        key: Key.fromPublicKeyBase58(existingPublicKeyBase58, KeyType.X25519),
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.X25519}`
    );
    expect(getMock).not.toBeCalled();
    expect(ed25519.sign).not.toBeCalled();
  });

  test("signing of multiple messages is not supported", async () => {
    const key = Key.fromPublicKeyBase58(newPublicKeyBase58, KeyType.Ed25519);
    await expect(wallet.sign({ data: [data, data], key })).rejects.toThrowError(
      SqliteStorageWallet.MULTI_MESSAGE_SIGNING_UNSUPPORTED_ERROR_MSG
    );
    expect(getMock).not.toBeCalled();
    expect(ed25519.sign).not.toBeCalled();
  });

  test("can verify data with an Ed25519 key", async () => {
    const key = Key.fromPublicKeyBase58(
      existingPublicKeyBase58,
      KeyType.Ed25519
    );
    await wallet.verify({ data, key, signature });
    expect(ed25519.verify).toBeCalledWith(key.publicKey, data, signature);
  });

  test("should throw if verifying fails", async () => {
    const key = Key.fromPublicKeyBase58(
      existingPublicKeyBase58,
      KeyType.Ed25519
    );
    ed25519.verify = jest.fn().mockImplementation(() => {
      throw new Error("Unknown");
    });
    await expect(wallet.verify({ data, key, signature })).rejects.toThrowError(
      `${SqliteStorageWallet.VERIFYING_ERROR_MSG} ${existingPublicKeyBase58}`
    );
    expect(ed25519.verify).toBeCalledWith(key.publicKey, data, signature);
  });

  test("only supports Ed25519 verifying", async () => {
    await expect(
      wallet.verify({
        data,
        key: Key.fromPublicKeyBase58(
          existingPublicKeyBase58,
          KeyType.Bls12381g1
        ),
        signature,
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1}`
    );
    await expect(
      wallet.verify({
        data,
        key: Key.fromPublicKeyBase58(
          existingPublicKeyBase58,
          KeyType.Bls12381g1g2
        ),
        signature,
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1g2}`
    );
    await expect(
      wallet.verify({
        data,
        key: Key.fromPublicKeyBase58(
          existingPublicKeyBase58,
          KeyType.Bls12381g2
        ),
        signature,
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g2}`
    );
    await expect(
      wallet.verify({
        data,
        key: Key.fromPublicKeyBase58(existingPublicKeyBase58, KeyType.X25519),
        signature,
      })
    ).rejects.toThrowError(
      `${SqliteStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.X25519}`
    );
    expect(ed25519.verify).not.toBeCalled();
  });

  test("verifying of multiple messages is not supported", async () => {
    const key = Key.fromPublicKeyBase58(newPublicKeyBase58, KeyType.Ed25519);
    await expect(
      wallet.verify({ data: [data, data], key, signature })
    ).rejects.toThrowError(
      SqliteStorageWallet.MULTI_MESSAGE_VERIFYING_UNSUPPORTED_ERROR_MSG
    );
    expect(ed25519.verify).not.toBeCalled();
  });
});

describe("Aries - SQLite Storage Module: Pack and Unpack messages", () => {
  beforeAll(async () => {
    wallet = new SqliteStorageWallet();
    await wallet.createAndOpen(walletConfig);
  });

  beforeEach(() => {
    ed25519.generateKeyPair = jest.fn().mockReturnValue(newKeyPair);
  });

  // TODO ALL OF THESE NEEDS MORE TESTING
  test("can pack an AuthCrypt message", async () => {
    await wallet.pack(
      { test: "payload" },
      [newPublicKeyBase58],
      existingPublicKeyBase58
    );
    expect(getMock).toBeCalledWith(existingPublicKeyBase58);
  });

  test("can pack an AuthCrypt message with multiple recipientKeys", async () => {
    await wallet.pack(
      { test: "payload" },
      [newPublicKeyBase58, newPublicKeyBase58],
      existingPublicKeyBase58
    );
    expect(getMock).toBeCalledWith(existingPublicKeyBase58);
  });

  test("cannot pack an AuthCrypt message if the senderVerKey is missing in the wallet", async () => {
    await expect(
      wallet.pack(
        { test: "payload" },
        [existingPublicKeyBase58],
        newPublicKeyBase58
      )
    ).rejects.toThrowError(
      `${SqliteStorageWallet.PACK_MSG_SENDER_KEY_MISSING_ERROR_MSG} ${newPublicKeyBase58}`
    );
    expect(getMock).toBeCalledWith(newPublicKeyBase58);
  });

  test("can pack an AnonCrypt message", async () => {
    await wallet.pack({ test: "payload" }, [newPublicKeyBase58]);
    expect(getMock).not.toBeCalled();
  });

  test("can pack an AnonCrypt message with multiple recipientKeys", async () => {
    await wallet.pack({ test: "payload" }, [
      newPublicKeyBase58,
      newPublicKeyBase58,
    ]);
    expect(getMock).not.toBeCalled();
  });

  test("can unpack an AuthCrypt message if the recipient key belongs to this wallet", async () => {
    await wallet.unpack(authCryptMsg);
  });

  test("cannot unpack an AuthCrypt message if the recipient key does not belong to this wallet", async () => {
    await expect(wallet.unpack(foreignAuthCryptMsg)).rejects.toThrowError(
      SqliteStorageWallet.UNPACK_NO_RECIPIENT_KEY_FOUND_ERROR_MSG
    );
  });

  test("can unpack an AnonCrypt message if the recipient key belongs to this wallet", async () => {
    await wallet.unpack(anonCryptMsg);
  });

  test("cannot unpack an AnonCrypt message if the recipient key does not belong to this wallet", async () => {
    await expect(wallet.unpack(foreignAnonCryptMsg)).rejects.toThrowError(
      SqliteStorageWallet.UNPACK_NO_RECIPIENT_KEY_FOUND_ERROR_MSG
    );
  });

  test("cannot unpack an AuthCrypt message with a missing sender public key", async () => {
    await expect(
      wallet.unpack(anonCryptMsgWithAuthCryptHeader)
    ).rejects.toThrowError(
      SqliteStorageWallet.SENDER_KEY_NOT_PROVIDED_AUTHCRYPT_ERROR_MSG
    );
  });

  test("cannot unpack a message with an unknown algorithm", async () => {
    await expect(wallet.unpack(unknownAlgMsg)).rejects.toThrowError(
      SqliteStorageWallet.UNSUPPORTED_PACK_ALG_ERROR_MSG
    );
  });

  test("cannot unpack a message with a blank recipient key", async () => {
    await expect(wallet.unpack(blankRecipientKeyMsg)).rejects.toThrowError(
      SqliteStorageWallet.BLANK_RECIPIENT_KEY_ERROR_MSG
    );
  });

  test("cannot unpack a message with a missing iv field when sender field is provided", async () => {
    await expect(wallet.unpack(missingIvWithSenderMsg)).rejects.toThrowError(
      SqliteStorageWallet.MISSING_IV_ERROR_MSG
    );
  });

  test("cannot unpack a message with an unexpected iv field when sender field is not provided", async () => {
    await expect(
      wallet.unpack(unexpectedIvWithoutSenderMsg)
    ).rejects.toThrowError(SqliteStorageWallet.UNEXPECTED_IV_ERROR_MSG);
  });

  test("can pack and unpack AuthCrypt message to ourselves", async () => {
    const payload = { test: "payload" };
    const message = await wallet.pack(
      payload,
      [existingPublicKeyBase58],
      existingPublicKeyBase58
    );
    const unpackedMsg = await wallet.unpack(message);
    expect(unpackedMsg.plaintextMessage).toEqual(payload);
    expect(unpackedMsg.recipientKey).toEqual(existingPublicKeyBase58);
    expect(unpackedMsg.senderKey).toEqual(existingPublicKeyBase58);
  });

  test("can pack and unpack AnonCrypt message to ourselves", async () => {
    const payload = { test: "payload" };
    const message = await wallet.pack(payload, [existingPublicKeyBase58]);
    const unpackedMsg = await wallet.unpack(message);
    expect(unpackedMsg.plaintextMessage).toEqual(payload);
    expect(unpackedMsg.recipientKey).toEqual(existingPublicKeyBase58);
  });
});

describe("Aries - SQLite Storage Module: Methods not implemented", () => {
  beforeEach(async () => {
    wallet = new SqliteStorageWallet();
  });

  test("these methods should not be implemented", async () => {
    // This test is almost useless but it will fail as put the functionality in so is a reminder - and covers the lines for coverage.
    await expect(wallet.generateWalletKey()).rejects.toThrowError(
      SqliteStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG
    );
    await expect(
      wallet.rotateKey({ ...walletConfig, rekey: "rotatedkey" })
    ).rejects.toThrowError(SqliteStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
    await expect(wallet.generateNonce()).rejects.toThrowError(
      SqliteStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG
    );
  });

  test("import and export should not do anything", async () => {
    await wallet.export({ key: "test", path: "test" });
    await wallet.import(walletConfig, { key: "test", path: "test" });
    expect(createMock).not.toBeCalled(); // createMock "opens" the DB so for IndexedDB we would need to do this for any backup.
  });
});
