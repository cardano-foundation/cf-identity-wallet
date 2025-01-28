import { SecureStorage } from "./secureStorage";

const EXISTING_KEY = "keythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE = "valuethatexists";

jest.mock("@jimcase/capacitor-secure-storage-plugin", () => ({
  SecureStoragePlugin: {
    get: jest.fn((options: { key: string }) => {
      if (options.key === EXISTING_KEY) {
        return Promise.resolve({ value: EXISTING_VALUE });
      }
      return Promise.resolve({ value: null });
    }),
    set: jest.fn(),
    remove: jest.fn()
  },
}));

describe("Secure storage service (secure enclave/TEE)", () => {
  test("will throw if an item is missing from the secure storage or return the value if not", async () => {
    await expect(SecureStorage.get(EXISTING_KEY)).resolves.toEqual(EXISTING_VALUE);
    await expect(SecureStorage.get(NON_EXISTING_KEY)).resolves.toBeNull()
  });
});
