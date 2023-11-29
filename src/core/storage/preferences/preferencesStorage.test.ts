import { Preferences, SetOptions } from "@capacitor/preferences";
import {
  GetResult,
  RemoveOptions,
} from "@capacitor/preferences/dist/esm/definitions";
import { PreferencesStorage } from "./preferencesStorage";
import { PreferencesStorageItem } from "./preferencesStorage.type";

const existingKey = "keythatexists";
const nonExistingKey = "keythatdoesnotexist";
const existingValue: PreferencesStorageItem = { data: "test" };

describe("Preferences Storage", () => {
  afterEach(jest.clearAllMocks);
  test("gets data or will throw an error if key is missing", async () => {
    Preferences.get = jest
      .fn()
      .mockImplementation(
        async (data: SetOptions): Promise<GetResult | null> => {
          if (data.key === existingKey) {
            return { value: JSON.stringify(existingValue) };
          }
          return null;
        }
      );
    expect(await PreferencesStorage.get(existingKey)).toEqual(existingValue);
    expect(Preferences.get).toHaveBeenCalledWith({ key: existingKey });
    await expect(PreferencesStorage.get(nonExistingKey)).rejects.toThrow(
      `${PreferencesStorage.KEY_NOT_FOUND} ${nonExistingKey}`
    );
  });

  test("sets an item correctly", async () => {
    Preferences.set = jest
      .fn()
      .mockImplementation(async (data: SetOptions): Promise<void> => {
        expect(data.key).toBe(existingKey);
        expect(data.value).toBe(JSON.stringify(existingValue));
      });

    await PreferencesStorage.set(existingKey, existingValue);

    expect(Preferences.set).toHaveBeenCalledWith({
      key: existingKey,
      value: JSON.stringify(existingValue),
    });
  });

  test("deletes an item correctly", async () => {
    Preferences.remove = jest
      .fn()
      .mockImplementation(async (data: RemoveOptions) => {
        expect(data.key).toBe(existingKey);
      });

    await PreferencesStorage.remove(existingKey);

    expect(Preferences.remove).toHaveBeenCalledWith({ key: existingKey });
  });
});
