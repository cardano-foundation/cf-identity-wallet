import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records/identifierMetadataRecord";
import { ConnectionStatus } from "../agent.types";
import { Agent } from "../agent";
import { EventService } from "./eventService";
import { MultiSigService } from "./multiSigService";
import { IdentifierStorage } from "../records";
import { SignifyNotificationService } from "./signifyNotificationService";

const notificationStorage = jest.mocked({
  open: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const identifiersListMock = jest.fn();
let identifiersGetMock = jest.fn();
let identifiersCreateMock = jest.fn();
let identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const oobiResolveMock = jest.fn();
let groupGetRequestMock = jest.fn();
let queryKeyStateMock = jest.fn();
let queryKeyStateGetMock = jest.fn();
const addEndRoleMock = jest.fn();
const sendExchangesMock = jest.fn();
const getExchangesMock = jest.fn();
const markNotificationMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: addEndRoleMock,
    interact: identifiersInteractMock,
    rotate: identifiersRotateMock,
    members: identifiersMemberMock,
  }),
  operations: () => ({
    get: jest.fn().mockImplementation((id: string) => {
      return {
        done: true,
        response: {
          i: id,
        },
      };
    }),
  }),
  oobis: () => ({
    get: jest.fn(),
    resolve: oobiResolveMock,
  }),
  contacts: () => ({
    list: jest.fn(),
    get: jest.fn().mockImplementation((id: string) => {
      return {
        alias: "e57ee6c2-2efb-4158-878e-ce36639c761f",
        oobi: "oobi",
        id,
      };
    }),
    delete: jest.fn(),
  }),
  notifications: () => ({
    list: jest.fn(),
    mark: markNotificationMock,
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: getExchangesMock,
    send: sendExchangesMock,
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: queryKeyStateMock,
    get: queryKeyStateGetMock,
  }),

  groups: () => ({ getRequest: groupGetRequestMock }),
});
const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const operationPendingStorage = jest.mocked({
  save: jest.fn(),
});

const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventService: new EventService(),
};

const multiSigService = new MultiSigService(
  agentServicesProps,
  identifierStorage as any,
  notificationStorage as any,
  operationPendingStorage as any
);

let mockResolveOobi = jest.fn();
let mockGetIdentifiers = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionShortDetailById: jest.fn(),
        resolveOobi: () => mockResolveOobi(),
        getMultisigLinkedContacts: jest.fn(),
      },
      identifiers: {
        getIdentifiers: () => mockGetIdentifiers(),
        updateIdentifier: jest.fn(),
      },
      signifyNotifications: {
        addPendingOperationToQueue: jest.fn(),
      },
      getKeriaOnlineStatus: jest.fn(),
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();

const keriMetadataRecordProps: IdentifierMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
  groupMetadata: {
    groupId: "group-id",
    groupInitiator: true,
    groupCreated: false,
  },
};

const keriMetadataRecord = new IdentifierMetadataRecord(
  keriMetadataRecordProps
);

const aidReturnedBySignify = {
  prefix: keriMetadataRecord.id,
  state: {
    s: "s",
    dt: "dt",
    kt: "kt",
    k: "k",
    nt: "nt",
    n: "n",
    bt: "bt",
    b: "b",
    di: "di",
    ee: {
      s: "s",
      d: "d",
    },
  },
};

const multisigMockMemberMetadata = {
  _tags: {
    signifyName: "357cd92a-f349-4f5d-be3d-1ff0ff9969c5",
    groupId: "08f22dee-8cb0-4d65-8600-a82bbc3f6fd7",
    isArchived: false,
    isDeleted: false,
    isPending: false,
    groupCreated: true,
  },
  type: "IdentifierMetadataRecord",
  id: "aid-1",
  displayName: "multi-sig",
  signifyName: "357cd92a-f349-4f5d-be3d-1ff0ff9969c5",
  isArchived: false,
  isDeleted: false,
  isPending: false,
  signifyOpName: "done.aid-1",
  createdAt: "2024-06-28T03:54:03.514Z",
  theme: 0,
  groupMetadata: {
    groupId: "08f22dee-8cb0-4d65-8600-a82bbc3f6fd7",
    groupInitiator: true,
    groupCreated: true,
  },
  authorizedEids: [],
  updatedAt: "2024-06-28T03:55:04.260Z",
};

const multisigMockMembers = {
  signing: [
    {
      aid: "aid-1",
      ends: { agent: { eid1: "" } },
    },
    {
      aid: "aid-2",
      ends: { agent: { eid2: "" } },
    },
  ],
  rotation: [],
};

describe("Multisig sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Can create a keri multisig with KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const creatorIdentifier = "creatorIdentifier";
    const multisigIdentifier = "newMultisigIdentifierAid";
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    mockResolveOobi.mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });

    identifiersCreateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).toEqual({
      identifier: multisigIdentifier,
      isPending: true,
      signifyName: expect.any(String),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({ id: multisigIdentifier, isPending: true })
    );

    expect(operationPendingStorage.save).toBeCalledTimes(1);

    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
    identifiersCreateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}1`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        1
      )
    ).toEqual({
      identifier: `${multisigIdentifier}1`,
      isPending: true,
      signifyName: expect.any(String),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}1`,
      })
    );

    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
    identifiersCreateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}2`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });

    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        2
      )
    ).toEqual({
      identifier: `${multisigIdentifier}2`,
      isPending: true,
      signifyName: expect.any(String),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}2`,
      })
    );

    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
    const invalidOtherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
      },
    ];
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        invalidOtherIdentifiers,
        invalidOtherIdentifiers.length + 1
      )
    ).rejects.toThrowError();
  });

  test("Should call endRoleAuthorization when the multisig creation operation done", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifiersMemberMock = jest.fn().mockResolvedValue({
      signing: [{ ends: { agent: { [keriMetadataRecord.id]: "" } } }],
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    const creatorIdentifier = "creatorIdentifier";
    const multisigIdentifier = "newMultisigIdentifierAid";
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    mockResolveOobi.mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });

    identifiersCreateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: true };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    await multiSigService.createMultisig(
      creatorIdentifier,
      otherIdentifiers,
      otherIdentifiers.length + 1
    );
    expect(addEndRoleMock).toBeCalledTimes(1);
    (keriMetadataRecord.groupMetadata as any).groupCreated = false;
  });

  test("Cannot create a keri multisig if the threshold is invalid", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const creatorIdentifier = "creatorIdentifier";
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
      },
    ];
    await expect(
      multiSigService.createMultisig(creatorIdentifier, otherIdentifiers, 0)
    ).rejects.toThrowError(MultiSigService.INVALID_THRESHOLD);
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 2
      )
    ).rejects.toThrowError(MultiSigService.INVALID_THRESHOLD);
  });

  test("Can create a keri delegated multisig with KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const creatorIdentifier = "creatorIdentifier";
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    mockResolveOobi = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    identifiersCreateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    const delegatorContact = {
      id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyA",
      label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
      oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
      status: ConnectionStatus.CONFIRMED,
      connectionDate: new Date().toISOString(),
    };
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1,
        delegatorContact
      )
    ).toEqual({
      identifier: multisigIdentifier,
      isPending: true,
      signifyName: expect.any(String),
    });
  });

  test("can join the multisig inception", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const multisigIdentifier = "newMultisigIdentifierAid";
    notificationStorage.findById = jest.fn().mockResolvedValue({
      content: {
        d: "d",
      },
    });
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["id"],
            rmids: ["id"],
          },
          e: {
            icp: "icp",
          },
        },
      },
    ]);
    identifiersRotateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);

    mockGetIdentifiers = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
        groupMetadata: {
          groupId: "group-id",
          groupInitiator: false,
          groupCreated: false,
        },
      },
    ]);
    queryKeyStateGetMock = jest.fn().mockResolvedValue([
      {
        name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
        metadata: {
          oobi: "testOobi",
        },
        done: true,
        error: null,
        response: {
          i: "id",
        },
        alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
      },
    ]);
    identifiersCreateMock.mockImplementationOnce((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    expect(
      await multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).toEqual({
      identifier: multisigIdentifier,
      isPending: true,
      signifyName: expect.any(String),
    });

    expect(operationPendingStorage.save).toBeCalledTimes(1);

    identifiersCreateMock.mockImplementationOnce((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: true };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    identifiersMemberMock = jest.fn().mockResolvedValue({
      signing: [{ ends: { agent: { [keriMetadataRecord.id]: "" } } }],
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    await multiSigService.joinMultisig("id", "d", {
      theme: 0,
      displayName: "Multisig",
    });
    expect(addEndRoleMock).toBeCalledTimes(1);
  });

  test("cannot join multisig by notification if exn messages are missing", async () => {
    groupGetRequestMock = jest
      .fn()
      .mockRejectedValue(new Error("request - 404 - SignifyClient message"));
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    await expect(
      multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(`${MultiSigService.EXN_MESSAGE_NOT_FOUND} d`);
  });

  test("cannot join the multisig if cannot get key states for multisig member", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const multisigIdentifier = "newMultisigIdentifierAid";
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["smidId"],
            rmids: ["rmidId"],
          },
          e: {
            icp: "icp",
          },
        },
      },
    ]);
    identifiersRotateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);

    mockGetIdentifiers = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "smidId",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
        groupMetadata: {
          groupId: "group-id",
          groupCreated: false,
          groupInitiator: false,
        },
      },
    ]);
    identifiersCreateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });

    // Cannot get key states both smid and rmid
    queryKeyStateGetMock = jest.fn().mockResolvedValue([]);
    await expect(
      multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(
      MultiSigService.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER
    );

    // Can get keystate smid but cannot get key states both rmid
    queryKeyStateGetMock = jest.fn().mockImplementation((id: string) => {
      if (id === "smidId") {
        return [
          {
            name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
            metadata: {
              oobi: "testOobi",
            },
            done: true,
            error: null,
            response: {
              i: "smidId",
            },
            alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
          },
        ];
      }
      return [];
    });

    // Cannot get key states both smid and rmid
    queryKeyStateGetMock = jest.fn().mockResolvedValue([]);
    await expect(
      multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(
      MultiSigService.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER
    );
  });

  test("should can rorate multisig with KERI multisig do not have manageAid and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 0,
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    expect(multiSigService.rotateMultisig(metadata.id)).rejects.toThrowError(
      MultiSigService.AID_IS_NOT_MULTI_SIG
    );
  });

  test("should can rorate multisig with KERI multisig have members do not rotate it AID first and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    const keriMultisigRecord = {
      ...keriMetadataRecord,
      multisigManageAid: "123",
    };
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMultisigRecord);
    queryKeyStateMock = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: false,
      error: null,
      response: {
        i: "id",
      },
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    identifierStorage.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
      },
    ]);
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 0,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    identifiersMemberMock = jest.fn().mockResolvedValue({
      signing: [
        {
          aid: "ENYqRaAQBWtpS7fgCGirVy-zJNRcWu2ZUsRNBjzvrfR_",
          ends: {
            agent: {
              EGQnU0iNKuvURoeRenW7pZ5wA1Iyijo2EgscSYsK0hum: {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EOpnB724NQqQa58Zqw-ZFEQplQ2hQXpbj6o2gKrzlix3",
          ends: {
            agent: {
              "EAOfcPsG_mHtrzw1TyOxlCiQQlLZn-KTUu4lUy7zB_Na": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EJUPirpdqcZpblLDyQ4P8XkD12wmQUqJb_6M7tUVZT4n",
          ends: {
            agent: {
              "EN6WVdOExj1n6ES-Wzk9yjskoXv_2aEqNEN2iDzttPJb": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
      ],
    });
    expect(multiSigService.rotateMultisig(metadata.id)).rejects.toThrowError(
      MultiSigService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG
    );
  });

  test("should can rotate a keri multisig with KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    queryKeyStateMock = jest.fn().mockResolvedValue({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {
        i: "id",
      },
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    identifierStorage.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
      },
    ]);
    identifiersRotateMock.mockImplementation((name, _config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 0,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    identifiersMemberMock = jest.fn().mockResolvedValue({
      signing: [
        {
          aid: "ENYqRaAQBWtpS7fgCGirVy-zJNRcWu2ZUsRNBjzvrfR_",
          ends: {
            agent: {
              EGQnU0iNKuvURoeRenW7pZ5wA1Iyijo2EgscSYsK0hum: {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EOpnB724NQqQa58Zqw-ZFEQplQ2hQXpbj6o2gKrzlix3",
          ends: {
            agent: {
              "EAOfcPsG_mHtrzw1TyOxlCiQQlLZn-KTUu4lUy7zB_Na": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
        {
          aid: "EJUPirpdqcZpblLDyQ4P8XkD12wmQUqJb_6M7tUVZT4n",
          ends: {
            agent: {
              "EN6WVdOExj1n6ES-Wzk9yjskoXv_2aEqNEN2iDzttPJb": {
                http: "http://dev.keria.cf-keripy.metadata.dev.cf-deployments.org:3902/",
              },
            },
          },
        },
      ],
    });
    expect(await multiSigService.rotateMultisig(metadata.id)).toBe(
      multisigIdentifier
    );
  });

  test("should can join the multisig rotation with no notification and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([]);
    expect(
      multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date().toISOString(),
        a: { d: "d" },
        connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
        read: true,
      })
    ).rejects.toThrowError(MultiSigService.EXN_MESSAGE_NOT_FOUND);
  });

  test("should can join the multisig rotation with AID is not multisig and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 0,
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    notificationStorage.findById = jest.fn().mockResolvedValue({
      content: {
        d: "d",
      },
    });
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            rstates: [{ i: "id", signifyName: "rstateSignifyName" }],
          },
        },
      },
    ]);
    identifiersListMock.mockResolvedValue([
      {
        name: "multisig",
        prefix: "prefix",
      },
    ]);
    expect(
      multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date().toISOString(),
        a: { d: "d" },
        connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
        read: true,
      })
    ).rejects.toThrowError(MultiSigService.AID_IS_NOT_MULTI_SIG);
  });

  test("should can join the multisig rotation", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const multisigIdentifier = "newMultisigIdentifierAid";
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 0,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    notificationStorage.findById = jest.fn().mockResolvedValue({
      content: {
        d: "d",
      },
    });
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            rstates: [{ i: "id", signifyName: "rstateSignifyName" }],
          },
        },
      },
    ]);
    identifiersListMock.mockResolvedValue([
      {
        name: "multisig",
        prefix: "prefix",
      },
    ]);
    identifiersRotateMock.mockImplementation((name, config) => {
      return {
        op: () => {
          return { name: `group.${multisigIdentifier}`, done: false };
        },
        serder: {
          ked: { i: name },
        },
        sigs: [
          "AACKfSP8e2co2sQH-xl3M-5MfDd9QMPhj1Y0Eo44_IKuamF6PIPkZExcdijrE5Kj1bnAI7rkZ7VTKDg3nXPphsoK",
        ],
      };
    });
    identifierStorage.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
        multisigManageAid: "123",
      },
    ]);
    identifiersGetMock.mockResolvedValue({
      state: {
        i: metadata.id,
      },
    });
    expect(
      await multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date().toISOString(),
        a: { d: "d" },
        connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
        read: true,
      })
    ).toBe(multisigIdentifier);
  });

  test("cannot join multisig if there's no identifier matched", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["id"],
            rmids: ["id"],
          },
        },
      },
    ]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id1",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
      },
    ]);
    await expect(
      multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(MultiSigService.MEMBER_AID_NOT_FOUND);
  });

  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 0,
      groupMetadata: {
        groupId: "group-id",
      },
    };
    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: ["id", "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"],
          },
          e: {
            icp: {
              kt: 2,
            },
          },
        },
      },
    ]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([identifierMetadata]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getMultisigLinkedContacts = jest
      .fn()
      .mockResolvedValue([]);
    const result = await multiSigService.getMultisigIcpDetails(
      "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW"
    );
    expect(result.ourIdentifier.id).toBe(identifierMetadata.id);
    expect(result.sender.id).toBe(senderData.id);
    expect(result.otherConnections.length).toBe(0);
    expect(result.threshold).toBe(2);
  });

  test("Throw error if the Multi-sig join request contains unknown AIDs", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 0,
      groupMetadata: {
        groupId: "group-id",
      },
    };
    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1B",
              "senderId",
            ],
          },
        },
      },
    ]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([identifierMetadata]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getMultisigLinkedContacts = jest
      .fn()
      .mockResolvedValue([
        {
          id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
          connectionDate: nowISO,
          label: "",
          logo: "logoUrl",
          status: ConnectionStatus.PENDING,
        },
        {
          id: "EDEp4MS9lFGBkV8sKFV0ldqcyiVd1iOEVZAhZnbqk6A3",
          connectionDate: nowISO,
          label: "",
          logo: "logoUrl",
          status: ConnectionStatus.CONFIRMED,
        },
      ]);
    await expect(
      multiSigService.getMultisigIcpDetails(
        "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW"
      )
    ).rejects.toThrowError(MultiSigService.UNKNOWN_AIDS_IN_MULTISIG_ICP);
  });

  test("Can get multisig icp details of 3 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 0,
      groupMetadata: {
        groupId: "group-id",
      },
    };
    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "senderId",
            ],
          },
          e: {
            icp: {
              kt: 3,
            },
          },
        },
      },
    ]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([identifierMetadata]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getMultisigLinkedContacts = jest
      .fn()
      .mockResolvedValue([
        {
          id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
          connectionDate: nowISO,
          label: "",
          logo: "logoUrl",
          status: ConnectionStatus.PENDING,
        },
      ]);
    const result = await multiSigService.getMultisigIcpDetails(
      "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW"
    );
    expect(result.ourIdentifier.id).toBe(identifierMetadata.id);
    expect(result.sender.id).toBe(senderData.id);
    expect(result.otherConnections.length).toBe(1);
    expect(result.otherConnections[0].id).toBe(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
    expect(result.threshold).toBe(3);
  });

  test("Throw error if we do not control any member AID of the multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 0,
    };
    const senderData = {
      id: "senderId",
      connectionDate: nowISO,
      label: "keri",
      status: ConnectionStatus.CONFIRMED,
    };
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id1",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "senderId",
            ],
          },
        },
      },
    ]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([identifierMetadata]);
    jest
      .spyOn(Agent.agent.connections, "getConnectionShortDetailById")
      .mockResolvedValue(senderData);
    await expect(
      multiSigService.getMultisigIcpDetails(
        "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW"
      )
    ).rejects.toThrowError(MultiSigService.MEMBER_AID_NOT_FOUND);
  });

  test("cannot get multi-sig details from an unknown sender (missing metadata)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        exn: {
          a: {
            name: "signifyName",
            smids: [
              "id1",
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "senderId",
            ],
          },
        },
      },
    ]);
    // @TODO - foconnor: This is not ideal as our identifier service is getting tightly coupled with the connection service.
    // Re-work this later.
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockImplementation(() => {
        throw new Error("Some error from connection service");
      });
    await expect(
      multiSigService.getMultisigIcpDetails(
        "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW"
      )
    ).rejects.toThrowError("Some error from connection service");
  });

  test("cannot get multi-sig details from a notification with no matching exn message", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([]);
    await expect(
      multiSigService.getMultisigIcpDetails(
        "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW"
      )
    ).rejects.toThrowError(
      `${MultiSigService.EXN_MESSAGE_NOT_FOUND} EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW`
    );
  });

  test("Should throw errors when create KERI multisigs with invalid identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const creatorIdentifier = "creatorIdentifier";
    const identifierMetaData = {
      id: "creatorIdentifier",
      displayName: "Identifier 2",
      signifyName: "uuid-here",
      createdAt: now,
      theme: 0,
    };
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: undefined,
      })
    );
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    // Identifier doesn't have groupMetadata
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(MultiSigService.MISSING_GROUP_METADATA);

    // Identifier's group is already created
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: {
          groupId: "123",
          groupCreated: true,
          groupInitiator: true,
        },
      })
    );
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(MultiSigService.GROUP_ALREADY_EXISTs);

    // Identifier's not groupInitiator
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: {
          groupId: "123",
          groupCreated: false,
          groupInitiator: false,
        },
      })
    );
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(MultiSigService.ONLY_ALLOW_GROUP_INITIATOR);
  });

  test("Should throw errors when create KERI multisigs with invalid contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const creatorIdentifier = "creatorIdentifier";
    const identifierMetaData = {
      id: "creatorIdentifier",
      displayName: "Identifier 2",
      signifyName: "uuid-here",
      createdAt: now,
      theme: 0,
    };
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue(
      new IdentifierMetadataRecord({
        ...identifierMetaData,
        groupMetadata: {
          groupCreated: false,
          groupInitiator: true,
          groupId: "not-group-id",
        },
      })
    );
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(MultiSigService.ONLY_ALLOW_LINKED_CONTACTS);
  });

  test("Should throw an error when KERIA is offline ", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    await expect(
      multiSigService.createMultisig(
        "creator",
        [
          {
            id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
            label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
            oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
            status: ConnectionStatus.CONFIRMED,
            connectionDate: new Date().toISOString(),
          },
        ],
        2
      )
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(multiSigService.rotateMultisig("id")).rejects.toThrowError(
      Agent.KERIA_CONNECTION_BROKEN
    );
    await expect(
      multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date().toISOString(),
        a: { d: "d" },
        connectionId: "EGR7Jm38EcsXRIidKDZBYDm_xox6eapfU1tqxdAUzkFd",
        read: true,
      })
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      multiSigService.getMultisigIcpDetails("d")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
  });

  test("Should return true if there is a multisig with the provided multisigId", async () => {
    const multisigId = "multisig-id";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      id: multisigId,
      displayName: "Multisig",
      signifyName: "uuid-here",
      multisigManageAid: "aid",
      createdAt: now,
      theme: 0,
    });
    expect(await multiSigService.hasMultisig(multisigId)).toEqual(true);
  });

  test("Should return false if there is no multisig with the provided multisigId", async () => {
    const multisigId = "multisig-id";
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValue(
        new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING)
      );
    expect(await multiSigService.hasMultisig(multisigId)).toEqual(false);
  });

  test("Should throw if there is an unknown error in hasMultisig", async () => {
    const multisigId = "multisig-id";
    const error = new Error("other error");
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockRejectedValue(error);
    await expect(multiSigService.hasMultisig(multisigId)).rejects.toThrowError(
      error
    );
  });

  test("Should throw error if we don't control any member of the multisig", async () => {
    identifiersMemberMock.mockResolvedValue(multisigMockMembers);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    identifiersGetMock.mockResolvedValueOnce({
      name: "multi-sig",
      prefix: "prefix",
      state: {
        ee: {
          s: "0",
          d: "prefix",
        },
      },
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await expect(
      multiSigService.endRoleAuthorization("multi-sig")
    ).rejects.toThrow(new Error(MultiSigService.MEMBER_AID_NOT_FOUND));
  });

  test("Can add end role authorization", async () => {
    identifiersMemberMock.mockResolvedValue(multisigMockMembers);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(multisigMockMemberMetadata);
    identifiersGetMock.mockResolvedValueOnce({
      name: "multi-sig",
      prefix: "prefix",
      state: {
        ee: {
          s: "0",
          d: "prefix",
        },
      },
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await multiSigService.endRoleAuthorization("multi-sig");
    expect(sendExchangesMock).toBeCalledTimes(
      multisigMockMembers["signing"].length
    );
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      "prefix",
      {
        authorizedEids: multisigMockMembers.signing.map(
          (item) => Object.keys(item.ends.agent)[0]
        ),
      }
    );
  });

  test("Can join end role authorization", async () => {
    identifiersMemberMock.mockResolvedValue(multisigMockMembers);
    groupGetRequestMock.mockResolvedValue([
      {
        exn: {
          e: {
            rpy: {
              dt: new Date(),
              a: {
                role: "agent",
                eid: "eid",
              },
            },
          },
        },
      },
    ]);
    getExchangesMock.mockResolvedValue({
      exn: {
        a: {
          gid: "gid",
        },
      },
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(multisigMockMemberMetadata);
    identifiersGetMock.mockResolvedValueOnce({
      name: "multi-sig",
      prefix: "prefix",
      state: {
        ee: {
          s: "0",
          d: "prefix",
        },
      },
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await multiSigService.joinAuthorization({
      a: {
        gid: "EFPEKHhywRg2Naa-Gx0jiAAXYnQ5y92vDniHAk8beEA_",
      },
      e: {
        rpy: {
          v: "KERI10JSON000111_",
          t: "rpy",
          d: "EE8Ze_pwiMHMMDz_giL0ezN7y_4PJSUPKTe3q2Km_WpY",
          dt: "2024-07-12T09:37:48.801000+00:00",
          r: "/end/role/add",
          a: {
            cid: "EFPEKHhywRg2Naa-Gx0jiAAXYnQ5y92vDniHAk8beEA_",
            role: "agent",
            eid: "EDr4kddR_keAzTUs_PNW-qSsUdLDrKD0YbZxiU-y4B3K",
          },
        },
        d: "EFme1_S0eHc-C6HpcaWpFZnKJGX4f91IBCDmiM6vBQOR",
      },
    });
    expect(sendExchangesMock).toBeCalledTimes(1);
    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      "prefix",
      {
        authorizedEids: ["EDr4kddR_keAzTUs_PNW-qSsUdLDrKD0YbZxiU-y4B3K"],
      }
    );
  });

  test("Cannot join the multisig if marking KERIA fails", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([]);

    markNotificationMock.mockRejectedValue(
      new Error(SignifyNotificationService.FAILED_TO_MARK_NOTIFICATION)
    );
    multiSigService.hasJoinedMultisig = jest.fn().mockResolvedValue(true);
    await expect(
      multiSigService.joinMultisig("id", "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(
      SignifyNotificationService.FAILED_TO_MARK_NOTIFICATION
    );
  });
});
