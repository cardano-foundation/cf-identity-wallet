import { SignifyClient } from "signify-ts";
import { StorageApi } from "../../storage/storage.types";
import { EventService } from "./eventService";
import { IdentifierStorage } from "../records/identifierStorage";
import { CredentialStorage } from "../records/credentialStorage";
import { AgentServicesProps } from "../agent.types";

abstract class AgentService {
  protected readonly signifyClient: SignifyClient;
  protected readonly eventService: EventService;

  constructor(agentServicesProps: AgentServicesProps) {
    this.signifyClient = agentServicesProps.signifyClient;
    this.eventService = agentServicesProps.eventService;
  }
}

export { AgentService };
