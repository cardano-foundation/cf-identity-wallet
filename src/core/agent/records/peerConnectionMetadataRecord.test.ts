import {
  PeerConnectionMetadataRecord,
  PeerConnectionMetadataRecordProps,
} from "./peerConnectionMetadataRecord";

const mockData: PeerConnectionMetadataRecordProps = {
  id: "id",
  name: "name",
  url: "url",
  iconB64: "icon",
  selectedAid: "aid",
};

describe("Peer Connection Record", () => {
  test("should fill the record based on supplied props", () => {
    const createdAt = new Date();
    const settingsRecord = new PeerConnectionMetadataRecord({
      ...mockData,
      createdAt: createdAt,
    });
    settingsRecord.getTags();
    expect(settingsRecord.type).toBe(PeerConnectionMetadataRecord.type);
    expect(settingsRecord.id).toBe(mockData.id);
    expect(settingsRecord.name).toBe(mockData.name);
    expect(settingsRecord.url).toBe(mockData.url);
    expect(settingsRecord.selectedAid).toBe(mockData.selectedAid);
    expect(settingsRecord.iconB64).toBe(mockData.iconB64);
    expect(settingsRecord.createdAt).toBe(createdAt);
  });
});
