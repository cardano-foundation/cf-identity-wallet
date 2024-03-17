import { Agent } from "@aries-framework/core";
import { agentModules } from "../agent";
import { BasicStoragesApi } from "../../storage/storage.types";

abstract class AgentService {
  protected readonly agent: Agent<typeof agentModules>;

  protected readonly basicStorage!: BasicStoragesApi;

  constructor(agent: Agent, basicStorage: BasicStoragesApi) {
    this.agent = agent;
    this.basicStorage = basicStorage!;
  }
}

export { AgentService };
