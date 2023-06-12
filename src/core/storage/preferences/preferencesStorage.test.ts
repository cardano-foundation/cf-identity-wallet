import { Preferences, SetOptions } from "@capacitor/preferences";
import {GetResult, RemoveOptions} from "@capacitor/preferences/dist/esm/definitions";
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
    expect(Preferences.get).toHaveBeenCalled();
    expect(Preferences.get).toHaveBeenCalledWith({ key: EXISTING_KEY });
    await expect(PreferencesStorage.get(NON_EXISTING_KEY)).rejects.toThrow(
      `${PreferencesStorage.KEY_NOT_FOUND} ${NON_EXISTING_KEY}`
    );
  });

  test("sets an item correctly", async () => {

    Preferences.set = jest.fn().mockImplementation(async (data: SetOptions): Promise<void> => {
      expect(data.key).toBe(EXISTING_KEY);
      expect(data.value).toBe(JSON.stringify(EXISTING_VALUE));
    });

    await PreferencesStorage.set(EXISTING_KEY, EXISTING_VALUE);

    expect(Preferences.set).toHaveBeenCalled();
    expect(Preferences.set).toHaveBeenCalledWith({ key: EXISTING_KEY , value: JSON.stringify(EXISTING_VALUE)});
  });

  test("deletes an item correctly", async () => {

    Preferences.remove = jest.fn().mockImplementation(async (data: RemoveOptions) => {
      expect(data.key).toBe(EXISTING_KEY);
    });

    await PreferencesStorage.remove(EXISTING_KEY);

    expect(Preferences.remove).toHaveBeenCalled();
    expect(Preferences.remove).toHaveBeenCalledWith({ key: EXISTING_KEY});
  });
});
