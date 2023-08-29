import { AgentContext, injectable } from "@aries-framework/core";
import {
  CryptoAccountRecord,
  CryptoAccountRepository,
  MiscRecord,
  MiscRecordId,
  MiscRepository,
} from "./repositories";
import { IdentityMetadataRepository } from "./repositories/identityMetadataRepository";
import {IdentityMetadataRecord, IdentityMetadataRecordProps} from "./repositories/identityMetadataRecord";

/**
 * This can be used to store any records in the agent that aren't explicitly created
 * by a module in the agent - i.e. all "external" records.
 */
@injectable()
export class GeneralStorageApi {
  private miscRepository: MiscRepository;
  private cryptoAccountRepository: CryptoAccountRepository;
  private identityMetadataRepository: IdentityMetadataRepository;
  private agentContext: AgentContext;

  constructor(
    settingsMiscRepository: MiscRepository,
    settingsCryptoAccountRepository: CryptoAccountRepository,
    settingIdentityMetadataRepository: IdentityMetadataRepository,
    agentContext: AgentContext
  ) {
    this.miscRepository = settingsMiscRepository;
    this.cryptoAccountRepository = settingsCryptoAccountRepository;
    this.identityMetadataRepository = settingIdentityMetadataRepository;
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

  async saveIdentityMetadataRecord(record: IdentityMetadataRecord): Promise<void> {
    await this.identityMetadataRepository.save(this.agentContext, record);
  }

  async getAllIdentityMetadata(): Promise<IdentityMetadataRecord[]> {
    return  this.identityMetadataRepository.getAll(this.agentContext);
  }

  async getIdentityMetadata(id: string): Promise<IdentityMetadataRecord | null> {
    return this.identityMetadataRepository.findById(this.agentContext, id);
  }

  async softDeleteIdentityMetadata(id: string): Promise<void> {
    return this.updateIdentityMetadata(id, {isDelete: true});
  }

  async updateIdentityMetadata(id: string, data: Omit<Partial<IdentityMetadataRecordProps>, "id" | "createdAt">): Promise<void> {
    const record = await this.getIdentityMetadata(id);
    if( record ){
      if (data.colors)
        record.colors = data.colors;
      if( data.displayName )
        record.displayName = data.displayName;
      if( data.isDelete )
        record.isDelete = data.isDelete;
      return this.identityMetadataRepository.update(this.agentContext, record);
    }
  }
}
