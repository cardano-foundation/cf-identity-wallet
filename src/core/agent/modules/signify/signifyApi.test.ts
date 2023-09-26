import { ready } from "signify-ts";
import { SignifyApi } from "./signifyApi";
import { utils } from "@aries-framework/core";

const firstAid = "aid1";
const secondAid = "aid2";
const aidPrefix = "keri-";
const witnessPrefix = "witness.";
const uuidToThrow = "throwMe";

let connectMock = jest.fn();
const bootMock = jest.fn();
jest.mock("signify-ts", () => ({
  ready: jest.fn(),
  SignifyClient: jest.fn().mockImplementation(() => {
    return {
      connect: connectMock,
      boot: bootMock,
      identifiers: jest.fn().mockReturnValue({
        list: jest
          .fn()
          .mockResolvedValue([{ name: firstAid }, { name: secondAid }]),
        get: jest.fn().mockImplementation((name: string) => {
          return { name, id: `${aidPrefix}${name}` };
        }),
        create: jest.fn().mockImplementation((name, _config) => {
          return { done: false, name: `${witnessPrefix}${name}` };
        }),
      }),
      operations: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string) => {
          if (name === `${witnessPrefix}${uuidToThrow}`) {
            return { done: false, name };
          }
          return { done: true, name };
        }),
      }),
    };
  }),
  Tier: { low: "low" },
}));

// Set low timeout - fake timers would be better but having issues advancing timer at exact right time
const api = new SignifyApi(5, 1);

describe("Signify API", () => {
  beforeAll(async () => {
    await api.start();
  });

  test("should call boot if connect fails", async () => {
    connectMock = jest.fn().mockImplementationOnce(() => {
      throw new Error("Connect error");
    });
    await api.start();
    expect(ready).toBeCalled();
    expect(bootMock).toBeCalled();
    expect(connectMock).toBeCalledTimes(2);
  });

  test("can create an identifier", async () => {
    const mockName = "keriuuid";
    jest.spyOn(utils, "uuid").mockReturnValue(mockName);
    const { signifyName, identifier } = await api.createIdentifier();
    expect(signifyName).toBe(mockName);
    expect(identifier).toBe(mockName);
  });

  test("can get identifier by name", async () => {
    const mockName = "keriuuid";
    expect(await api.getIdentifierByName(mockName)).toEqual({
      name: mockName,
      id: `${aidPrefix}${mockName}`,
    });
  });

  test("should timeout if identifier creation is not completing", async () => {
    jest.spyOn(utils, "uuid").mockReturnValue(uuidToThrow);
    await expect(api.createIdentifier()).rejects.toThrowError(
      SignifyApi.FAILED_TO_CREATE_IDENTIFIER
    );
  });
});
