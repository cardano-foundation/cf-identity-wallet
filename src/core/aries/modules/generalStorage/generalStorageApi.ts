import { AgentContext, DidRepository, injectable } from "@aries-framework/core";
import {
  CryptoAccountRecord,
  CryptoAccountRepository,
  MiscRecord,
  MiscRecordId,
  MiscRepository,
} from "./repositories";
import { IdentityMetadataRepository } from "./repositories/identityMetadataRepository";
import {
  IdentityMetadataRecord,
  IdentityMetadataRecordProps,
} from "./repositories/identityMetadataRecord";
import { IdentityType } from "../../ariesAgent.types";
import { CredentialMetadataRepository } from "./repositories/credentialMetadataRepository";
import { CredentialMetadataRecord } from "./repositories/credentialMetadataRecord";

/**
 * This can be used to store any records in the agent that aren't explicitly created
 * by a module in the agent - i.e. all "external" records.
 */
@injectable()
export class GeneralStorageApi {
  private miscRepository: MiscRepository;
  private cryptoAccountRepository: CryptoAccountRepository;
  private identityMetadataRepository: IdentityMetadataRepository;
  private credentialMetadataRepository: CredentialMetadataRepository;
  private agentContext: AgentContext;

  constructor(
    settingsMiscRepository: MiscRepository,
    settingsCryptoAccountRepository: CryptoAccountRepository,
    settingIdentityMetadataRepository: IdentityMetadataRepository,
    settingsCredentialMetadataRepository: CredentialMetadataRepository,
    agentContext: AgentContext
  ) {
    this.miscRepository = settingsMiscRepository;
    this.cryptoAccountRepository = settingsCryptoAccountRepository;
    this.identityMetadataRepository = settingIdentityMetadataRepository;
    this.credentialMetadataRepository = settingsCredentialMetadataRepository;
    this.agentContext = agentContext;
  }

  async saveMiscRecord(record: MiscRecord): Promise<void> {
    await this.miscRepository.save(this.agentContext, record);
  }

  async getMiscRecordById(id: MiscRecordId): Promise<MiscRecord> {
    return this.miscRepository.getById(this.agentContext, id);
  }

  async saveCryptoRecord(record: CryptoAccountRecord): Promise<void> {
    await this.cryptoAccountRepository.save(this.agentContext, record);
  }

  async getAllCryptoRecord(): Promise<CryptoAccountRecord[]> {
    return this.cryptoAccountRepository.getAll(this.agentContext);
  }

  async removeCryptoRecordById(id: string): Promise<void> {
    await this.cryptoAccountRepository.deleteById(this.agentContext, id);
  }

  async cryptoAccountIdentitySeedPhraseExists(): Promise<boolean> {
    return (
      (
        await this.cryptoAccountRepository.findByQuery(this.agentContext, {
          usesIdentitySeedPhrase: true,
        })
      ).length > 0
    );
  }

  async saveIdentityMetadataRecord(
    record: IdentityMetadataRecord
  ): Promise<void> {
    await this.identityMetadataRepository.save(this.agentContext, record);
  }

  async getAllAvailableIdentityMetadata(): Promise<IdentityMetadataRecord[]> {
    return this.identityMetadataRepository.findByQuery(this.agentContext, {
      isArchived: false,
    });
  }

  async getAllArchiveIdentityMetadata(): Promise<IdentityMetadataRecord[]> {
    return this.identityMetadataRepository.findByQuery(this.agentContext, {
      isArchived: true,
    });
  }

  async getIdentityMetadata(
    id: string
  ): Promise<IdentityMetadataRecord | null> {
    return this.identityMetadataRepository.findById(this.agentContext, id);
  }

  async archiveIdentityMetadata(id: string): Promise<void> {
    return this.updateIdentityMetadata(id, { isArchived: true });
  }

  async deleteIdentityMetadata(id: string): Promise<void> {
    return this.identityMetadataRepository.deleteById(this.agentContext, id);
  }
  async deleteDidRecord(did: string): Promise<void> {
    const didRepository =
      this.agentContext.dependencyManager.resolve(DidRepository);
    const record = await didRepository.findByQuery(this.agentContext, {
      did: did,
      method: IdentityType.KEY,
    });
    if (!record.length) {
      return;
    }
    return this.agentContext.dependencyManager
      .resolve(DidRepository)
      .delete(this.agentContext, record[0]);
  }

  async updateIdentityMetadata(
    id: string,
    data: Omit<
      Partial<IdentityMetadataRecordProps>,
      "id" | "name" | "method" | "createdAt"
    >
  ): Promise<void> {
    const record = await this.getIdentityMetadata(id);
    if (record) {
      if (data.colors) record.colors = data.colors;
      if (data.displayName) record.displayName = data.displayName;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      return this.identityMetadataRepository.update(this.agentContext, record);
    }
  }

  // Credential metadata function list
  async saveCredentialMetadataRecord(
    record: CredentialMetadataRecord
  ): Promise<void> {
    await this.credentialMetadataRepository.save(this.agentContext, record);
  }

  async getAllCredentialMetadata(
    isArchived: boolean
  ): Promise<CredentialMetadataRecord[]> {
    return this.credentialMetadataRepository.findByQuery(this.agentContext, {
      isArchived,
    });
  }

  async getCredentialMetadata(
    id: string
  ): Promise<CredentialMetadataRecord | null> {
    return this.credentialMetadataRepository.findById(this.agentContext, id);
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
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      await this.credentialMetadataRepository.update(this.agentContext, record);
    }
  }
}
