import { CredentialService } from "./credentialService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { ConnectionType } from "../agent.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { EventService } from "./eventService";

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

const identifierStorage = jest.mocked({
  getIdentifierMetadata: jest.fn(),
  getAllIdentifierMetadata: jest.fn(),
  getKeriIdentifiersMetadata: jest.fn(),
  updateIdentifierMetadata: jest.fn(),
  createIdentifierMetadataRecord: jest.fn(),
});

const credentialStorage = jest.mocked({
  getAllCredentialMetadata: jest.fn(),
  deleteCredentialMetadata: jest.fn(),
  getCredentialMetadata: jest.fn(),
  getCredentialMetadataByCredentialRecordId: jest.fn(),
  getCredentialMetadataByConnectionId: jest.fn(),
  saveCredentialMetadataRecord: jest.fn(),
  updateCredentialMetadata: jest.fn(),
});

const credentialListMock = jest.fn();

const signifyClient = jest.mocked({
  connect: jest.fn(),
  boot: jest.fn(),
  identifiers: () => ({
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    addEndRole: jest.fn(),
    interact: jest.fn(),
    rotate: jest.fn(),
    members: jest.fn(),
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
    resolve: jest.fn().mockImplementation((name: string) => {
      return {
        done: true,
        response: {
          i: name,
        },
      };
    }),
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
    list: credentialListMock,
  }),
  exchanges: () => ({
    get: jest.fn(),
    send: jest.fn(),
  }),
  agent: {
    pre: "pre",
  },
  keyStates: () => ({
    query: jest.fn(),
    get: jest.fn(),
  }),
});

const agentServicesProps = {
  basicStorage: basicStorage,
  signifyClient: signifyClient as any,
  eventService: new EventService(),
  identifierStorage: identifierStorage as any,
  credentialStorage: credentialStorage as any,
};

const credentialService = new CredentialService(agentServicesProps);

const now = new Date();
const nowISO = now.toISOString();
const colors: [string, string] = ["#fff", "#fff"];

const id1 = "id1";
const id2 = "id2";
const credentialRecordId1 = "cId1";
const credentialMetadataProps: CredentialMetadataRecordProps = {
  id: id1,
  colors,
  createdAt: now,
  issuanceDate: nowISO,
  issuerLogo: "issuerLogoHere",
  credentialType: "credType",
  status: CredentialMetadataRecordStatus.CONFIRMED,
  credentialRecordId: credentialRecordId1,
  connectionType: ConnectionType.KERI,
};

const credentialMetadataRecordA = new CredentialMetadataRecord(
  credentialMetadataProps
);
const credentialMetadataRecordB = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  id: id2,
});

const archivedMetadataRecord = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  isArchived: true,
});

describe("Credential service of agent - CredentialExchangeRecord helpers", () => {
  // test("create metadata record successfully", async () => {
  //   await credentialService.createMetadata(credentialMetadataProps);
  //   expect(credentialStorage.saveCredentialMetadataRecord).toBeCalled();
  // });
  // test("callback will run when have a event listener of ACDC KERI state changed", async () => {
  //   const callback = jest.fn();
  //   credentialService.onAcdcKeriStateChanged(callback);
  //   const event: AcdcKeriStateChangedEvent = {
  //     type: AcdcKeriEventTypes.AcdcKeriStateChanged,
  //     payload: {
  //       credential: {
  //         id: "acdc",
  //         colors: ["#fff", "#fff"],
  //         issuanceDate: "dt",
  //         credentialType: "type",
  //         status: CredentialMetadataRecordStatus.CONFIRMED,
  //         connectionType: ConnectionType.KERI,
  //       },
  //       status: CredentialStatus.CONFIRMED,
  //     }
  //   };
  //   // credentialService..emit(AcdcKeriEventTypes.AcdcKeriStateChanged, event);
  //   expect(callback).toBeCalledWith(event);
  // });
  // test("can delete keri notification by ID", async () => {
  //   const id = "uuid";
  //   await credentialService.deleteKeriNotificationRecordById(id);
  //   expect(basicStorage.deleteById).toBeCalled();
  // });
  // test("accept KERI ACDC", async () => {
  //   const id = "uuid";
  //   const date = new Date();
  //   basicStorage.findById = jest.fn().mockImplementation((id) => {
  //     if (id == "uuid") {
  //       return {
  //         id,
  //         createdAt: date,
  //         content: {
  //           d: "keri",
  //         },
  //       };
  //     }
  //     return;
  //   });
  //   signifyApi.getKeriExchange = jest.fn().mockResolvedValue({
  //     exn: {
  //       a: {
  //         i: "uuid",
  //       },
  //       i: "i",
  //       e: {
  //         acdc: {
  //           d: "id",
  //           a: {
  //             dt: nowISO,
  //           },
  //         },
  //       },
  //     },
  //   });
  //   // credentialService.getIdentifierMetadata = jest
  //   //   .fn()
  //   //   .mockResolvedValue({
  //   //     signifyName: "holder",
  //   //   });
  //   signifyApi.getCredentialBySaid = jest.fn().mockResolvedValue({
  //     acdc: {
  //       sad: {
  //         d: "id",
  //       },
  //     },
  //     error: undefined,
  //   });
  //   credentialService.getCredentialMetadataByCredentialRecordId =
  //     jest.fn().mockResolvedValue({
  //       id: "id",
  //     });
  //   await credentialService.acceptKeriAcdc(id);
  //   // expect(agent.events.emit).toBeCalled();
  //   expect(basicStorage.deleteById).toBeCalled();
  // });
  // test("Must throw an error when there's no KERI notification", async () => {
  //   const id = "not-found-id";
  //   basicStorage.findById = jest.fn();
  //   await expect(credentialService.acceptKeriAcdc(id)).rejects.toThrowError(
  //     `${CredentialService.KERI_NOTIFICATION_NOT_FOUND} ${id}`
  //   );
  // });
  // test("Must throw 'Credential with given SAID not found on KERIA' when there's no KERI credential", async () => {
  //   const id = "not-found-id";
  //   signifyApi.getCredentialBySaid = jest
  //     .fn()
  //     .mockResolvedValue({ credential: undefined, error: undefined });
  //   await expect(
  //     credentialService.getCredentialDetailsById(id)
  //   ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_FOUND);
  // });
  // test("Must throw an error when there's error from Signigy-ts ", async () => {
  //   const id = "not-found-id";
  //   signifyApi.getCredentialBySaid = jest.fn().mockResolvedValue({
  //     credential: undefined,
  //     error: new Error("Network error"),
  //   });
  //   await expect(
  //     credentialService.getCredentialDetailsById(id)
  //   ).rejects.toThrowError();
  // });
  // test("Should call saveCredentialMetadataRecord when there are un-synced KERI credentials", async () => {
  //   signifyApi.getCredentials = jest.fn().mockReturnValue([
  //     {
  //       sad: {
  //         v: "ACDC10JSON000197_",
  //         d: "EIuZp_JvO5pbNmS8jyG96t3d4XENaFSJpLtbLySxvz-X",
  //         i: "ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W",
  //         ri: "EA67QQC6C6OG4Pok44UHKegNS0YoQm3yxeZwJEbbdCrh",
  //         s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  //         a: {
  //           d: "EDqWl2zEU2LtoVmP1s2jpWx9oFs3bs0zHxH6kdnIgx3-",
  //           i: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
  //           dt: "2023-11-29T02:13:34.858000+00:00",
  //           LEI: "5493001KJTIIGC8Y1R17",
  //         },
  //       },
  //     },
  //     {
  //       sad: {
  //         v: "ACDC10JSON000197_",
  //         d: "EL24R3ECGtv_UzQmYUcu9AeP1ks2JPzTxgPcQPkadEPY",
  //         i: "ECTcHGs3EhJEdVTW10vm5pkiDlOXlR8bPBj9-8LSpZ3W",
  //         ri: "EA67QQC6C6OG4Pok44UHKegNS0YoQm3yxeZwJEbbdCrh",
  //         s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
  //         a: {
  //           d: "EC67QqakhZ1bZgKci_HsGMIKQybEdc9mJqykBecOG4rJ",
  //           i: "EL-EboMhx-DaBLiAS_Vm3qtJOubb2rkcS3zLU_r7UXtl",
  //           dt: "2023-11-29T02:12:35.716000+00:00",
  //           LEI: "5493001KJTIIGC8Y1R17",
  //         },
  //       },
  //     },
  //   ]);
  //   credentialService.getAllCredentialMetadata = jest
  //     .fn()
  //     .mockReturnValue([]);
  //   await credentialService.syncACDCs();
  //   expect(
  //     credentialService.saveCredentialMetadataRecord
  //   ).toBeCalledTimes(2);
  // });
  // test("can get credential short details by ID", async () => {
  //   const id = "testid";
  //   const credentialType = "TYPE-001";
  //   credentialService.getCredentialMetadata = jest.fn().mockReturnValue({
  //     id,
  //     status: CredentialMetadataRecordStatus.CONFIRMED,
  //     colors,
  //     credentialType,
  //     connectionType: ConnectionType.KERI,
  //     issuanceDate: nowISO,
  //     isDeleted: false,
  //     connectionId: undefined,
  //   });
  //   expect(
  //     await credentialService.getCredentialShortDetailsById(id)
  //   ).toStrictEqual({
  //     id,
  //     colors,
  //     status: CredentialMetadataRecordStatus.CONFIRMED,
  //     credentialType,
  //     connectionType: ConnectionType.KERI,
  //     issuanceDate: nowISO,
  //   });
  // });
  // test("cannot get credential short details by ID if the credential does not exist", async () => {
  //   credentialService.getCredentialMetadata = jest.fn().mockResolvedValue(null);
  //   await expect(
  //     credentialService.getCredentialShortDetailsById("randomid")
  //   ).rejects.toThrowError(
  //     CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
  //   );
  // });
});
