import { AgentContext, injectable } from "@aries-framework/core";
import { MiscRecord, MiscRecordId, MiscRepository } from "./repositories";

@injectable()
export class GeneralStorageApi {
  private miscRepository: MiscRepository;
  private agentContext: AgentContext;

  constructor(settingsRepository: MiscRepository, agentContext: AgentContext) {
    this.miscRepository = settingsRepository;
    this.agentContext = agentContext;
  }

  async saveMiscRecord(record: MiscRecord): Promise<void> {
    await this.miscRepository.save(this.agentContext, record);
  }

  async getMiscRecordById(id: MiscRecordId): Promise<MiscRecord> {
    return this.miscRepository.getById(this.agentContext, id);
  }
}
