import { DataType } from "@aparajita/capacitor-secure-storage";
import { SecureStorage } from "./secureStorage";

const EXISTING_KEY = "keythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE: DataType = "valuethatexists";

jest.mock("@aparajita/capacitor-secure-storage", () => ({
  SecureStorage: {
    get: (key: string) => {
      if (key === EXISTING_KEY) {
        return EXISTING_VALUE;
      }
      return null;
    },
  },
}));

describe("Secure Storage Facade", () => {
  test("will always throw if an item is missing from the secure storage", async () => {
    expect(await SecureStorage.get(EXISTING_KEY)).toEqual(EXISTING_VALUE);
    expect(SecureStorage.get(NON_EXISTING_KEY)).rejects.toThrow(
      `${SecureStorage.UNEXPECTED_NOT_FOUND} ${NON_EXISTING_KEY}`
    );
  });
});
