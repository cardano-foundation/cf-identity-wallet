import { Preferences, SetOptions } from "@capacitor/preferences";
import { GetResult } from "@capacitor/preferences/dist/esm/definitions";
import { PreferencesStorage } from "./preferencesStorage";
import { PreferencesStorageType } from "./preferencesStorage.type";

const EXISTING_KEY = "keythatexists";
const NON_EXISTING_KEY = "keythatdoesnotexist";
const EXISTING_VALUE: PreferencesStorageType = { data: "test" };

describe("Preferences Storage", () => {
  afterEach(jest.clearAllMocks);
  test("gets data or will throw an error if key is missing", async () => {
    Preferences.get = jest
      .fn()
      .mockImplementation(
        async (data: SetOptions): Promise<GetResult | null> => {
          if (data.key === EXISTING_KEY) {
            return { value: JSON.stringify(EXISTING_VALUE) };
          }
          return null;
        }
      );
    expect(await PreferencesStorage.get(EXISTING_KEY)).toEqual(EXISTING_VALUE);
    await expect(PreferencesStorage.get(NON_EXISTING_KEY)).rejects.toThrow(
      `${PreferencesStorage.KEY_NOT_FOUND} ${NON_EXISTING_KEY}`
    );
  });
});
