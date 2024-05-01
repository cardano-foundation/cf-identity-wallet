import { SignifyClient } from "signify-ts";
import { StorageApi } from "../../storage/storage.types";
import { EventService } from "./eventService";
import { IdentifierStorage } from "../records/identifierStorage";
import { CredentialStorage } from "../records/credentialStorage";
import { AgentServicesProps } from "../agent.types";

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
