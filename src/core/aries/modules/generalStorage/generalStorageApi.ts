import { AgentContext, injectable } from "@aries-framework/core";
import {
  CryptoAccountRecord,
  CryptoAccountRecordId,
  CryptoAccountRepository,
  MiscRecord,
  MiscRecordId,
  MiscRepository,
} from "./repositories";

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

  async saveCryptoAccountRecord(record: CryptoAccountRecord): Promise<void> {
    await this.cryptoAccountRepository.save(this.agentContext, record);
  }

  async getCryptoAccountRecordById(
    id: CryptoAccountRecordId
  ): Promise<CryptoAccountRecord> {
    return this.cryptoAccountRepository.getById(this.agentContext, id);
  }
}
