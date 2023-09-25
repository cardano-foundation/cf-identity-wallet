import { Agent } from "@aries-framework/core";

abstract class AgentService {
  protected readonly agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }
}

export { AgentService };
