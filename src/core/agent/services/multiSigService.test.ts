import { Dict, Saider, Serder } from "signify-ts";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { ConnectionStatus, NotificationRoute } from "../agent.types";
import { Agent } from "../agent";
import { EventService } from "./eventService";
import { MultiSigService } from "./multiSigService";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import {
  aidMultisigBySignify,
  aidReturnedBySignify,
  gHab,
  keriMetadataRecord,
  mHab,
  mockConnectionShortDetail,
  mockDtime,
  mockExn,
  mockGetRequest,
  mockMultisigIdentifier,
  mockNotification,
  mockResolvedValue,
  mockSigsMes,
  multisigMockMemberMetadata,
  multisigMockMembers,
} from "../../__mocks__/agent/multiSigMock";

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
const deleteNotificationMock = jest.fn((id: string) => Promise.resolve(id));
const ipexAdmitMock = jest.fn();
const ipexSubmitAdmitMock = jest.fn();
const createExchangeMessageMock = jest.fn();
const getMemberMock = jest.fn();

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
    admit: ipexAdmitMock,
    submitAdmit: ipexSubmitAdmitMock,
  }),
  credentials: () => ({
    list: jest.fn(),
  }),
  exchanges: () => ({
    get: getExchangesMock,
    send: sendExchangesMock,
    createExchangeMessage: createExchangeMessageMock,
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: queryKeyStateMock,
    get: queryKeyStateGetMock,
  }),

  groups: () => ({ getRequest: groupGetRequestMock }),
  manager: {
    get: getMemberMock,
  },
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
  // notificationStorage as any,
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
        rotateIdentifier: () => jest.fn(),
        updateIdentifier: jest.fn(),
      },
      keriaNotifications: {
        addPendingOperationToQueue: jest.fn(),
        markNotification: (id: string) => markNotificationMock(id),
        deleteNotificationRecordById: (id: string) =>
          deleteNotificationMock(id),
      },
      getKeriaOnlineStatus: jest.fn(),
    },
  },
}));

const now = new Date();
const nowISO = now.toISOString();
const creatorIdentifier = "creatorIdentifier";
const multisigIdentifier = "newMultisigIdentifierAid";

beforeEach(async () => {
  jest.resetAllMocks();
  await new ConfigurationService().start();
});

describe("Oobi/endrole", () => {
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

    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    mockResolveOobi.mockResolvedValue(mockResolvedValue);

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
});

describe("Rotation of multi-sig", () => {
  test("can rotate multisig with KERI multisig do not have manageAid and throw error", async () => {
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

  test("Can rotate multisig with KERI multisig have members do not rotate it AID first and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const signifyName = "newUuidHere";
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(mockMultisigIdentifier);
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
    identifierStorage.getAllIdentifierMetadata = jest
      .fn()
      .mockResolvedValue([mockMultisigIdentifier]);
    identifiersMemberMock = jest.fn().mockResolvedValue(multisigMockMembers);
    expect(
      multiSigService.rotateMultisig(mockMultisigIdentifier.id)
    ).rejects.toThrowError(MultiSigService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG);
  });

  test("Can rotate a keri multisig with KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
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

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(mockMultisigIdentifier);
    identifiersMemberMock = jest.fn().mockResolvedValue(multisigMockMembers);
    expect(
      await multiSigService.rotateMultisig(mockMultisigIdentifier.id)
    ).toBe(multisigIdentifier);
  });

  test("Cannot join the multisig rotation with no notification and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([]);
    expect(
      multiSigService.joinMultisigRotation(mockNotification)
    ).rejects.toThrowError(MultiSigService.EXN_MESSAGE_NOT_FOUND);
  });

  test("Cannot rotate local member with AID is not multisig and throw error", async () => {
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...mockMultisigIdentifier,
      multisigManageAid: undefined,
    });

    expect(multiSigService.rotateLocalMember("123456")).rejects.toThrowError(
      MultiSigService.AID_IS_NOT_MULTI_SIG
    );
  });

  test("Can rotate local member of multisig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(mockMultisigIdentifier);
    Agent.agent.identifiers.rotateIdentifier = identifiersRotateMock;
    await multiSigService.rotateLocalMember(mockMultisigIdentifier.id);

    expect(identifiersRotateMock).toHaveBeenCalledWith(
      mockMultisigIdentifier.multisigManageAid
    );
  });

  test("Cannot join the multisig rotation with AID is not multisig and throw error", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...mockMultisigIdentifier,
      multisigManageAid: undefined,
    });
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValue(mockNotification);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);

    expect(
      multiSigService.joinMultisigRotation(mockNotification)
    ).rejects.toThrowError(MultiSigService.AID_IS_NOT_MULTI_SIG);
  });

  test("Can join the multisig rotation", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(mockMultisigIdentifier);
    notificationStorage.findById = jest
      .fn()
      .mockResolvedValue(mockNotification);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
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

    identifiersGetMock.mockResolvedValue({
      state: {
        i: mockMultisigIdentifier.multisigManageAid,
      },
    });
    expect(await multiSigService.joinMultisigRotation(mockNotification)).toBe(
      multisigIdentifier
    );
  });

  test("Should throw error if we don't control any member of the multisig", async () => {
    identifiersMemberMock.mockResolvedValue(multisigMockMembers);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    identifiersGetMock.mockResolvedValueOnce(aidMultisigBySignify);
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
    identifiersGetMock.mockResolvedValueOnce(aidMultisigBySignify);
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await multiSigService.endRoleAuthorization("multi-sig");
    expect(sendExchangesMock).toBeCalledTimes(
      multisigMockMembers["signing"].length
    );
  });

  test("Can join end role authorization", async () => {
    identifiersMemberMock.mockResolvedValue(multisigMockMembers);
    const mockRequestExn = {
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
    };
    groupGetRequestMock.mockResolvedValue([
      {
        exn: {
          ...mockRequestExn,
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
    identifiersGetMock.mockResolvedValueOnce(aidMultisigBySignify);
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await multiSigService.joinAuthorization(mockRequestExn);
    expect(sendExchangesMock).toBeCalledTimes(1);
  });
});
describe("Usage of multi-sig", () => {
  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([multisigMockMemberMetadata]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(mockConnectionShortDetail);
    Agent.agent.connections.getMultisigLinkedContacts = jest
      .fn()
      .mockResolvedValue([]);
    const result = await multiSigService.getMultisigIcpDetails(
      "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
    );

    expect(result.ourIdentifier.id).toBe(multisigMockMemberMetadata.id);
    expect(result.sender.id).toBe(mockConnectionShortDetail.id);
    expect(result.otherConnections.length).toBe(0);
    expect(result.threshold).toBe(2);
  });

  test("Throw error if the Multi-sig join request contains unknown AIDs", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([multisigMockMemberMetadata]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(mockConnectionShortDetail);
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
        "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
      )
    ).rejects.toThrowError(MultiSigService.UNKNOWN_AIDS_IN_MULTISIG_ICP);
  });

  test("Can get multisig icp details of 3 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        ...mockGetRequest,
        exn: {
          ...mockGetRequest.exn,
          a: {
            ...mockGetRequest.exn.a,
            smids: [
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO",
              "EKlUo3CAqjPfFt0Wr2vvSc7MqT9WiL2EGadRsAP3V1IJ",
            ],
          },
          e: { icp: { kt: 3 } },
        },
      },
    ]);
    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([multisigMockMemberMetadata]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(mockConnectionShortDetail);
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
      "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
    );
    expect(result.ourIdentifier.id).toBe(multisigMockMemberMetadata.id);
    expect(result.sender.id).toBe(mockConnectionShortDetail.id);
    expect(result.otherConnections.length).toBe(1);
    expect(result.otherConnections[0].id).toBe(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
    expect(result.threshold).toBe(3);
  });

  test("Throw error if cannot query the key state of an identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifiersGetMock = jest.fn().mockResolvedValue(aidMultisigBySignify);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);

    identifiersMemberMock = jest.fn().mockResolvedValue(multisigMockMembers);

    queryKeyStateMock.mockImplementation(() => {
      return {
        name: "query.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
        metadata: {
          sn: "1",
        },
        done: false,
        error: null,
        response: null,
      };
    });

    expect(
      multiSigService.membersReadyToRotate("multiSigId")
    ).rejects.toThrowError(MultiSigService.CANNOT_GET_KEYSTATE_OF_IDENTIFIER);
  });

  test("Should return member identifiers that have rotated ahead of multisig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifiersGetMock = jest.fn().mockResolvedValue(aidMultisigBySignify);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);

    identifiersMemberMock = jest.fn().mockResolvedValue(multisigMockMembers);

    const rotatedMemberAid = "EJwDuZ8YpU-1g6QVwioZG-PmyufLXaDHXvfFLWkqENeL";
    queryKeyStateMock.mockImplementation((id: string) => {
      if (id === "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF") {
        return {
          name: "query.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
          metadata: {
            sn: "1",
          },
          done: true,
          error: null,
          response: {
            vn: [1, 0],
            i: "EJwDuZ8YpU-1g6QVwioZG-PmyufLXaDHXvfFLWkqENeL",
            s: "0",
            p: "",
            d: "EJwDuZ8YpU-1g6QVwioZG-PmyufLXaDHXvfFLWkqENeL",
            f: "0",
            dt: "2024-07-23T08:58:23.530757+00:00",
            et: "icp",
            kt: "1",
            k: ["DI3bh31vfuGyV14LvtBxHHljnDnSqbKQ7DZ9iiB_51Oh"],
            nt: "1",
            n: ["EEhLvnvKE4eTV17ts4ngXOmri7gJA9Gs0593MCAMQjTu"],
            bt: "0",
            b: [],
            c: [],
            ee: {
              s: "0",
              d: "EJwDuZ8YpU-1g6QVwioZG-PmyufLXaDHXvfFLWkqENeL",
              br: [],
              ba: [],
            },
            di: "",
          },
        };
      }
      return {
        name: "query.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
        metadata: {
          sn: "1",
        },
        done: true,
        error: null,
        response: {
          vn: [1, 0],
          i: rotatedMemberAid,
          s: "1",
          p: rotatedMemberAid,
          d: "ELxPbNybLoBLM0EPmI9oHb6Yp40UcT-lN1JAST3sD3b9",
          f: "0",
          dt: "2024-07-23T08:59:16.747281+00:00",
          et: "rot",
          kt: "1",
          k: ["DIH7-xjcUC-xPS9I32b0ftZAT6gHJvfHiBR4UwxtWuEO"],
          nt: "1",
          n: ["EKIctKY0IGPbd7njANV6P-ANncFr1kRUZgKGGzCfzNnG"],
          bt: "0",
          b: [],
          c: [],
          ee: {
            s: "0",
            d: "EGvWn-Zv7DXa8-Te6nTBb2vWUOsDQHPdaKshNUMjJssB",
            br: [],
            ba: [],
          },
          di: "",
        },
      };
    });

    expect(
      await multiSigService.membersReadyToRotate("multiSigId")
    ).toMatchObject([rotatedMemberAid]);
  });

  test("Throw error if we do not control any member AID of the multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([
        { ...multisigMockMemberMetadata, groupMetadata: undefined },
      ]);
    jest
      .spyOn(Agent.agent.connections, "getConnectionShortDetailById")
      .mockResolvedValue(mockConnectionShortDetail);
    await expect(
      multiSigService.getMultisigIcpDetails(
        "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
      )
    ).rejects.toThrowError(MultiSigService.MEMBER_AID_NOT_FOUND);
  });

  test("Cannot get multi-sig details from an unknown sender (missing metadata)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    // @TODO - foconnor: This is not ideal as our identifier service is getting tightly coupled with the connection service.
    // Re-work this later.
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockImplementation(() => {
        throw new Error("Some error from connection service");
      });
    await expect(
      multiSigService.getMultisigIcpDetails(
        "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
      )
    ).rejects.toThrowError("Some error from connection service");
  });

  test("Cannot get multi-sig details from a notification with no matching exn message", async () => {
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
});
describe("Creation of multi-sig", () => {
  test("Can create a keri multisig with KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifiersGetMock.mockResolvedValue(aidReturnedBySignify);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    mockResolveOobi.mockResolvedValue(mockResolvedValue);

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

  test("Cannot create a keri multisig if the threshold is invalid", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
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
    const signifyName = "newUuidHere";
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    mockResolveOobi = jest.fn().mockResolvedValue(mockResolvedValue);
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

  test("Can join the multisig inception", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);

    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([multisigMockMemberMetadata]);
    queryKeyStateGetMock = jest.fn().mockResolvedValue([mockResolvedValue]);
    notificationStorage.deleteById = jest.fn().mockResolvedValue("id");
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
      await multiSigService.joinMultisig(
        "id",
        NotificationRoute.MultiSigIcp,
        "d",
        {
          theme: 0,
          displayName: "Multisig",
        }
      )
    ).toEqual({
      identifier: multisigIdentifier,
      isPending: true,
      signifyName: expect.any(String),
      multisigManageAid: "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO",
    });

    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({ id: multisigIdentifier, isPending: true })
    );

    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      multisigMockMemberMetadata.id,
      multisigMockMemberMetadata
    );

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
      signing: [multisigMockMembers.signing[0]],
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(keriMetadataRecord);
    await multiSigService.joinMultisig(
      "id",
      NotificationRoute.MultiSigIcp,
      "d",
      {
        theme: 0,
        displayName: "Multisig",
      }
    );
    expect(addEndRoleMock).toBeCalledTimes(1);
  });

  test("Cannot join multisig by notification if exn messages are missing", async () => {
    groupGetRequestMock = jest
      .fn()
      .mockRejectedValue(new Error("request - 404 - SignifyClient message"));
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    await expect(
      multiSigService.joinMultisig("id", NotificationRoute.MultiSigIcp, "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(`${MultiSigService.EXN_MESSAGE_NOT_FOUND} d`);
  });

  test("Cannot join the multisig if cannot get key states for multisig member", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    identifiersGetMock = jest.fn().mockResolvedValue(aidReturnedBySignify);
    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([multisigMockMemberMetadata]);
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
      multiSigService.joinMultisig("id", NotificationRoute.MultiSigIcp, "d", {
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
      multiSigService.joinMultisig("id", NotificationRoute.MultiSigIcp, "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(
      MultiSigService.CANNOT_GET_KEYSTATES_FOR_MULTISIG_MEMBER
    );
  });

  test("Cannot join multisig if there's no identifier matched", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([mockGetRequest]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([mockMultisigIdentifier]);
    await expect(
      multiSigService.joinMultisig("id", NotificationRoute.MultiSigIcp, "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(MultiSigService.MEMBER_AID_NOT_FOUND);
  });

  test("Should throw errors when create KERI multisigs with invalid identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...multisigMockMemberMetadata,
      groupMetadata: undefined,
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
    // Identifier doesn't have groupMetadata
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(MultiSigService.MISSING_GROUP_METADATA);

    // Identifier's group is already created
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...multisigMockMemberMetadata,
      groupMetadata: {
        groupId: "123",
        groupCreated: true,
        groupInitiator: true,
      },
    });
    await expect(
      multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).rejects.toThrowError(MultiSigService.GROUP_ALREADY_EXISTs);

    // Identifier's not groupInitiator
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...multisigMockMemberMetadata,
      groupMetadata: {
        groupId: "123",
        groupCreated: false,
        groupInitiator: false,
      },
    });
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
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...multisigMockMemberMetadata,
      groupMetadata: {
        groupCreated: false,
        groupInitiator: true,
        groupId: "not-group-id",
      },
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
      multiSigService.joinMultisigRotation(mockNotification)
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      multiSigService.getMultisigIcpDetails("d")
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
    await expect(
      multiSigService.joinMultisig("id", NotificationRoute.MultiSigIcp, "d", {
        theme: 0,
        displayName: "Multisig",
      })
    ).rejects.toThrowError(Agent.KERIA_CONNECTION_BROKEN);
  });

  test("Can initiate accepting an ACDC to a multi-sig identifier", async () => {
    const multisigSignifyName = "multisigSignifyName";
    const notificationSaid = "ELykd_2bX6yvuVEgLQqnCgZ7QLdxpUBze-RzHVwfCUfW";
    const schemaSaids = ["schemaSaid"];
    const mockAdmit = {
      kind: "JSON",
      raw: "{\"v\":\"KERI10JSON000111_\",\"t\":\"exn\",\"d\":\"EKlXGS9FrnHFWvo1HB2KsyXbXDRVts42nKg7qmzKas0j\",\"i\":\"EFKiC-cDUpBauOHMLRRKGaDBZue2FCqTrJJU8nn8qv_A\",\"p\":\"EGBtDLn59jI97a_Y0Poztc4wM3SZdTyjW8gRcBiMNuEy\",\"dt\":\"2024-08-02T02:47:15.250000+00:00\",\"r\":\"/ipex/admit\",\"q\":{},\"a\":{\"m\":\"\"},\"e\":{}}",
      ked: {
        v: "KERI10JSON000111_",
        t: "exn",
        d: "EKlXGS9FrnHFWvo1HB2KsyXbXDRVts42nKg7qmzKas0j",
        i: "EFKiC-cDUpBauOHMLRRKGaDBZue2FCqTrJJU8nn8qv_A",
        p: "EGBtDLn59jI97a_Y0Poztc4wM3SZdTyjW8gRcBiMNuEy",
        dt: "2024-08-02T02:47:15.250000+00:00",
        r: "/ipex/admit",
        q: {},
        a: { m: "" },
        e: {},
      },
      size: 273,
    };
    const mockSigs = [
      "AAAWesHyXn8p_ZeQYxD52OXhYkZiDNNmNBq8Bat_n7wk0KZ1LXKpfpeOd9s3A2huVibe1J18AgI-NOH9lfnvEOAM",
    ];
    const mockEnd = "";

    mockResolveOobi.mockResolvedValueOnce(mockResolvedValue);

    getExchangesMock.mockResolvedValueOnce(mockGetRequest);
    identifiersMemberMock = jest
      .fn()
      .mockResolvedValueOnce(multisigMockMembers);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValueOnce(keriMetadataRecord);
    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);
    ipexAdmitMock.mockResolvedValue([mockAdmit, mockSigs, mockEnd]);
    createExchangeMessageMock.mockResolvedValue([
      mockExn,
      mockSigsMes,
      mockDtime,
    ]);

    await multiSigService.multisigAdmit(
      multisigSignifyName,
      notificationSaid,
      schemaSaids
    );
    expect(ipexAdmitMock).toBeCalledTimes(1);
    expect(createExchangeMessageMock).toBeCalledTimes(1);
    expect(ipexSubmitAdmitMock).toBeCalledTimes(1);
  });

  test("Can agree to admit a credential with a multi-sig identifier", async () => {
    const multisigSignifyName = "multisigSignifyName";
    const notificationSaid = "ELykd_2bX6yvuVEgLQqnCgZ7QLdxpUBze-RzHVwfCUfW";
    const schemaSaids = ["schemaSaid"];
    const multisigExn = {
      v: "KERI10JSON000111_",
      t: "exn",
      d: "EO6rXPzJVLNEOjs3puI5Kn4L2UsiB-iJJJKpXi26F73X",
      i: "EHQDKkV40qP65N8yHaOJFlVS1CUvsYTvGlHPfcy2tFUb",
      p: "EKWG4i9hT8vjwRPHsW7vqWrPq0utZHVgdu24fAf0j2Cb",
      dt: "2024-08-02T07:06:24.884000+00:00",
      r: "/ipex/admit",
      q: {},
      a: { m: "" },
      e: {},
    };

    const ked = {
      v: "KERI10JSON000111_",
      t: "exn",
      d: "EKm404jyX0iquIOu0BtZ6xR04opEQYoClKeSTuuS4fwn",
      i: "EL3BEUfwxS1_mCWqKUrH5nGPkikoiHskhVhGenV2lcAZ",
      p: "EBXi4JFZqjsKMzaMAz-gJWxJj992R988JcdN8EfzL4Po",
      dt: "2024-08-02T07:11:59.510000+00:00",
      r: "/ipex/admit",
      q: {},
      a: { m: "" },
      e: {},
    };
    const admit = new Serder(ked);
    const atc =
      "-FABEFr4DyYerYKgdUq3Nw5wbq7OjEZT6cn45omHCiIZ0elD0AAAAAAAAAAAAAAAAAAAAAAAEMoyFLuJpu0B79yPM7QKFE_R_D4CTq7H7GLsKxIpukXX-AABABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB";

    const mockSaider = [{} as Saider, ked] as [Saider, Dict<any>];

    mockResolveOobi.mockResolvedValueOnce({
      name: "oobi.AM3es3rJ201QzbzYuclUipYzgzysegLeQsjRqykNrmwC",
      metadata: {
        oobi: "testOobi",
      },
      done: true,
      error: null,
      response: {},
      alias: "c5dd639c-d875-4f9f-97e5-ed5c5fdbbeb1",
    });
    const exchangeMock = {
      exn: {
        i: "ELWFo-DV4GujnvcwwIbzTzjc-nIf0ijv6W1ecajvQYBY",
        d: "EO65SZOen5Qm26gYeAZZ_J_p8_Uy_6jB3cUpv0DzgDA4",
      },
    };
    getExchangesMock.mockResolvedValueOnce(exchangeMock);
    identifiersMemberMock = jest.fn().mockResolvedValueOnce({
      signing: [
        { ends: { agent: { [keriMetadataRecord.id]: "" } }, aid: "aid" },
      ],
    });
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValueOnce(
      new IdentifierMetadataRecord({
        id: "aidHere",
        displayName: "Identifier 2",
        signifyName: "uuid-here",
        createdAt: now,
        theme: 0,
        groupMetadata: {
          groupId: "group-id",
          groupInitiator: true,
          groupCreated: true,
        },
      })
    );
    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);

    jest.spyOn(Saider, "saidify").mockReturnValueOnce(mockSaider);
    getMemberMock.mockResolvedValue({
      sign: () => [
        "ABDEouKAUhCDedOkqA5oxlMO4OB1C8p5M4G-_DLJWPf-ZjegTK-OxN4s6veE_7hXXuFzX4boq6evbLs5vFiVl-MB",
      ],
    });
    createExchangeMessageMock.mockResolvedValue([
      mockExn,
      mockSigsMes,
      mockDtime,
    ]);

    await multiSigService.multisigAdmit(
      multisigSignifyName,
      notificationSaid,
      schemaSaids,
      multisigExn
    );

    expect(ipexAdmitMock).toBeCalledTimes(0);
    expect(createExchangeMessageMock).toBeCalledWith(
      mHab,
      "/multisig/exn",
      {
        gid: gHab["prefix"],
      },
      {
        exn: [admit, atc],
      },
      "aid"
    );

    expect(ipexSubmitAdmitMock).toBeCalledWith(
      multisigSignifyName,
      mockExn,
      mockSigsMes,
      mockDtime,
      ["aid"]
    );
  });
});
