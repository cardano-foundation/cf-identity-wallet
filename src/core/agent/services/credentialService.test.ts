import { CredentialService } from "./credentialService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { CredentialStatus } from "./credentialService.types";
import { AcdcKeriEventTypes, AcdcKeriStateChangedEvent } from "../agent.types";
import { SignifyApi } from "../modules/signify/signifyApi";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { RecordType } from "../../storage/storage.types";
import { BasicRecord } from "../records";

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
  admitIpex: jest.fn(),
  getNotifications: jest.fn(),
  markNotification: jest.fn(),
  getKeriExchange: jest.fn(),
  getCredentials: jest.fn(),
  getCredentialBySaid: jest.fn(),
  getKeriaOnlineStatus: jest.fn(),
});

const credentialService = new CredentialService(
  basicStorage,
  signifyApi as any as SignifyApi
);

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
};

const credentialMetadataRecordA = new CredentialMetadataRecord(
  credentialMetadataProps
);
const credentialMetadataRecordB = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  id: id2,
});

const basicRecordA = new BasicRecord({
  id: credentialMetadataRecordA.id,
  content: credentialMetadataRecordA.toJSON(),
  tags: credentialMetadataRecordA.getTags(),
  type: RecordType.CREDENTIAL_METADATA_RECORD,
});

const basicRecordB = new BasicRecord({
  id: credentialMetadataRecordB.id,
  content: credentialMetadataRecordB.toJSON(),
  tags: credentialMetadataRecordB.getTags(),
  type: RecordType.CREDENTIAL_METADATA_RECORD,
});

const archivedMetadataRecord = new CredentialMetadataRecord({
  ...credentialMetadataProps,
  isArchived: true,
});

const basicRecordArchived = new BasicRecord({
  id: archivedMetadataRecord.id,
  content: archivedMetadataRecord.toJSON(),
  tags: archivedMetadataRecord.getTags(),
  type: RecordType.CREDENTIAL_METADATA_RECORD,
});

const genericRecords = [
  {
    id: "uuid",
    content: "mockContent",
    createdAt: new Date(),
  },
];
const keriNotifications = genericRecords.map((result) => {
  return {
    id: result.id,
    createdAt: result.createdAt,
    a: result.content as any,
  };
});

// Callbacks need to be tested at an integration/e2e test level
// describe("Credential service of agent", () => {
//   beforeEach(() => {
//     jest.resetAllMocks();
//   });
//   test("can get all credentials", async () => {
//     basicStorage.findAllByQuery = jest
//       .fn()
//       .mockResolvedValue([basicRecordA, basicRecordB]);

//     expect(await credentialService.getCredentials()).toStrictEqual([
//       {
//         id: id1,
//         colors,
//         credentialType: credentialMetadataRecordA.credentialType,
//         issuanceDate: nowISO,
//         status: CredentialMetadataRecordStatus.CONFIRMED,
//         cachedDetails: undefined,
//         connectionType: ConnectionType.KERI,
//       },
//       {
//         id: id2,
//         colors,
//         credentialType: credentialMetadataRecordB.credentialType,
//         issuanceDate: nowISO,
//         status: CredentialMetadataRecordStatus.CONFIRMED,
//         cachedDetails: undefined,
//         connectionType: ConnectionType.KERI,
//       },
//     ]);
//   });

//   test("can get all credentials if there are none", async () => {
//     basicStorage.findAllByQuery = jest.fn().mockResolvedValue([]);

//     expect(await credentialService.getCredentials()).toStrictEqual([]);
//   });

//   test("can archive any credential (re-archiving does nothing)", async () => {
//     const credId = "credId1";
//     await credentialService.archiveCredential(credId);
//     expect(basicStorage.update).toBeCalledWith(
//       expect.objectContaining({
//         id: credId,
//         isArchived: true,
//       })
//     );
//   });

//   test("can delete an archived credential (cred and metadata record)", async () => {
//     basicStorage.findById = jest.fn().mockResolvedValue(basicRecordArchived);
//     const credId = "credId1";
//     await credentialService.deleteCredential(credId);
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(
//       credentialService.deleteCredentialMetadata
//     ).toBeCalledWith(credId);
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue({
//         ...archivedMetadataRecord,
//         connectionType: ConnectionType.KERI,
//       });
//     await credentialService.deleteCredential(credId);
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(credentialService.updateCredentialMetadata).toBeCalled();
//   });

//   test("cannot delete a non-archived credential", async () => {
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue(credentialMetadataRecordA);
//     const credId = "credId1";
//     await expect(
//       credentialService.deleteCredential(credId)
//     ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_ARCHIVED);
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(
//       credentialService.deleteCredentialMetadata
//     ).not.toBeCalled();
//   });

//   test("cannot delete a credential without a metadata record", async () => {
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue(null);
//     const credId = "credId1";
//     await expect(
//       credentialService.deleteCredential(credId)
//     ).rejects.toThrowError(
//       CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
//     );
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(
//       credentialService.deleteCredentialMetadata
//     ).not.toBeCalled();
//   });

//   test("can restore an archived credential", async () => {
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue(archivedMetadataRecord);
//     const credId = "credId1";
//     await credentialService.restoreCredential(credId);
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(
//       credentialService.updateCredentialMetadata
//     ).toBeCalledWith(credId, { isArchived: false });
//   });

//   test("cannot restore a non-archived credential", async () => {
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue(credentialMetadataRecordA);
//     const credId = "credId1";
//     await expect(
//       credentialService.restoreCredential(credId)
//     ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_ARCHIVED);
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(
//       credentialService.updateCredentialMetadata
//     ).not.toBeCalled();
//   });

//   test("cannot restore a credential without a metadata record", async () => {
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue(null);
//     const credId = "credId1";
//     await expect(
//       credentialService.restoreCredential(credId)
//     ).rejects.toThrowError(
//       CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
//     );
//     expect(credentialService.getCredentialMetadata).toBeCalledWith(
//       credId
//     );
//     expect(
//       credentialService.updateCredentialMetadata
//     ).not.toBeCalled();
//   });

//   test("create metadata record successfully", async () => {
//     await credentialService.createMetadata(credentialMetadataProps);
//     expect(
//       credentialService.saveCredentialMetadataRecord
//     ).toBeCalled();
//   });

//   test("get acdc credential details successfully record by id", async () => {
//     const acdcMetadataRecord = {
//       ...credentialMetadataRecordA,
//       connectionType: ConnectionType.KERI,
//     };
//     credentialService.getCredentialMetadata = jest
//       .fn()
//       .mockResolvedValue(acdcMetadataRecord);

//     const acdc = {
//       sad: {
//         a: { LEI: "5493001KJTIIGC8Y1R17" },
//         d: "EBEWfIUOn789yJiNRnvKqpbWE3-m6fSDxtu6wggybbli",
//         i: "EIpeOFh268oRJTM4vNNoQvMWw-NBUPDv1NqYbx6Lc1Mk",
//         ri: "EOIj7V-rqu_Q9aGSmPfviBceEtRk1UZBN5H2P_L-Hhx5",
//         s: "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao",
//         v: "ACDC10JSON000197_",
//       },
//       schema: {
//         title: "Qualified vLEI Issuer Credential",
//         description: "vLEI Issuer Description",
//         version: "1.0.0",
//         credentialType: "QualifiedvLEIIssuervLEICredential",
//       },
//       status: {
//         s: "0",
//         dt: nowISO,
//       },
//     };
//     signifyApi.getCredentialBySaid = jest.fn().mockResolvedValue({ acdc });

//     await expect(
//       credentialService.getCredentialDetailsById(acdcMetadataRecord.id)
//     ).resolves.toStrictEqual({
//       id: credentialMetadataRecordA.id,
//       colors: credentialMetadataRecordA.colors,
//       credentialType: acdcMetadataRecord.credentialType,
//       issuanceDate: nowISO,
//       cachedDetails: undefined,
//       status: CredentialMetadataRecordStatus.CONFIRMED,
//       connectionType: ConnectionType.KERI,
//       i: acdc.sad.i,
//       a: acdc.sad.a,
//       s: {
//         title: acdc.schema.title,
//         description: acdc.schema.description,
//         version: acdc.schema.version,
//       },
//       lastStatus: {
//         s: acdc.status.s,
//         dt: nowISO,
//       },
//     });
//   });
// });

describe("Credential service of agent - CredentialExchangeRecord helpers", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
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

  test("can delete keri notification by ID", async () => {
    const id = "uuid";
    await credentialService.deleteKeriNotificationRecordById(id);
    expect(basicStorage.deleteById).toBeCalled();
  });

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

  test("Must throw an error when there's no KERI notification", async () => {
    const id = "not-found-id";
    basicStorage.findById = jest.fn();
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    await expect(credentialService.acceptKeriAcdc(id)).rejects.toThrowError(
      `${CredentialService.KERI_NOTIFICATION_NOT_FOUND} ${id}`
    );
  });

  // test("Must throw 'Credential with given SAID not found on KERIA' when there's no KERI credential", async () => {
  //   const id = "not-found-id";
  //   signifyApi.getCredentialBySaid = jest
  //     .fn()
  //     .mockResolvedValue({ credential: undefined, error: undefined });
  //   await expect(
  //     credentialService.getCredentialDetailsById(id)
  //   ).rejects.toThrowError(CredentialService.CREDENTIAL_NOT_FOUND);
  // });
  test("Must throw an error when there's error from Signigy-ts ", async () => {
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValue(true);
    const id = "not-found-id";
    signifyApi.getCredentialBySaid = jest.fn().mockResolvedValue({
      credential: undefined,
      error: new Error("Network error"),
    });
    await expect(
      credentialService.getCredentialDetailsById(id)
    ).rejects.toThrowError();
  });

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

  test("can get credential short details by ID", async () => {
    const id = "testid";
    const credentialType = "TYPE-001";
    credentialService.getCredentialMetadata = jest.fn().mockReturnValue({
      id,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      colors,
      credentialType,
      issuanceDate: nowISO,
      isDeleted: false,
      connectionId: undefined,
    });
    expect(
      await credentialService.getCredentialShortDetailsById(id)
    ).toStrictEqual({
      id,
      colors,
      status: CredentialMetadataRecordStatus.CONFIRMED,
      credentialType,
      issuanceDate: nowISO,
    });
  });

  test("cannot get credential short details by ID if the credential does not exist", async () => {
    credentialService.getCredentialMetadata = jest.fn().mockResolvedValue(null);
    await expect(
      credentialService.getCredentialShortDetailsById("randomid")
    ).rejects.toThrowError(
      CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
    );
  });

  // test("Should pass the filter throught findAllByQuery when call getUnhandledCredentials", async () => {
  //   agent.credentials.findAllByQuery = jest.fn().mockResolvedValueOnce([]);
  //   basicStorage.findAllByQuery = jest.fn().mockResolvedValue([]);
  //   await credentialService.getUnhandledCredentials({
  //     isDismissed: false,
  //   });
  //   expect(basicStorage.findAllByQuery).toBeCalledWith(
  //     RecordType.NOTIFICATION_KERI,
  //     {
  //       route: NotificationRoute.Credential,
  //       isDismissed: false,
  //     }
  //   );
  // });

  test("getCredentialDetailsById should throw an error when KERIA is offline ", async () => {
    signifyApi.getKeriaOnlineStatus = jest.fn().mockReturnValueOnce(false);
    expect(() =>
      credentialService.getCredentialDetailsById("not-found-id")
    ).toThrowError(SignifyApi.KERIA_CONNECTION_BROKEN);
    expect(() =>
      credentialService.getKeriCredentialNotifications()
    ).toThrowError(SignifyApi.KERIA_CONNECTION_BROKEN);
    expect(() => credentialService.acceptKeriAcdc("id")).toThrowError(
      SignifyApi.KERIA_CONNECTION_BROKEN
    );
    expect(() => credentialService.syncACDCs()).toThrowError(
      SignifyApi.KERIA_CONNECTION_BROKEN
    );
  });
});
