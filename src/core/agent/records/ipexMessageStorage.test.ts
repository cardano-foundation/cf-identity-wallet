import { StorageService } from "../../storage/storage.types";
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
  createdAt: now,
  connectionId: "connectionId",
  content: ipexMessage,
};

const ipexMessageRecordA = new IpexMessageRecord(ipexMessageRecordProps);

const ipexMessageRecordB = new IpexMessageRecord({
  ...ipexMessageRecordProps,
  id: id2,
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
