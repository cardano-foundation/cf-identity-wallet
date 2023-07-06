import { AgentContext, injectable } from "@aries-framework/core";
import {
  CryptoAccountRecord,
  CryptoAccountRepository,
  MiscRecord,
  MiscRecordId,
  MiscRepository,
} from "./repositories";

/**
 * This can be used to store any records in the agent that aren't explicitly created
 * by a module in the agent - i.e. all "external" records.
 */
@injectable()
export class GeneralStorageApi {
  private miscRepository: MiscRepository;
  private cryptoAccountRepository: CryptoAccountRepository;
  private agentContext: AgentContext;

  constructor(
    settingsMiscRepository: MiscRepository,
    settingsCryptoAccountRepository: CryptoAccountRepository,
    agentContext: AgentContext
  ) {
    this.miscRepository = settingsMiscRepository;
    this.cryptoAccountRepository = settingsCryptoAccountRepository;
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
    return (await this.cryptoAccountRepository.findByQuery(this.agentContext, { usesIdentitySeedPhrase: true })).length > 0;
  }
}
