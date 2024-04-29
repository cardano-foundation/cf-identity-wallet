import { truncate } from "fs";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "../records/identifierMetadataRecord";
import { ConnectionStatus } from "../agent.types";
import { Agent } from "../agent";
import { EventService } from "./eventService";
import { CredentialStorage } from "../records";
import { MultiSigService } from "./multiSigService";

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

const identifiersListMock = jest.fn();
let identifiersGetMock = jest.fn();
let identifiersCreateMock = jest.fn();
let identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const oobiResolveMock = jest.fn();
let groupGetRequestMock = jest.fn();
let queryKeyStateMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: identifiersListMock,
    get: identifiersGetMock,
    create: identifiersCreateMock,
    addEndRole: jest.fn(),
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
    mark: jest.fn(),
  }),
  ipex: () => ({
    admit: jest.fn(),
    submitAdmit: jest.fn(),
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: queryKeyStateMock,
    get: jest.fn(),
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

const agentServicesProps = {
  basicStorage: basicStorage as any,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: identifierStorage as any,
  credentialStorage: {} as any,
};

const multiSigService = new MultiSigService(agentServicesProps);

let mockResolveOobi = jest.fn();
let mockGetIdentifiers = jest.fn();

jest.mock("../../../core/agent/agent", () => ({
  Agent: {
    agent: {
      connections: {
        getConnectionKeriShortDetailById: jest.fn(),
        resolveOobi: () => mockResolveOobi(),
      },
      identifiers: { getIdentifiers: () => mockGetIdentifiers() },
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();

const keriMetadataRecordProps = {
  id: "aidHere",
  displayName: "Identifier 2",
  signifyName: "uuid-here",
  createdAt: now,
  theme: 0,
};
const archivedMetadataRecord = new IdentifierMetadataRecord({
  ...keriMetadataRecordProps,
  isArchived: true,
  theme: 0,
});

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
  },
};

describe("Multisig sig service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Can create a keri multisig with KERI contacts", async () => {
    const creatorIdentifier = "creatorIdentifier";
    const multisigIdentifier = "newMultisigIdentifierAid";
    const signifyName = "newUuidHere";
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    identifiersCreateMock.mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
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
    multiSigService.createAidMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,
        connectionDate: new Date().toISOString(),
      },
    ];
    const metadata = {
      theme: 0,
      displayName: "Multisig",
    };
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        otherIdentifiers.length + 1
      )
    ).toEqual({
      identifier: multisigIdentifier,
      signifyName: expect.any(String),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({ id: multisigIdentifier, isPending: true })
    );

    multiSigService.createAidMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}1`, done: false },
      icpResult: {},
      name: "name",
    });
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        1
      )
    ).toEqual({
      identifier: `${multisigIdentifier}1`,
      signifyName: expect.any(String),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}1`,
      })
    );
    multiSigService.createAidMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}2`, done: true },
      icpResult: {},
      name: "name",
    });
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        2
      )
    ).toEqual({
      identifier: `${multisigIdentifier}2`,
      signifyName: expect.any(String),
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}2`,
      })
    );
  });
  test("Can create a keri delegated multisig with KERI contacts", async () => {
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
    multiSigService.createAidMultisig = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    const otherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
        status: ConnectionStatus.CONFIRMED,

        connectionDate: new Date().toISOString(),
      },
    ];
    const delegatorContact = {
      id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyA",
      label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
      oobi: "http://127.0.0.1:3902/oobi/ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP/agent/EF_dfLFGvUh9kMsV2LIJQtrkuXWG_-wxWzC_XjCWjlkQ",
      status: ConnectionStatus.CONFIRMED,

      connectionDate: new Date().toISOString(),
    };
    const metadata = {
      theme: 0,
      displayName: "Multisig",
    };
    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        metadata as IdentifierMetadataRecordProps,
        otherIdentifiers.length + 1,
        delegatorContact
      )
    ).toEqual({
      identifier: `${multisigIdentifier}`,
      signifyName: expect.any(String),
    });
    expect(multiSigService.createAidMultisig).toBeCalledWith(
      {
        prefix: "aidHere",
        state: {
          b: "b",
          bt: "bt",
          di: "di",
          dt: "dt",
          k: "k",
          kt: "kt",
          n: "n",
          nt: "nt",
          s: "s",
        },
      },
      [{ state: {} }],
      expect.any(String),
      otherIdentifiers.length + 1,
      { state: {} }
    );
  });

  test("can join the multisig inception", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    basicStorage.findById = jest.fn().mockResolvedValue({
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
        },
      },
    ]);
    multiSigService.joinMultisigKeri = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    mockGetIdentifiers = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 0,
      },
    ]);
    expect(
      await multiSigService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 0,
          displayName: "Multisig",
        }
      )
    ).toEqual({
      identifier: `${multisigIdentifier}`,
      signifyName: expect.any(String),
    });
  });

  test("cannot join multisig by notification if exn messages are missing", async () => {
    await expect(
      multiSigService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 0,
          displayName: "Multisig",
        }
      )
    ).rejects.toThrowError();
  });

  test("should can rorate multisig with KERI multisig do not have manageAid and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      isPending: true,
      signifyOpName: "op123",
      signifyName: "",
      theme: 4,
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    expect(multiSigService.rotateMultisig(metadata.id)).rejects.toThrowError(
      MultiSigService.AID_IS_NOT_MULTI_SIG
    );
  });

  test("should can rorate multisig with KERI multisig have members do not rotate it AID first and throw error", async () => {
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
        theme: 4,
      },
    ]);
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
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
        theme: 4,
      },
    ]);
    multiSigService.rotateMultisigAid = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      isPending: false,
      signifyOpName: "op123",
      signifyName: "john_doe",
      theme: 4,
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
    groupGetRequestMock = jest.fn().mockResolvedValue([]);
    expect(
      multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date(),
        a: { d: "d" },
      })
    ).rejects.toThrowError(MultiSigService.EXN_MESSAGE_NOT_FOUND);
  });
  test("should can join the multisig rotation with AID is not multisig and throw error", async () => {
    const metadata = {
      id: "123456",
      displayName: "John Doe",

      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 4,
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    basicStorage.findById = jest.fn().mockResolvedValue({
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
    multiSigService.getIdentifierById = jest.fn().mockResolvedValue([
      {
        name: "multisig",
        prefix: "prefix",
      },
    ]);
    expect(
      multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date(),
        a: { d: "d" },
      })
    ).rejects.toThrowError(MultiSigService.AID_IS_NOT_MULTI_SIG);
  });

  test("should can join the multisig rotation", async () => {
    const multisigIdentifier = "newMultisigIdentifierAid";
    const metadata = {
      id: "123456",
      displayName: "John Doe",
      isPending: true,
      signifyOpName: "op123",
      signifyName: "name",
      theme: 4,
      multisigManageAid: "123",
    } as IdentifierMetadataRecord;
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(metadata);
    basicStorage.findById = jest.fn().mockResolvedValue({
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
    multiSigService.getIdentifierById = jest.fn().mockResolvedValue([
      {
        name: "multisig",
        prefix: "prefix",
      },
    ]);
    multiSigService.joinMultisigRotationKeri = jest.fn().mockResolvedValue({
      op: { name: `group.${multisigIdentifier}`, done: false },
      icpResult: {},
      name: "name",
    });
    identifierStorage.getAllIdentifierMetadata = jest.fn().mockResolvedValue([
      {
        displayName: "displayName",
        id: "id",
        signifyName: "signifyName",
        createdAt: new Date(),
        theme: 4,
        multisigManageAid: "123",
      },
    ]);
    expect(
      await multiSigService.joinMultisigRotation({
        id: "id",
        createdAt: new Date(),
        a: { d: "d" },
      })
    ).toBe(multisigIdentifier);
  });
  test("cannot join multisig if there's no identifier matched", async () => {
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
        theme: 4,
      },
    ]);
    await expect(
      multiSigService.joinMultisig(
        { id: "id", createdAt: new Date(), a: { d: "d" } },
        {
          theme: 4,
          displayName: "Multisig",
        }
      )
    ).rejects.toThrowError(MultiSigService.CANNOT_JOIN_MULTISIG_ICP);
  });

  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 4,
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
    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getConnections = jest.fn().mockResolvedValue([]);
    const result = await multiSigService.getMultisigIcpDetails({
      id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
      createdAt: new Date("2024-03-08T08:52:10.801Z"),
      a: {
        r: "/multisig/icp",
        d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
      },
    });
    expect(result.ourIdentifier.id).toBe(identifierMetadata.id);
    expect(result.sender.id).toBe(senderData.id);
    expect(result.otherConnections.length).toBe(0);
    expect(result.threshold).toBe(2);
  });
  test("Throw error if the Multi-sig join request contains unknown AIDs", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 4,
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
    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getConnections = jest.fn().mockResolvedValue([
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
      multiSigService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError(MultiSigService.UNKNOWN_AIDS_IN_MULTISIG_ICP);
  });
  test("Can get multisig icp details of 3 persons multi-sig", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 4,
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
    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockResolvedValue(senderData);
    Agent.agent.connections.getConnections = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
      },
    ]);
    const result = await multiSigService.getMultisigIcpDetails({
      id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
      createdAt: new Date("2024-03-08T08:52:10.801Z"),
      a: {
        r: "/multisig/icp",
        d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
      },
    });
    expect(result.ourIdentifier.id).toBe(identifierMetadata.id);
    expect(result.sender.id).toBe(senderData.id);
    expect(result.otherConnections.length).toBe(1);
    expect(result.otherConnections[0].id).toBe(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
    expect(result.threshold).toBe(3);
  });
  test("Throw error if we do not control any member AID of the multi-sig", async () => {
    const identifierMetadata = {
      displayName: "displayName",
      id: "id",
      signifyName: undefined,
      createdAt: new Date(),
      theme: 4,
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
      .spyOn(Agent.agent.connections, "getConnectionKeriShortDetailById")
      .mockResolvedValue(senderData);
    jest.spyOn(Agent.agent.connections, "getConnections").mockResolvedValue([
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
      multiSigService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError(MultiSigService.CANNOT_JOIN_MULTISIG_ICP);
  });
  test("cannot get multi-sig details from an unknown sender (missing metadata)", async () => {
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
    Agent.agent.connections.getConnectionKeriShortDetailById = jest
      .fn()
      .mockImplementation(() => {
        throw new Error("Some error from connection service");
      });
    await expect(
      multiSigService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError("Some error from connection service");
  });
  test("cannot get multi-sig details from a notification with no matching exn message", async () => {
    groupGetRequestMock = jest.fn().mockResolvedValue([]);
    await expect(
      multiSigService.getMultisigIcpDetails({
        id: "AIhrazlnKPLYOvqiNJrmG290VEcXsFnfTV2lSGOMiX88",
        createdAt: new Date("2024-03-08T08:52:10.801Z"),
        a: {
          r: "/multisig/icp",
          d: "EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW",
        },
      })
    ).rejects.toThrowError(
      `${MultiSigService.EXN_MESSAGE_NOT_FOUND} EHe8OnqWhR--r7zPJy97PS2B5rY7Zp4vnYQICs4gXodW`
    );
  });
});
