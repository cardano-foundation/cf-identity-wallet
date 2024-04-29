import { StorageService } from "../../storage/storage.types";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "./identifierMetadataRecord";

class IdentifierStorage {
  static readonly IDENTIFIER_METADATA_RECORD_MISSING =
    "Identifier metadata record does not exist";
  private storageService: StorageService<IdentifierMetadataRecord>;

  constructor(storageService: StorageService<IdentifierMetadataRecord>) {
    this.storageService = storageService;
  }

  async getIdentifierMetadata(id: string): Promise<IdentifierMetadataRecord> {
    const metadata = await this.storageService.findById(
      id,
      IdentifierMetadataRecord
    );
    if (!metadata) {
      throw new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING);
    }
    return metadata;
  }

  async getAllIdentifierMetadata(
    isArchived: boolean
  ): Promise<IdentifierMetadataRecord[]> {
    const records = await this.storageService.findAllByQuery(
      {
        isArchived,
      },
      IdentifierMetadataRecord
    );
    return records;
  }

  async getKeriIdentifiersMetadata(): Promise<IdentifierMetadataRecord[]> {
    return this.storageService.getAll(IdentifierMetadataRecord);
  }

  async updateIdentifierMetadata(
    id: string,
    metadata: Partial<
      Pick<
        IdentifierMetadataRecord,
        "displayName" | "theme" | "isArchived" | "isPending" | "isDeleted"
      >
    >
  ): Promise<void> {
    const identifierMetadataRecord = await this.getIdentifierMetadata(id);
    if (identifierMetadataRecord) {
      identifierMetadataRecord.displayName =
        metadata.displayName || identifierMetadataRecord.displayName;
      identifierMetadataRecord.theme =
        metadata.theme || identifierMetadataRecord.theme;
      identifierMetadataRecord.isArchived =
        metadata.isArchived || identifierMetadataRecord.isArchived;
      identifierMetadataRecord.isPending =
        metadata.isPending || identifierMetadataRecord.isPending;
      identifierMetadataRecord.isDeleted =
        metadata.isDeleted || identifierMetadataRecord.isDeleted;
      await this.storageService.update(identifierMetadataRecord);
    }
  }

  async createIdentifierMetadataRecord(
    data: IdentifierMetadataRecordProps
  ): Promise<void> {
    const record = new IdentifierMetadataRecord({
      ...data,
    });
    await this.storageService.save(record);
  }
}

export { IdentifierStorage };
