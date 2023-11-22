import { CredentialFilter, ready } from "signify-ts";
import { utils } from "@aries-framework/core";
import { SignifyApi } from "./signifyApi";

const firstAid = "aid1";
const secondAid = "aid2";
const aidPrefix = "keri-";
const witnessPrefix = "witness.";
const uuidToThrow = "throwMe";
const oobiPrefix = "oobi.";

let connectMock = jest.fn();
const bootMock = jest.fn();
const admitMock = jest
  .fn()
  .mockImplementation(
    (name: string, message: string, grant: string, datetime?: string) => {
      return [{}, ["sigs"], "aend"];
    }
  );
const submitAdmitMock = jest.fn();

const contacts = [
  {
    id: "id",
    alias: "alias",
  },
];
const notifications = { notes: [] };
const credentials: any[] = [];
const exchange = {};

jest.mock("signify-ts", () => ({
  ready: jest.fn(),
  SignifyClient: jest.fn().mockImplementation(() => {
    return {
      connect: connectMock,
      boot: bootMock,
      identifiers: jest.fn().mockReturnValue({
        list: jest.fn().mockResolvedValue({
          aids: [{ name: firstAid }, { name: secondAid }],
        }),
        get: jest.fn().mockImplementation((name: string) => {
          return { name, id: `${aidPrefix}${name}` };
        }),
        create: jest.fn().mockImplementation((name, _config) => {
          return {
            done: false,
            name: `${witnessPrefix}${name}`,
            op: jest.fn(),
            serder: {
              ked: { i: name },
            },
          };
        }),
        addEndRole: jest.fn(),
      }),
      operations: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string) => {
          if (
            name === `${witnessPrefix}${uuidToThrow}` ||
            name === `${oobiPrefix}${uuidToThrow}`
          ) {
            return { done: false, name };
          }
          return { done: true, name };
        }),
      }),
      oobis: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string) => {
          return {
            oobis: [`${oobiPrefix}${name}`],
          };
        }),
        resolve: jest.fn().mockImplementation((name, _config) => {
          return { done: false, name, response: {} };
        }),
      }),
      contacts: jest.fn().mockReturnValue({
        list: jest
          .fn()
          .mockImplementation(
            (
              group?: string | undefined,
              filterField?: string | undefined,
              filterValue?: string | undefined
            ) => {
              return contacts;
            }
          ),
      }),
      notifications: jest.fn().mockReturnValue({
        list: jest.fn().mockImplementation((start?: number, end?: number) => {
          return notifications;
        }),
        mark: jest.fn().mockImplementation((said: string) => {
          return "marked";
        }),
      }),
      ipex: jest.fn().mockReturnValue({
        admit: admitMock,
        submitAdmit: submitAdmitMock,
      }),
      credentials: jest.fn().mockReturnValue({
        list: jest.fn().mockImplementation((kargs?: CredentialFilter) => {
          return credentials;
        }),
      }),
      exchanges: jest.fn().mockReturnValue({
        get: jest.fn().mockImplementation((name: string, said: string) => {
          return exchange;
        }),
      }),
      agent: {
        pre: "pre",
      },
    };
  }),
  Tier: { low: "low" },
  randomPasscode: jest.fn().mockImplementation(() => {
    return "passcode";
  }),
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

  test("can get oobi by name", async () => {
    const mockName = "keriuuid";
    expect(await api.getOobi(mockName)).toEqual(oobiPrefix + mockName);
  });

  test("can resolve oobi", async () => {
    const aid = "keriuuid";
    const url = oobiPrefix + aid;
    const op = await api.resolveOobi(url);
    expect(op).toEqual({
      name: url,
      alias: expect.any(String),
      done: true,
    });
  });

  test("should timeout if oobi resolving is not completing", async () => {
    const url = oobiPrefix + uuidToThrow;
    await expect(api.resolveOobi(url)).rejects.toThrowError(
      SignifyApi.FAILED_TO_RESOLVE_OOBI
    );
  });

  test("should get contacts successfully", async () => {
    expect(await api.getContacts()).toEqual(contacts);
  });

  test("can get notifications", async () => {
    expect(await api.getNotifications()).toEqual(notifications);
  });

  test("can mark a notification as read", async () => {
    const notificationId = "keriuuid";
    expect(await api.markNotification(notificationId)).toEqual("marked");
  });

  test("can submit admit to ipex", async () => {
    const notificationId = "keriuuid";
    const holderAidName = "holderAidName";
    const issuerAid = "issuerAid";
    await api.admitIpex(notificationId, holderAidName, issuerAid);
    expect(admitMock).toBeCalled();
    expect(submitAdmitMock).toBeCalled();
  });

  test("can get credentials", async () => {
    expect(await api.getCredentials()).toEqual(credentials);
  });

  test("can get KERI exchange", async () => {
    const notificationId = "keriuuid";
    expect(await api.getKeriExchange(notificationId)).toEqual(exchange);
  });

  test("Must throw an error when there's no credential", async () => {
    const said = "not-found-said";
    await expect(api.getCredentialBySaid(said)).rejects.toThrowError(
      SignifyApi.CREDENTIAL_NOT_FOUND
    );
  });
});
