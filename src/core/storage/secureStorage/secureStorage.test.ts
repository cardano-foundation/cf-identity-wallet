const EXISTING_KEY = "keythatexists";
const EXISTING_SECOND_KEY = "otherkeythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE = "valuethatexists";

import { SecureStorage } from "./secureStorage";

jest.mock("@evva/capacitor-secure-storage-plugin", () => ({
  SecureStoragePlugin: {
    get: jest.fn((options: { key: string }) => {
      if (options.key === EXISTING_KEY || options.key === EXISTING_SECOND_KEY) {
        return Promise.resolve({ value: EXISTING_VALUE });
      }
      return Promise.resolve({ value: null });
    }),
    set: jest.fn(),
    remove: jest.fn(),
    keys: jest
      .fn()
      .mockResolvedValue({ value: [EXISTING_KEY, EXISTING_SECOND_KEY] }),
  },
}));

describe("Secure storage service (secure enclave/TEE)", () => {
  test("will throw if an item is missing from the secure storage or return the value if not", async () => {
    await expect(SecureStorage.get(EXISTING_KEY)).resolves.toEqual(
      EXISTING_VALUE
    );
    await expect(SecureStorage.get(NON_EXISTING_KEY)).resolves.toBeNull();
  });

  test("can determine if a key exists in the enclave without fetching the value", async () => {
    await expect(SecureStorage.keyExists(EXISTING_KEY)).resolves.toEqual(true);
    await expect(SecureStorage.keyExists(EXISTING_SECOND_KEY)).resolves.toEqual(
      true
    );
    await expect(SecureStorage.keyExists(NON_EXISTING_KEY)).resolves.toEqual(
      false
    );
  });
});
