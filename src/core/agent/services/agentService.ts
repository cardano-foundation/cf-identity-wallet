import { SignifyClient } from "signify-ts";
import { EventService } from "./eventService";
import { IdentifierStorage } from "../records/identifierStorage";
import { CredentialStorage } from "../records/credentialStorage";
import { AgentServicesProps } from "../agent.types";
import { PeerConnectionStorage } from "../records";

abstract class AgentService {
  protected readonly signifyClient: SignifyClient;
  protected readonly eventService: EventService;
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly peerConnectionStorage: PeerConnectionStorage;

  constructor(agentServicesProps: AgentServicesProps) {
    this.signifyClient = agentServicesProps.signifyClient;
    this.eventService = agentServicesProps.eventService;
    this.identifierStorage = agentServicesProps.identifierStorage;
    this.credentialStorage = agentServicesProps.credentialStorage;
    this.peerConnectionStorage = agentServicesProps.peerConnectionStorage;
  }
}

export { AgentService };
