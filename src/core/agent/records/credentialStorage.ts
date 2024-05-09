import { StorageService } from "../../storage/storage.types";
import { CredentialMetadataRecord } from "./credentialMetadataRecord";
import { CredentialMetadataRecordProps } from "./credentialMetadataRecord.types";

class CredentialStorage {
  private storageService: StorageService<CredentialMetadataRecord>;

  constructor(storageService: StorageService<CredentialMetadataRecord>) {
    this.storageService = storageService;
  }

  async getAllCredentialMetadata(
    isArchived?: boolean
  ): Promise<CredentialMetadataRecord[]> {
    const records = await this.storageService.findAllByQuery(
      {
        ...(isArchived !== undefined ? { isArchived } : {}),
      },
      CredentialMetadataRecord
    );
    return records;
  }

  async deleteCredentialMetadata(id: string) {
    return this.storageService.deleteById(id);
  }

  async getCredentialMetadata(
    id: string
  ): Promise<CredentialMetadataRecord | null> {
    const record = await this.storageService.findById(
      id,
      CredentialMetadataRecord
    );
    if (!record) {
      return null;
    }
    return record;
  }

  async getCredentialMetadataByConnectionId(connectionId: string) {
    const record = await this.storageService.findAllByQuery(
      {
        connectionId,
      },
      CredentialMetadataRecord
    );
    return record;
  }

  async saveCredentialMetadataRecord(data: CredentialMetadataRecordProps) {
    const record = new CredentialMetadataRecord(data);
    return this.storageService.save(record);
  }

  async updateCredentialMetadata(
    id: string,
    data: Partial<
      Pick<
        CredentialMetadataRecord,
        "isArchived" | "status" | "credentialType" | "isDeleted"
      >
    >
  ) {
    const record = await this.getCredentialMetadata(id);
    if (record) {
      if (data.status !== undefined) record.status = data.status;
      if (data.credentialType !== undefined)
        record.credentialType = data.credentialType;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      if (data.isDeleted !== undefined) record.isDeleted = data.isDeleted;
      await this.storageService.update(record);
    }
  }

  async getCrentialMetadataByIds(ids: string[]) {
    return this.storageService.findAllByQuery(
      {
        $or: ids.map((id) => ({ id })),
      },
      CredentialMetadataRecord
    );
  }
}

export { CredentialStorage };
