import { AgentContext, DidRepository, injectable } from "@aries-framework/core";
import {
  IdentifierMetadataRepository,
  IdentifierMetadataRecord,
  CredentialMetadataRecord,
  CredentialMetadataRepository,
} from "./repositories";
import { IdentifierType } from "../../services/identifierService.types";

/**
 * This can be used to store any records in the agent that aren't explicitly created
 * by a module in the agent - i.e. all "external" records.
 */
@injectable()
export class GeneralStorageApi {
  private identifierMetadataRepository: IdentifierMetadataRepository;
  private credentialMetadataRepository: CredentialMetadataRepository;
  private agentContext: AgentContext;

  constructor(
    settingIdentifierMetadataRepository: IdentifierMetadataRepository,
    settingsCredentialMetadataRepository: CredentialMetadataRepository,
    agentContext: AgentContext
  ) {
    this.identifierMetadataRepository = settingIdentifierMetadataRepository;
    this.credentialMetadataRepository = settingsCredentialMetadataRepository;
    this.agentContext = agentContext;
  }

  async saveIdentifierMetadataRecord(
    record: IdentifierMetadataRecord
  ): Promise<void> {
    await this.identifierMetadataRepository.save(this.agentContext, record);
  }

  async getKeriIdentifiersMetadata(): Promise<IdentifierMetadataRecord[]> {
    return this.identifierMetadataRepository.findByQuery(this.agentContext, {
      method: IdentifierType.KERI,
    });
  }

  async getAllAvailableIdentifierMetadata(): Promise<
    IdentifierMetadataRecord[]
    > {
    return this.identifierMetadataRepository.findByQuery(this.agentContext, {
      isArchived: false,
      isDeleted: false,
    });
  }

  async getAllArchivedIdentifierMetadata(): Promise<
    IdentifierMetadataRecord[]
    > {
    return this.identifierMetadataRepository.findByQuery(this.agentContext, {
      isArchived: true,
    });
  }

  async getIdentifierMetadata(
    id: string
  ): Promise<IdentifierMetadataRecord | null> {
    return this.identifierMetadataRepository.findById(this.agentContext, id);
  }

  async getKeriIdentifierMetadataByName(
    signifyName: string
  ): Promise<IdentifierMetadataRecord | null> {
    return this.identifierMetadataRepository.findSingleByQuery(
      this.agentContext,
      {
        signifyName,
      }
    );
  }

  async getKeriIdentifierMetadataByGroupId(
    groupId: string
  ): Promise<IdentifierMetadataRecord | null> {
    return this.identifierMetadataRepository.findSingleByQuery(
      this.agentContext,
      {
        groupId,
      }
    );
  }

  async archiveIdentifierMetadata(id: string): Promise<void> {
    return this.updateIdentifierMetadata(id, { isArchived: true });
  }

  async deleteIdentifierMetadata(id: string): Promise<void> {
    return this.identifierMetadataRepository.deleteById(this.agentContext, id);
  }
  async deleteDidRecord(did: string): Promise<void> {
    const didRepository =
      this.agentContext.dependencyManager.resolve(DidRepository);
    const record = await didRepository.findByQuery(this.agentContext, {
      did: did,
      method: IdentifierType.KEY,
    });
    if (!record.length) {
      return;
    }
    return this.agentContext.dependencyManager
      .resolve(DidRepository)
      .delete(this.agentContext, record[0]);
  }

  async updateIdentifierMetadata(
    id: string,
    data: Omit<
      Partial<IdentifierMetadataRecord>,
      "id" | "name" | "method" | "createdAt"
    >
  ): Promise<void> {
    const record = await this.getIdentifierMetadata(id);
    if (record) {
      if (data.colors) record.colors = data.colors;
      if (data.displayName) record.displayName = data.displayName;
      if (data.theme) record.theme = data.theme;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      if (data.isDeleted !== undefined) record.isDeleted = data.isDeleted;
      if (data.isPending !== undefined) record.isPending = data.isPending;
      return this.identifierMetadataRepository.update(
        this.agentContext,
        record
      );
    }
  }

  // Credential metadata function list
  async saveCredentialMetadataRecord(
    record: CredentialMetadataRecord
  ): Promise<void> {
    await this.credentialMetadataRepository.save(this.agentContext, record);
  }

  async getAllCredentialMetadata(
    isArchived?: boolean
  ): Promise<CredentialMetadataRecord[]> {
    const query = typeof isArchived === "boolean" ? { isArchived } : {};
    return this.credentialMetadataRepository.findByQuery(
      this.agentContext,
      query
    );
  }

  async getCredentialMetadata(
    id: string
  ): Promise<CredentialMetadataRecord | null> {
    return this.credentialMetadataRepository.findById(this.agentContext, id);
  }

  async getCredentialMetadataByCredentialRecordId(
    credentialRecordId: string
  ): Promise<CredentialMetadataRecord | null> {
    return this.credentialMetadataRepository.findSingleByQuery(
      this.agentContext,
      { credentialRecordId }
    );
  }

  async getCredentialMetadataByConnectionId(
    connectionId: string
  ): Promise<CredentialMetadataRecord[]> {
    return this.credentialMetadataRepository.findByQuery(this.agentContext, {
      connectionId,
    });
  }

  async deleteCredentialMetadata(id: string): Promise<void> {
    return this.credentialMetadataRepository.deleteById(this.agentContext, id);
  }

  async updateCredentialMetadata(
    id: string,
    data: Omit<Partial<CredentialMetadataRecord>, "id" | "createdAt">
  ): Promise<void> {
    const record = await this.getCredentialMetadata(id);
    if (record) {
      if (data.colors) record.colors = data.colors;
      if (data.status) record.status = data.status;
      if (data.credentialType) record.credentialType = data.credentialType;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      if (data.isDeleted !== undefined) record.isDeleted = data.isDeleted;
      if (data.cachedDetails) record.cachedDetails = data.cachedDetails;
      await this.credentialMetadataRepository.update(this.agentContext, record);
    }
  }
}
