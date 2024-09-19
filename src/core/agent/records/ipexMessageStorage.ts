import { StorageService } from "../../storage/storage.types";
import { IpexMessageProps, IpexMessageRecord } from "./ipexMessageRecord";

class IpexMessageStorage {
  static readonly IPEX_MESSAGE_METADATA_RECORD_MISSING =
    "Ipex message metadata record does not exist";
  private storageService: StorageService<IpexMessageRecord>;

  constructor(storageService: StorageService<IpexMessageRecord>) {
    this.storageService = storageService;
  }

  async createIpexMessageRecord(data: IpexMessageProps): Promise<void> {
    const record = new IpexMessageRecord(data);
    await this.storageService.save(record);
  }

  async getIpexMessageMetadata(id: string): Promise<IpexMessageRecord> {
    const metadata = await this.storageService.findById(id, IpexMessageRecord);
    if (!metadata) {
      throw new Error(IpexMessageStorage.IPEX_MESSAGE_METADATA_RECORD_MISSING);
    }
    return metadata;
  }

  async getIpexMessageMetadataByConnectionId(
    connectionId: string
  ): Promise<IpexMessageRecord[]> {
    const records = await this.storageService.findAllByQuery(
      {
        connectionId,
      },
      IpexMessageRecord
    );
    return records;
  }

  async deleteIpexMessageMetadata(id: string) {
    return this.storageService.deleteById(id);
  }
}

export { IpexMessageStorage };
