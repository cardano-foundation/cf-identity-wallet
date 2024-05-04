import { PeerConnectionMetadataRecord } from "./peerConnectionMetadataRecord";
import { PeerConnectionStorage } from "./peerConnectionStorage";

const storageService = jest.mocked({
  save: jest.fn(),
  delete: jest.fn(),
  deleteById: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findAllByQuery: jest.fn(),
  getAll: jest.fn(),
});

const peerConnectionStorage = new PeerConnectionStorage(storageService as any);

const peerConnectionMetadataRecordProps = {
  id: "id",
  name: "name",
  url: "url",
  iconB64: "icon",
  selectedAid: "aid",
  isPending: true,
  createdAt: new Date(),
};

const peerConnectionMetadataRecord = new PeerConnectionMetadataRecord({
  ...peerConnectionMetadataRecordProps,
});

const peerConnectionMetadataRecord2 = new PeerConnectionMetadataRecord({
  ...peerConnectionMetadataRecordProps,
  id: "id2",
});

describe("Connection service of agent", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("Should get all credentials", async () => {
    storageService.findAllByQuery.mockResolvedValue([
      peerConnectionMetadataRecord,
      peerConnectionMetadataRecord2,
    ]);
    expect(await peerConnectionStorage.getAllPeerConnectionMetadata()).toEqual([
      peerConnectionMetadataRecord,
      peerConnectionMetadataRecord2,
    ]);
  });

  test("Should get credential metadata", async () => {
    storageService.findById.mockResolvedValue(peerConnectionMetadataRecord);
    expect(
      await peerConnectionStorage.getPeerConnectionMetadata(
        peerConnectionMetadataRecord.id
      )
    ).toEqual(peerConnectionMetadataRecord);
  });

  test("Should throw if peerConnection metadata record is missing", async () => {
    storageService.findById.mockResolvedValue(null);
    await expect(
      peerConnectionStorage.getPeerConnectionMetadata(
        peerConnectionMetadataRecord.id
      )
    ).rejects.toThrowError(
      PeerConnectionStorage.PEER_CONNECTION_METADATA_RECORD_MISSING
    );
  });

  test("Should save peerConnection metadata record", async () => {
    await peerConnectionStorage.createPeerConnectionMetadataRecord(
      peerConnectionMetadataRecordProps
    );
    expect(storageService.save).toBeCalledWith(peerConnectionMetadataRecord);
  });

  test("Should update credential metadata record", async () => {
    storageService.findById.mockResolvedValue(peerConnectionMetadataRecord);
    await peerConnectionStorage.updatePeerConnectionMetadata(
      peerConnectionMetadataRecord.id,
      {
        isPending: false,
      }
    );
    expect(storageService.update).toBeCalled();
  });
});
