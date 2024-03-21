import { Agent } from "@aries-framework/core";
import { SignifyNotificationService } from "./signifyNotificationService";
import { SignifyApi } from "../modules/signify/signifyApi";

const agent = jest.mocked({
  modules: {
    generalStorage: {
      getAllAvailableIdentifierMetadata: jest.fn(),
      getAllArchivedIdentifierMetadata: jest.fn(),
      getIdentifierMetadata: jest.fn(),
      saveIdentifierMetadataRecord: jest.fn(),
      archiveIdentifierMetadata: jest.fn(),
      deleteIdentifierMetadata: jest.fn(),
      updateIdentifierMetadata: jest.fn(),
      getKeriIdentifiersMetadata: jest.fn(),
    },
    signify: {
      getIdentifierByName: jest.fn(),
      createIdentifier: jest.fn(),
      getAllIdentifiers: jest.fn(),
      markNotification: jest.fn(),
    },
  },
  dids: {
    getCreatedDids: jest.fn(),
    resolve: jest.fn(),
    create: jest.fn(),
  },
  genericRecords: {
    save: jest.fn(),
    findAllByQuery: jest.fn(),
    findById: jest.fn(),
    deleteById: jest.fn(),
  },
});

const basicStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const signifyApi = jest.mocked({
  markNotification: jest.fn(),
});

const signifyNotificationService = new SignifyNotificationService(
  agent as any as Agent,
  basicStorage,
  signifyApi as any as SignifyApi
);

describe("Signify notification service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("callback should be called when there are KERI notifications", async () => {
    const callback = jest.fn();
    const notes = [
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/multisig/icp",
          d: "string",
          m: "",
        },
      },
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "unknown",
          d: "string",
          m: "",
        },
      },
      {
        i: "string",
        dt: "string",
        r: false,
        a: {
          r: "/exn/ipex/grant",
          d: "string",
          m: "",
        },
      },
    ];
    basicStorage.save = jest
      .fn()
      .mockReturnValue({ id: "id", createdAt: new Date(), content: {} });
    jest.useFakeTimers();
    for (const notif of notes) {
      await signifyNotificationService.processNotification(notif, callback);
    }
    expect(basicStorage.save).toBeCalledTimes(2);
    expect(callback).toBeCalledTimes(2);
  });
});
