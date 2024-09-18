import { Dict, Saider, Serder } from "signify-ts";
import { IdentifierMetadataRecord } from "../records/identifierMetadataRecord";
import { ConnectionStatus, NotificationRoute } from "../agent.types";
import { Agent } from "../agent";
import { EventService } from "./eventService";
import { MultiSigService } from "./multiSigService";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import {
  getMultisigIdentifierResponse,
  getMemberIdentifierResponse,
  gHab,
  memberMetadataRecord,
  mHab,
  initiatorConnectionShortDetails,
  multisigExnIpexGrantEnd,
  multisigExnIpexGrantSerder,
  multisigMetadataRecord,
  resolvedOobiOpResponse,
  multisigExnIpexGrantSig,
  memberIdentifierRecord,
  getMultisigMembersResponse,
  memberKeyStateIcp,
  memberKeyStateRot,
  mockGetRequestMultisigIcp,
  mockGetExchangeGrantMessage,
  mockNotificationMultisigExnRotation,
  memberMetadataRecordProps,
} from "../../__fixtures__/agent/multiSigMock";

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
  operationPendingStorage as any
);

const mockResolveOobi = jest.fn();
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
  test("Should call endRoleAuthorization when the multisig creation operation is done", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifiersMemberMock = jest.fn().mockResolvedValue({
      signing: [{ ends: { agent: { [memberMetadataRecord.id]: "" } } }],
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });

    identifiersGetMock.mockResolvedValue(getMemberIdentifierResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(memberMetadataRecord);
    mockResolveOobi.mockResolvedValue(resolvedOobiOpResponse);

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
    (memberMetadataRecord.groupMetadata as any).groupCreated = false;
  });

  test("Can add end role authorization", async () => {
    identifiersMemberMock.mockResolvedValue(getMultisigMembersResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(memberIdentifierRecord);
    identifiersGetMock.mockResolvedValueOnce(getMultisigIdentifierResponse);
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await multiSigService.endRoleAuthorization("prefix");
    expect(sendExchangesMock).toBeCalledTimes(
      getMultisigMembersResponse["signing"].length
    );
  });

  test("Can join end role authorization", async () => {
    identifiersMemberMock.mockResolvedValue(getMultisigMembersResponse);
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
      .mockResolvedValue(memberIdentifierRecord);
    identifiersGetMock.mockResolvedValueOnce(getMultisigIdentifierResponse);
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await multiSigService.joinAuthorization(mockRequestExn);
    expect(sendExchangesMock).toBeCalledTimes(1);
  });
});

describe("Rotation of multi-sig", () => {
  test("Cannot rotate an identifier that is not multi-sig", async () => {
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

  test("Cannot rotate a multisig if we cannot retrieve updated member identifier states", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const signifyName = "newUuidHere";
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMemberIdentifierResponse);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });

    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(multisigMetadataRecord);
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
      .mockResolvedValue([multisigMetadataRecord]);
    identifiersMemberMock = jest
      .fn()
      .mockResolvedValue(getMultisigMembersResponse);
    expect(
      multiSigService.rotateMultisig(multisigMetadataRecord.id)
    ).rejects.toThrowError(MultiSigService.NOT_FOUND_ALL_MEMBER_OF_MULTISIG);
  });

  test("Can rotate a keri multisig with KERI contacts", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    const signifyName = "newUuidHere";
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMemberIdentifierResponse);
    identifiersCreateMock = jest.fn().mockResolvedValue({
      identifier: multisigIdentifier,
      signifyName,
    });
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(memberMetadataRecord);
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
      .mockResolvedValue(multisigMetadataRecord);
    identifiersMemberMock = jest
      .fn()
      .mockResolvedValue(getMultisigMembersResponse);
    expect(
      await multiSigService.rotateMultisig(multisigMetadataRecord.id)
    ).toBe(multisigIdentifier);
  });

  test("Cannot join a multisig rotation if the rotation exn cannot be found on KERIA", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([]);
    expect(
      multiSigService.joinMultisigRotation(mockNotificationMultisigExnRotation)
    ).rejects.toThrowError(MultiSigService.EXN_MESSAGE_NOT_FOUND);
  });

  test("Cannot rotate local member with AID is not multisig and throw error", async () => {
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...multisigMetadataRecord,
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
      .mockResolvedValue(multisigMetadataRecord);
    Agent.agent.identifiers.rotateIdentifier = identifiersRotateMock;
    await multiSigService.rotateLocalMember(multisigMetadataRecord.id);

    expect(identifiersRotateMock).toHaveBeenCalledWith(
      multisigMetadataRecord.multisigManageAid
    );
  });

  test("Cannot try to rotate member identifier relating to non multisig identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...multisigMetadataRecord,
      multisigManageAid: undefined,
    });
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);

    expect(
      multiSigService.joinMultisigRotation(mockNotificationMultisigExnRotation)
    ).rejects.toThrowError(MultiSigService.AID_IS_NOT_MULTI_SIG);
  });

  test("Cannot join multisig rotation if we do not control any member of the identifier", async () => {
    identifiersMemberMock.mockResolvedValue(getMultisigMembersResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(undefined);
    identifiersGetMock.mockResolvedValueOnce(getMultisigIdentifierResponse);
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    await expect(
      multiSigService.endRoleAuthorization("prefix")
    ).rejects.toThrow(new Error(MultiSigService.MEMBER_AID_NOT_FOUND));
  });

  test("Cannot get key state of member identifier while checking if ready to rotate", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMultisigIdentifierResponse);

    identifiersMemberMock = jest
      .fn()
      .mockResolvedValue(getMultisigMembersResponse);

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
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMultisigIdentifierResponse);

    identifiersMemberMock = jest
      .fn()
      .mockResolvedValue(getMultisigMembersResponse);

    const rotatedMemberAid = "EJwDuZ8YpU-1g6QVwioZG-PmyufLXaDHXvfFLWkqENeL";
    queryKeyStateMock.mockImplementation((id: string) => {
      if (id === "ELmrDKf0Yq54Yq7cyrHwHZlA4lBB8ZVX9c8Ea3h2VJFF") {
        return memberKeyStateIcp;
      }
      return memberKeyStateRot;
    });

    expect(
      await multiSigService.membersReadyToRotate("multiSigId")
    ).toMatchObject([rotatedMemberAid]);
  });
});

describe("Usage of multi-sig", () => {
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

  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([memberIdentifierRecord]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(initiatorConnectionShortDetails);
    Agent.agent.connections.getMultisigLinkedContacts = jest
      .fn()
      .mockResolvedValue([]);
    const result = await multiSigService.getMultisigIcpDetails(
      "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
    );

    expect(result.ourIdentifier.id).toBe(memberIdentifierRecord.id);
    expect(result.sender.id).toBe(initiatorConnectionShortDetails.id);
    expect(result.otherConnections.length).toBe(0);
    expect(result.threshold).toBe(2);
  });

  test("Can get multisig icp details of 3 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([
      {
        ...mockGetRequestMultisigIcp,
        exn: {
          ...mockGetRequestMultisigIcp.exn,
          a: {
            ...mockGetRequestMultisigIcp.exn.a,
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
    mockGetIdentifiers = jest.fn().mockResolvedValue([memberIdentifierRecord]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(initiatorConnectionShortDetails);
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
    expect(result.ourIdentifier.id).toBe(memberIdentifierRecord.id);
    expect(result.sender.id).toBe(initiatorConnectionShortDetails.id);
    expect(result.otherConnections.length).toBe(1);
    expect(result.otherConnections[0].id).toBe(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
    expect(result.threshold).toBe(3);
  });
});

describe("Creation of multi-sig", () => {
  test("Can create a multisig identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifiersGetMock.mockResolvedValue(getMemberIdentifierResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(memberMetadataRecord);
    mockResolveOobi.mockResolvedValue(resolvedOobiOpResponse);

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

    (memberMetadataRecord.groupMetadata as any).groupCreated = false;
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

    (memberMetadataRecord.groupMetadata as any).groupCreated = false;
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

    (memberMetadataRecord.groupMetadata as any).groupCreated = false;
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

  test("Can join the multisig inception", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMemberIdentifierResponse);

    mockGetIdentifiers = jest.fn().mockResolvedValue([memberIdentifierRecord]);
    queryKeyStateGetMock = jest
      .fn()
      .mockResolvedValue([resolvedOobiOpResponse]);
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
      memberIdentifierRecord.id,
      memberIdentifierRecord
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
      signing: [getMultisigMembersResponse.signing[0]],
    });
    addEndRoleMock.mockResolvedValue({
      op: jest.fn(),
      serder: { size: 1 },
      sigs: [],
    });
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValueOnce({
      ...memberMetadataRecordProps,
      groupMetadata: {
        ...memberMetadataRecordProps.groupMetadata,
        groupCreated: true,
      },
    });
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
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMemberIdentifierResponse);
    mockGetIdentifiers = jest.fn().mockResolvedValue([memberIdentifierRecord]);
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
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([multisigMetadataRecord]);
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
      ...memberIdentifierRecord,
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
      ...memberIdentifierRecord,
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
      ...memberIdentifierRecord,
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

  test("Cannot create multisig identifier with connections that are not linked to the group ID", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...memberIdentifierRecord,
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
      multiSigService.joinMultisigRotation(mockNotificationMultisigExnRotation)
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
    const multisigId = "multisigId";
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

    mockResolveOobi.mockResolvedValueOnce(resolvedOobiOpResponse);

    getExchangesMock.mockResolvedValueOnce(mockGetExchangeGrantMessage);
    identifiersMemberMock = jest
      .fn()
      .mockResolvedValueOnce(getMultisigMembersResponse);
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      ...memberIdentifierRecord,
      groupMetadata: {
        ...memberMetadataRecordProps.groupMetadata,
        groupCreated: true,
      },
    });
    identifiersGetMock = jest
      .fn()
      .mockResolvedValueOnce(gHab)
      .mockResolvedValueOnce(mHab);
    ipexAdmitMock.mockResolvedValue([mockAdmit, mockSigs, mockEnd]);
    createExchangeMessageMock.mockResolvedValue([
      multisigExnIpexGrantSerder,
      multisigExnIpexGrantSig,
      multisigExnIpexGrantEnd,
    ]);

    await multiSigService.multisigAdmit(
      multisigId,
      notificationSaid,
      schemaSaids
    );
    expect(ipexAdmitMock).toBeCalledTimes(1);
    expect(createExchangeMessageMock).toBeCalledTimes(1);
    expect(ipexSubmitAdmitMock).toBeCalledTimes(1);
  });

  test("Can agree to admit a credential with a multi-sig identifier", async () => {
    const multisigId = gHab.name;
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
        { ends: { agent: { [memberMetadataRecord.id]: "" } }, aid: "aid" },
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
      multisigExnIpexGrantSerder,
      multisigExnIpexGrantSig,
      multisigExnIpexGrantEnd,
    ]);

    await multiSigService.multisigAdmit(
      multisigId,
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
      multisigId,
      multisigExnIpexGrantSerder,
      multisigExnIpexGrantSig,
      multisigExnIpexGrantEnd,
      ["aid"]
    );
  });

  test("Throw error if the Multi-sig join request contains unknown AIDs", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
    mockGetIdentifiers = jest.fn().mockResolvedValue([memberIdentifierRecord]);
    Agent.agent.connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(initiatorConnectionShortDetails);
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

  test("Throw error if we do not control any member AID of the multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
    mockGetIdentifiers = jest
      .fn()
      .mockResolvedValue([
        { ...memberIdentifierRecord, groupMetadata: undefined },
      ]);
    jest
      .spyOn(Agent.agent.connections, "getConnectionShortDetailById")
      .mockResolvedValue(initiatorConnectionShortDetails);
    await expect(
      multiSigService.getMultisigIcpDetails(
        "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
      )
    ).rejects.toThrowError(MultiSigService.MEMBER_AID_NOT_FOUND);
  });

  test("Cannot get multi-sig details from an unknown sender (missing metadata)", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest
      .fn()
      .mockResolvedValue([mockGetRequestMultisigIcp]);
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
});
