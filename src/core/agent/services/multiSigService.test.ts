import { ConnectionStatus, NotificationRoute } from "../agent.types";
import { Agent } from "../agent";
import { CoreEventEmitter } from "../event";
import { MultiSigService } from "./multiSigService";
import { IdentifierStorage } from "../records";
import { ConfigurationService } from "../../configuration";
import {
  getMultisigIdentifierResponse,
  getMemberIdentifierResponse,
  memberMetadataRecord,
  initiatorConnectionShortDetails,
  multisigMetadataRecord,
  resolvedOobiOpResponse,
  memberIdentifierRecord,
  getMultisigMembersResponse,
  getRequestMultisigIcp,
  memberMetadataRecordProps,
} from "../../__fixtures__/agent/multSigFixtures";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { EventTypes } from "../event.types";

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
const identifiersCreateMock = jest.fn();
let identifiersMemberMock = jest.fn();
const identifiersInteractMock = jest.fn();
const identifiersRotateMock = jest.fn();

const oobiResolveMock = jest.fn();
let groupGetRequestMock = jest.fn();
let queryKeyStateGetMock = jest.fn();
const addEndRoleMock = jest.fn();
const sendExchangesMock = jest.fn();
const getExchangesMock = jest.fn();
const markNotificationMock = jest.fn();
const ipexAdmitMock = jest.fn();
const ipexSubmitAdmitMock = jest.fn();
const createExchangeMessageMock = jest.fn();
const getMemberMock = jest.fn();
const ipexOfferMock = jest.fn();
const ipexSubmitOfferMock = jest.fn();
const ipexGrantMock = jest.fn();
const ipexSubmitGrantMock = jest.fn();

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
    offer: ipexOfferMock,
    submitOffer: ipexSubmitOfferMock,
    grant: ipexGrantMock,
    submitGrant: ipexSubmitGrantMock,
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
    query: jest.fn(),
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

const saveOperationPendingMock = jest.fn();
const operationPendingStorage = jest.mocked({
  save: saveOperationPendingMock,
});

const eventEmitter = new CoreEventEmitter();
const agentServicesProps = {
  signifyClient: signifyClient as any,
  eventEmitter,
};

const connections = jest.mocked({
  resolveOobi: jest.fn(),
  getConnectionShortDetailById: jest.fn(),
  getMultisigLinkedContacts: jest.fn(),
});

const identifiers = jest.mocked({
  getIdentifiers: jest.fn(),
  rotateIdentifier: jest.fn(),
});

const multiSigService = new MultiSigService(
  agentServicesProps,
  identifierStorage as any,
  operationPendingStorage as any,
  notificationStorage as any,
  connections as any,
  identifiers as any
);

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
    connections.resolveOobi.mockResolvedValue(resolvedOobiOpResponse);

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
        createdAtUTC: new Date().toISOString(),
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

    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      {
        id: "newMultisigIdentifierAid",
        displayName: "Identifier 2",
        theme: 0,
        isPending: false,
        multisigManageAid: "creatorIdentifier",
        createdAt: new Date("2024-08-09T07:23:52.839894+00:00")
      }
    )
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

describe("Usage of multi-sig", () => {
  test("Should return true if there is a multisig with the provided multisigId", async () => {
    const multisigId = "multisig-id";
    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValue({
      id: multisigId,
      displayName: "Multisig",
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

  test("Can get participants with a multi-sig identifier", async () => {
    identifiersMemberMock = jest
      .fn()
      .mockResolvedValue(getMultisigMembersResponse);

    identifierStorage.getIdentifierMetadata = jest.fn().mockResolvedValueOnce({
      ...memberMetadataRecordProps,
      groupMetadata: {
        ...memberMetadataRecordProps.groupMetadata,
        groupCreated: true,
      },
    });

    await multiSigService.getMultisigParticipants("id");

    expect(identifierStorage.getIdentifierMetadata).toBeCalledWith(
      getMultisigMembersResponse.signing[0].aid
    );
  });

  test("Can not get participants with a multi-sig identifier if not exist our identifier", async () => {
    identifiersMemberMock = jest
      .fn()
      .mockResolvedValue(getMultisigMembersResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(memberMetadataRecord);

    await expect(
      multiSigService.getMultisigParticipants("id")
    ).rejects.toThrowError(MultiSigService.MEMBER_AID_NOT_FOUND);
  });
});

describe("Creation of multi-sig", () => {
  test("Can create a multisig identifier", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    identifiersGetMock.mockResolvedValue(getMemberIdentifierResponse);
    identifierStorage.getIdentifierMetadata = jest
      .fn()
      .mockResolvedValue(memberMetadataRecord);
    connections.resolveOobi.mockResolvedValue(resolvedOobiOpResponse);

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
        createdAtUTC: new Date().toISOString(),
        groupId: "group-id",
      },
    ];
    eventEmitter.emit = jest.fn();
    saveOperationPendingMock.mockResolvedValueOnce({
      id: `group.${multisigIdentifier}`,
      recordType: OperationPendingRecordType.Group,
    });

    expect(
      await multiSigService.createMultisig(
        creatorIdentifier,
        otherIdentifiers,
        otherIdentifiers.length + 1
      )
    ).toEqual({
      identifier: multisigIdentifier,
      isPending: true,
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({ 
        id: multisigIdentifier,
        displayName: "Identifier 2",
        theme: 0,
        isPending: true,
        multisigManageAid: "creatorIdentifier",
        createdAt: new Date("2024-08-09T07:23:52.839Z") 
      })
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: `group.${multisigIdentifier}`,
          recordType: OperationPendingRecordType.Group,
        },
      },
    });

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
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}1`,
        displayName: "Identifier 2",
        theme: 0,
        isPending: true,
        multisigManageAid: "creatorIdentifier",
        createdAt: new Date("2024-08-09T07:23:52.839Z")
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
    });
    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({
        id: `${multisigIdentifier}2`,
        displayName: "Identifier 2",
        theme: 0,
        isPending: true,
        multisigManageAid: "creatorIdentifier",
        createdAt: new Date("2024-08-09T07:23:52.839Z")
      })
    );

    (memberMetadataRecord.groupMetadata as any).groupCreated = false;
    const invalidOtherIdentifiers = [
      {
        id: "ENsj-3icUgAutHtrUHYnUPnP8RiafT5tOdVIZarFHuyP",
        label: "f4732f8a-1967-454a-8865-2bbf2377c26e",
        status: ConnectionStatus.CONFIRMED,
        createdAtUTC: new Date().toISOString(),
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
        createdAtUTC: new Date().toISOString(),
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
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMemberIdentifierResponse);

    identifiers.getIdentifiers = jest
      .fn()
      .mockResolvedValue([memberIdentifierRecord]);
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

    eventEmitter.emit = jest.fn();
    saveOperationPendingMock.mockResolvedValueOnce({
      id: `group.${multisigIdentifier}`,
      recordType: OperationPendingRecordType.Group,
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

      multisigManageAid: "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
    });

    expect(identifierStorage.createIdentifierMetadataRecord).toBeCalledWith(
      expect.objectContaining({ id: multisigIdentifier, isPending: true })
    );

    expect(identifierStorage.updateIdentifierMetadata).toBeCalledWith(
      memberIdentifierRecord.id,
      memberIdentifierRecord
    );

    expect(eventEmitter.emit).toHaveBeenCalledWith({
      type: EventTypes.OperationAdded,
      payload: {
        operation: {
          id: `group.${multisigIdentifier}`,
          recordType: OperationPendingRecordType.Group,
        },
      },
    });

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
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    identifiersGetMock = jest
      .fn()
      .mockResolvedValue(getMemberIdentifierResponse);
    identifiers.getIdentifiers = jest
      .fn()
      .mockResolvedValue([memberIdentifierRecord]);
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
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    identifiers.getIdentifiers = jest
      .fn()
      .mockResolvedValue([multisigMetadataRecord]);
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
        createdAtUTC: new Date().toISOString(),
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
        createdAtUTC: new Date().toISOString(),
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
            createdAtUTC: new Date().toISOString(),
          },
        ],
        2
      )
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

  test("Can get multisig icp details of 2 persons multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    identifiers.getIdentifiers = jest
      .fn()
      .mockResolvedValue([memberIdentifierRecord]);
    connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(initiatorConnectionShortDetails);
    connections.getMultisigLinkedContacts = jest.fn().mockResolvedValue([]);
    const result = await multiSigService.getMultisigIcpDetails(
      "ELLb0OvktIxeHDeeOnRJ2pc9IkYJ38An4PXYigUQ_3AO"
    );

    expect(result.ourIdentifier.id).toBe(memberIdentifierRecord.id);
    expect(result.sender.id).toBe(initiatorConnectionShortDetails.id);
    expect(result.otherConnections.length).toBe(0);
    expect(result.threshold).toBe(2);
  });

  test("Throw error if the Multi-sig join request contains unknown AIDs", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    identifiers.getIdentifiers = jest
      .fn()
      .mockResolvedValue([memberIdentifierRecord]);
    connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(initiatorConnectionShortDetails);
    connections.getMultisigLinkedContacts = jest.fn().mockResolvedValue([
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
        ...getRequestMultisigIcp,
        exn: {
          ...getRequestMultisigIcp.exn,
          a: {
            ...getRequestMultisigIcp.exn.a,
            smids: [
              "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
              "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G",
              "EKlUo3CAqjPfFt0Wr2vvSc7MqT9WiL2EGadRsAP3V1IJ",
            ],
          },
          e: { icp: { kt: 3 } },
        },
      },
    ]);
    identifiers.getIdentifiers = jest
      .fn()
      .mockResolvedValue([memberIdentifierRecord]);
    connections.getConnectionShortDetailById = jest
      .fn()
      .mockResolvedValue(initiatorConnectionShortDetails);
    connections.getMultisigLinkedContacts = jest.fn().mockResolvedValue([
      {
        id: "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A",
        connectionDate: nowISO,
        label: "",
        logo: "logoUrl",
        status: ConnectionStatus.PENDING,
      },
    ]);
    const result = await multiSigService.getMultisigIcpDetails(
      "EE-gjeEni5eCdpFlBtG7s4wkv7LJ0JmWplCS4DNQwW2G"
    );
    expect(result.ourIdentifier.id).toBe(memberIdentifierRecord.id);
    expect(result.sender.id).toBe(initiatorConnectionShortDetails.id);
    expect(result.otherConnections.length).toBe(1);
    expect(result.otherConnections[0].id).toBe(
      "EHxEwa9UAcThqxuxbq56BYMq7YPWYxA63A1nau2AZ-1A"
    );
    expect(result.threshold).toBe(3);
  });

  test("Throw error if we do not control any member AID of the multi-sig", async () => {
    Agent.agent.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(true);
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    identifiers.getIdentifiers = jest
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
    groupGetRequestMock = jest.fn().mockResolvedValue([getRequestMultisigIcp]);
    // @TODO - foconnor: This is not ideal as our identifier service is getting tightly coupled with the connection service.
    // Re-work this later.
    connections.getConnectionShortDetailById = jest
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
