import { StorageApi } from "../../storage/storage.types";
import { EventService } from "./eventService";
import { AgentServicesProps } from "../agent.types";
import { SignifyClient } from "signify-ts";
import { CredentialStorage, IdentifierStorage } from "../records";

abstract class AgentService {
  protected readonly basicStorage: StorageApi;
  protected readonly signifyClient: SignifyClient;
  protected readonly eventService: EventService;
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly credentialStorage: CredentialStorage;

  constructor(agentServicesProps: AgentServicesProps) {
    this.basicStorage = agentServicesProps.basicStorage;
    this.signifyClient = agentServicesProps.signifyClient;
    this.eventService = agentServicesProps.eventService;
    this.identifierStorage = agentServicesProps.identifierStorage;
    this.credentialStorage = agentServicesProps.credentialStorage;
  }
}

export { AgentService };
