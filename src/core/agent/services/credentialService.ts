import {
  CredentialEventTypes,
  CredentialExchangeRecord,
  CredentialState,
  CredentialStateChangedEvent,
} from "@aries-framework/core";
import { AgentService } from "./agentService";

class CredentialService extends AgentService {
  onCredentialOfferReceived(
    callback: (event: CredentialExchangeRecord) => void
  ) {
    this.agent.events.on(
      CredentialEventTypes.CredentialStateChanged,
      async (event: CredentialStateChangedEvent) => {
        if (
          event.payload.credentialRecord.state === CredentialState.OfferReceived
        ) {
          callback(event.payload.credentialRecord);
        }
      }
    );
  }

  async acceptCredentialOffer(credentialRecordId: string) {
    await this.agent.credentials.acceptOffer({ credentialRecordId });
  }
}

export { CredentialService };
