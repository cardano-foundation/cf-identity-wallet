import { SignifyClient } from "signify-ts";
import { EventService } from "./eventService";
import { AgentServicesProps } from "../agent.types";

abstract class AgentService {
  protected signifyClient: SignifyClient;
  protected readonly eventService: EventService;

  constructor(agentServicesProps: AgentServicesProps) {
    this.signifyClient = agentServicesProps.signifyClient;
    this.eventService = agentServicesProps.eventService;
  }

  set signifyClientInstance(signifyClient: SignifyClient) {
    this.signifyClient = signifyClient;
  }
}

export { AgentService };
