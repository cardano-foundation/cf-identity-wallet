import { RecordType, StorageApi } from "../../storage/storage.types";
import { IdentifierType } from "../services/identifierService.types";
import { BasicRecord } from "./basicRecord";
import {
  IdentifierMetadataRecord,
  IdentifierMetadataRecordProps,
} from "./identifierMetadataRecord";
import { plainToInstance } from "class-transformer";

class IdentifierStorage {
  static readonly IDENTIFIER_METADATA_RECORD_MISSING =
    "Identifier metadata record does not exist";
  protected readonly basicStorage: StorageApi;
  constructor(basicStorage: StorageApi) {
    this.basicStorage = basicStorage;
  }

  async getIdentifierMetadata(
    id: string
  ): Promise<IdentifierMetadataRecord> {
    const metadata = await this.basicStorage.findById(id);
    if (!metadata) {
      throw new Error(IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING);
    }
    return this.parseIdentifierMetadataRecord(metadata);
  }

  async getAllIdentifierMetadata(
    isArchived: boolean
  ): Promise<IdentifierMetadataRecord[]> {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.IDENTIFIER_METADATA_RECORD,
      {
        isArchived,
      }
    );
    return basicRecords.map((bc) => {
      return this.parseIdentifierMetadataRecord(bc);
    });
  }

  async getKeriIdentifiersMetadata(): Promise<IdentifierMetadataRecord[]> {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.IDENTIFIER_METADATA_RECORD,
      {
        method: IdentifierType.KERI,
      }
    );
    return basicRecords.map((bc) => {
      return this.parseIdentifierMetadataRecord(bc);
    });
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
      const basicRecord = new BasicRecord({
        id: identifierMetadataRecord.id,
        content: identifierMetadataRecord.toJSON(),
        tags: identifierMetadataRecord.getTags(),
        type: RecordType.IDENTIFIER_METADATA_RECORD,
      });
      await this.basicStorage.update(basicRecord);
    }
  }

  async createIdentifierMetadataRecord(
    data: IdentifierMetadataRecordProps
  ): Promise<void> {
    const record = new IdentifierMetadataRecord({
      ...data,
    });
    await this.basicStorage.save({
      id: record.id,
      content: record.toJSON(),
      tags: { ...record.getTags() },
      type: RecordType.IDENTIFIER_METADATA_RECORD,
    });
  }

  private parseIdentifierMetadataRecord(
    basicRecord: BasicRecord
  ): IdentifierMetadataRecord {
    const instance = plainToInstance(
      IdentifierMetadataRecord,
      basicRecord.content,
      {
        exposeDefaultValues: true,
      }
    );
    instance.createdAt = new Date(instance.createdAt);
    instance.updatedAt = instance.updatedAt
      ? new Date(instance.createdAt)
      : undefined;
    instance.replaceTags(basicRecord.getTags());
    return instance;
  }
}

export { IdentifierStorage };
