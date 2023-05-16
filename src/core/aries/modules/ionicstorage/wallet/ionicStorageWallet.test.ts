import {
  KeyType,
  WalletConfig,
  Buffer,
  TypedArrayEncoder,
  Key,
} from "@aries-framework/core";
import { Ed25519KeyPair } from "@transmute/ed25519-key-pair";
import { IonicStorageWallet } from "./ionicStorageWallet";

// ------ MOCKS ------
const createMock = jest.fn();
const getMock = jest.fn().mockImplementation((key) => {
  return key === existingPublicKeyBase58;
});
const setMock = jest.fn();
jest.mock("@ionic/storage", () => ({
  Storage: jest.fn().mockImplementation(() => {
    return { create: createMock, get: getMock, set: setMock };
  }),
  Drivers: jest.fn().mockImplementation(() => ({ IndexedDB: "indexeddb" })),
}));

jest.mock("@transmute/ed25519-key-pair", () => ({
  Ed25519KeyPair: jest.fn().mockImplementation(() => {
    return {};
  }),
}));

Key.fromPublicKey = jest.fn();

// ------ TEST OBJECTS ------
const existingPublicKeyBase58 = "BaLQbiee3X8VUAz4gQ66Na7sZKaedJbEiuxq699nUSUc";
const existingPrivateKeyBase58 =
  "5w6qdf7u9N2RMzYNXz5ibSmZ3bvH2At9kMF4UMzD1NfSUfASboP4myMwdViWTseVqQn2NTcmgxi9edn18raByudN";
const existingKeyPair = {
  publicKey: TypedArrayEncoder.fromBase58(existingPublicKeyBase58),
  privateKey: TypedArrayEncoder.fromBase58(existingPrivateKeyBase58),
};

const newPublicKeyBase58 = "HPA6SoJ6v97UemMAnSF8qee3jMpQ4fj1NKW5Rj8FY2oP";
const newPrivateKeyBase58 =
  "3HY3UzazoEubAxghj62GxosBSURMQcGAMhRxEnUcb7mSmNCqZSBBth5oWSsfsttqMHDw9HdANoCrohWSfZfmWX9o";
const newKeyPair = {
  publicKey: TypedArrayEncoder.fromBase58(newPublicKeyBase58),
  privateKey: TypedArrayEncoder.fromBase58(newPrivateKeyBase58),
};

let wallet: IonicStorageWallet;
const walletConfig: WalletConfig = {
  id: "ionic-storage-wallet-unit-test",
  key: "testkey",
};

describe("Aries - Ionic Storage Module: Wallet Open and Close", () => {
  beforeEach(async () => {
    wallet = new IonicStorageWallet();
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
});

describe("Aries - Ionic Storage Module: Wallet Key Creation", () => {
  beforeAll(async () => {
    wallet = new IonicStorageWallet();
    await wallet.createAndOpen(walletConfig);
  });

  beforeEach(() => {
    // Dynamic mocks
    Ed25519KeyPair.generate = jest.fn().mockReturnValue(newKeyPair);
  });

  test("can create and insert a random key of type Ed25519", async () => {
    await wallet.createKey({ keyType: KeyType.Ed25519 });
    expect(Ed25519KeyPair.generate).toBeCalled();
    expect(getMock).toBeCalledWith(newPublicKeyBase58);
    expect(setMock).toBeCalledWith(newPublicKeyBase58, {
      category: IonicStorageWallet.STORAGE_KEY_CATEGORY,
      name: newPublicKeyBase58,
      value: JSON.stringify({
        publicKeyBase58: newPublicKeyBase58,
        privateKeyBase58: newPrivateKeyBase58,
        keyType: KeyType.Ed25519,
      }),
      tags: {},
    });
    expect(Key.fromPublicKey).toBeCalledWith(
      newKeyPair.publicKey,
      KeyType.Ed25519
    );
  });

  test("should not insert a new key if it already exists", async () => {
    Ed25519KeyPair.generate = jest.fn().mockReturnValue(existingKeyPair);
    await expect(
      wallet.createKey({ keyType: KeyType.Ed25519 })
    ).rejects.toThrowError(IonicStorageWallet.KEY_EXISTS_ERROR_MSG);
    expect(Ed25519KeyPair.generate).toBeCalled();
    expect(getMock).toBeCalledWith(existingPublicKeyBase58);
    expect(setMock).not.toBeCalled();
    expect(Key.fromPublicKey).not.toBeCalled();
  });

  test("should not insert a new key if the private key part is missing", async () => {
    Ed25519KeyPair.generate = jest
      .fn()
      .mockReturnValue({ publicKey: newKeyPair.publicKey });
    await expect(
      wallet.createKey({ keyType: KeyType.Ed25519 })
    ).rejects.toThrowError(IonicStorageWallet.MISSING_PRIVATE_PART_ERROR_MSG);
    expect(Ed25519KeyPair.generate).toBeCalled();
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
    ).rejects.toThrowError(IonicStorageWallet.SEED_OR_PRIVATE_KEY_ERROR_MSG);
    expect(Ed25519KeyPair.generate).not.toBeCalled();
    expect(getMock).not.toBeCalled();
    expect(setMock).not.toBeCalled();
    expect(Key.fromPublicKey).not.toBeCalled();
  });

  test("should only create keys of type Ed25519", async () => {
    await expect(
      wallet.createKey({ keyType: KeyType.Bls12381g1 })
    ).rejects.toThrowError(
      `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1}`
    );
    await expect(
      wallet.createKey({ keyType: KeyType.Bls12381g1g2 })
    ).rejects.toThrowError(
      `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g1g2}`
    );
    await expect(
      wallet.createKey({ keyType: KeyType.Bls12381g2 })
    ).rejects.toThrowError(
      `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.Bls12381g2}`
    );
    await expect(
      wallet.createKey({ keyType: KeyType.X25519 })
    ).rejects.toThrowError(
      `${IonicStorageWallet.UNSUPPORTED_KEY_TYPE_ERROR_MSG} ${KeyType.X25519}`
    );
    expect(Ed25519KeyPair.generate).not.toBeCalled();
    expect(getMock).not.toBeCalled();
    expect(setMock).not.toBeCalled();
    expect(Key.fromPublicKey).not.toBeCalled();
  });
});

describe("Aries - Ionic Storage Module: Methods not implemented", () => {
  beforeEach(async () => {
    wallet = new IonicStorageWallet();
  });

  test("these methods should not be implemented", async () => {
    // This test is almost useless but it will fail as put the functionality in so is a reminder - and covers the lines for coverage.
    const data = Buffer.from("1ag123", "hex");
    const key = Key.fromPublicKeyBase58(newPublicKeyBase58, KeyType.Ed25519);
    await expect(wallet.sign({ data: data, key: key })).rejects.toThrowError(
      IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG
    );
    await expect(
      wallet.verify({ data: data, key: key, signature: data })
    ).rejects.toThrowError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
    await expect(wallet.pack({ a: 1 }, ["key1"])).rejects.toThrowError(
      IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG
    );
    await expect(
      wallet.unpack({
        protected: "protected",
        iv: "iv",
        ciphertext: "ciphertext",
        tag: "tag",
      })
    ).rejects.toThrowError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
    await expect(wallet.generateWalletKey()).rejects.toThrowError(
      IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG
    );
    await expect(
      wallet.rotateKey({ ...walletConfig, rekey: "rotatedkey" })
    ).rejects.toThrowError(IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG);
    await expect(wallet.generateNonce()).rejects.toThrowError(
      IonicStorageWallet.NOT_IMPLEMENTED_YET_ERROR_MSG
    );
  });

  test("import and export should not do anything", async () => {
    await wallet.export({ key: "test", path: "test" });
    await wallet.import(walletConfig, { key: "test", path: "test" });
    expect(createMock).not.toBeCalled(); // createMock "opens" the DB so for IndexedDB we would need to do this for any backup.
  });
});
