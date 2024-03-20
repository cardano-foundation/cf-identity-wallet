import { Agent } from "@aries-framework/core";
import { agentModules } from "../agent";
import { BasicStoragesApi } from "../../storage/storage.types";

abstract class AgentService {
  protected readonly agent: Agent<typeof agentModules>;

  constructor(agent: Agent) {
    this.agent = agent;
  }
}

export { AgentService };
