import { SecureStorage } from "./secureStorage";

const EXISTING_KEY = "keythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE = "valuethatexists";

jest.mock("@jimcase/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      if (key === EXISTING_KEY) {
        return EXISTING_VALUE;
      }
      return null;
    },
  },
}));

describe("Secure storage service (secure enclave/TEE)", () => {
  test("will throw if an item is missing from the secure storage or return the value if not", async () => {
    expect(await SecureStorage.get(EXISTING_KEY)).toEqual(EXISTING_VALUE);
    expect(SecureStorage.get(NON_EXISTING_KEY)).rejects.toThrow(
      `${SecureStorage.KEY_NOT_FOUND} ${NON_EXISTING_KEY}`
    );
  });
});
