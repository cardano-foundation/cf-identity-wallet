import { Agent } from "@aries-framework/core";
import { agentModules } from "../agent";
import { StorageApi } from "../../storage/storage.types";

abstract class AgentService {
  protected readonly agent: Agent<typeof agentModules>;

  protected readonly basicStorage!: StorageApi;

  constructor(agent: Agent, basicStorage: StorageApi) {
    this.agent = agent;
    this.basicStorage = basicStorage;
  }
}

export { AgentService };
