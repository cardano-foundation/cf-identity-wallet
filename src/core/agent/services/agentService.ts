import { agentModules } from "../agent";
import { Agent } from "@aries-framework/core";

abstract class AgentService {
  protected readonly agent: Agent<typeof agentModules>;

  constructor(agent: Agent) {
    this.agent = agent;
  }
}

export { AgentService };
