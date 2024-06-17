import { AgentServicesProps } from "../agent.types";

abstract class AgentService {
  protected props: AgentServicesProps;

  constructor(agentServicesProps: AgentServicesProps) {
    this.props = agentServicesProps;
  }
}

export { AgentService };
