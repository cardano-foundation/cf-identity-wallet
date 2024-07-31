import { StorageService } from "../../storage/storage.types";
import { ConnectionHistoryType } from "../services/connection.types";
import { IpexMessageRecord, IpexMessageProps } from "./ipexMessageRecord";
import { IpexMessageStorage } from "./ipexMessageStorage";

const storageService = jest.mocked<StorageService<IpexMessageRecord>>({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const ipexMessageStorage = new IpexMessageStorage(storageService);

const id1 = "id1";
const id2 = "id2";

const now = new Date();
const ipexMessage = {
  exn: {
    v: "string",
    d: "string",
    t: "string",
    i: "string",
    p: "string",
    dt: "string",
    r: "string",
    q: {},
    a: {},
    e: {},
  },
  pathed: {
    acdc: "string",
    iss: "string",
    anc: "string",
  },
};
const ipexMessageRecordProps: IpexMessageProps = {
  id: id1,
  credentialType: "IIW 2024 Demo Day Attendee",
  createdAt: now,
  connectionId: "connectionId",
  content: ipexMessage,
  historyType: ConnectionHistoryType.CREDENTIAL_ISSUANCE,
};

const ipexMessageRecordA = new IpexMessageRecord(ipexMessageRecordProps);

const ipexMessageRecordB = new IpexMessageRecord({
  ...ipexMessageRecordProps,
  id: id2,
  historyType: ConnectionHistoryType.CREDENTIAL_UPDATE,
});

describe("ipexMessage Storage", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should save ipexMessage record", async () => {
    storageService.save.mockResolvedValue(ipexMessageRecordA);
    await ipexMessageStorage.createIpexMessageRecord(ipexMessageRecordProps);
    expect(storageService.save).toBeCalledWith(ipexMessageRecordA);
  });

  test("Should find ipexMessage record by id", async () => {
    storageService.findById.mockResolvedValue(ipexMessageRecordB);
    const result = await ipexMessageStorage.getIpexMessageMetadata(
      ipexMessageRecordB.connectionId
    );
    expect(result).toEqual(ipexMessageRecordB);
  });

  test("Should throw error if there is no matching record", async () => {
    storageService.findById.mockResolvedValue(null);
    await expect(
      ipexMessageStorage.getIpexMessageMetadata("not-found-id")
    ).rejects.toThrowError(
      IpexMessageStorage.IPEX_MESSAGE_METADATA_RECORD_MISSING
    );
  });

  test("Should find ipexMessage record by connectionId", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      ipexMessageRecordA,
      ipexMessageRecordB,
    ]);
    const result =
      await ipexMessageStorage.getIpexMessageMetadataByConnectionId(
        ipexMessageRecordA.connectionId
      );
    expect(result).toEqual([ipexMessageRecordA, ipexMessageRecordB]);
  });
});
