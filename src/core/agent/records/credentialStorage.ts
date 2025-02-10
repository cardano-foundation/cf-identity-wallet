import { StorageMessage, StorageService } from "../../storage/storage.types";
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
        pendingDeletion: false,
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

  async saveCredentialMetadataRecord(data: CredentialMetadataRecordProps): Promise<CredentialMetadataRecord> {
    const record = new CredentialMetadataRecord(data);
    try {
      await this.storageService.save(record);
      return record;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === `${StorageMessage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${record.id}`
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `Duplicate record detected for ID: ${record.id}. Ignoring...`
        );
        return record;
      } else {
        throw error;
      }
    }
  }

  async updateCredentialMetadata(
    id: string,
    data: Partial<
      Pick<
        CredentialMetadataRecord,
        "isArchived" | "status" | "credentialType" | "pendingDeletion"
      >
    >
  ) {
    const record = await this.getCredentialMetadata(id);
    if (record) {
      if (data.status !== undefined) record.status = data.status;
      if (data.credentialType !== undefined)
        record.credentialType = data.credentialType;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      if (data.pendingDeletion !== undefined) record.pendingDeletion = data.pendingDeletion;
      await this.storageService.update(record);
    }
  }

  async getCredentialMetadatasById(ids: string[], query?: any) {
    return this.storageService.findAllByQuery(
      {
        $or: ids.map((id) => ({ id })),
        ...query,
      },
      CredentialMetadataRecord
    );
  }

  async getCredentialsPendingDeletion(): Promise<CredentialMetadataRecord[]> {
    return this.storageService.findAllByQuery(
      {
        pendingDeletion: true,
      },
      CredentialMetadataRecord
    );
  }
}

export { CredentialStorage };
