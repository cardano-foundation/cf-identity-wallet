import { plainToInstance } from "class-transformer";
import { RecordType, StorageApi } from "../../storage/storage.types";
import { BasicRecord } from "./basicRecord";
import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import { CredentialMetadataRecordProps } from "./credentialMetadataRecord.types";

class CredentialStorage {
  protected readonly basicStorage: StorageApi;
  constructor(basicStorage: StorageApi) {
    this.basicStorage = basicStorage;
  }

  async getAllCredentialMetadata(isArchived?: boolean) {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.CREDENTIAL_METADATA_RECORD,
      {
        ...(isArchived !== undefined ? { isArchived } : {}),
      }
    );
    return basicRecords.map((bc) => {
      return this.parseCredentialMetadataRecord(bc);
    });
  }

  async deleteCredentialMetadata(id: string) {
    return this.basicStorage.deleteById(id);
  }

  async getCredentialMetadata(
    id: string
  ): Promise<CredentialMetadataRecord | null> {
    const basicRecord = await this.basicStorage.findById(id);
    if (!basicRecord) {
      return null;
    }
    return this.parseCredentialMetadataRecord(basicRecord);
  }

  async getCredentialMetadataByCredentialRecordId(
    credentialRecordId: string
  ): Promise<CredentialMetadataRecord | null> {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.CREDENTIAL_METADATA_RECORD,
      {
        credentialRecordId,
      }
    );
    const basicRecord = basicRecords[0];
    if (!basicRecord) {
      return null;
    }
    return this.parseCredentialMetadataRecord(basicRecord);
  }

  async getCredentialMetadataByConnectionId(connectionId: string) {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.CREDENTIAL_METADATA_RECORD,
      {
        connectionId,
      }
    );
    return basicRecords.map((bc) => {
      return this.parseCredentialMetadataRecord(bc);
    });
  }

  async saveCredentialMetadataRecord(data: CredentialMetadataRecordProps) {
    const record = new CredentialMetadataRecord({
      ...data,
    });
    return this.basicStorage.save({
      id: record.id,
      content: record.toJSON(),
      tags: {
        ...record.getTags(),
      },
      type: RecordType.CREDENTIAL_METADATA_RECORD,
    });
  }

  async updateCredentialMetadata(
    id: string,
    data: Partial<
      Pick<
        CredentialMetadataRecord,
        "isArchived" | "colors" | "status" | "credentialType" | "isDeleted"
      >
    >
  ) {
    const record = await this.getCredentialMetadata(id);
    if (record) {
      if (data.colors) record.colors = data.colors;
      if (data.status) record.status = data.status;
      if (data.credentialType) record.credentialType = data.credentialType;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      if (data.isDeleted !== undefined) record.isDeleted = data.isDeleted;
      const basicRecord = new BasicRecord({
        id: record.id,
        content: record.toJSON(),
        tags: record.getTags(),
        type: RecordType.CREDENTIAL_METADATA_RECORD,
      });
      await this.basicStorage.update(basicRecord);
    }
  }

  private parseCredentialMetadataRecord(
    basicRecord: BasicRecord
  ): CredentialMetadataRecord {
    const instance = plainToInstance(
      CredentialMetadataRecord,
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

export { CredentialStorage };
