import {
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  ConnectionType,
  DidExchangeState,
} from "@aries-framework/core";
import { AgentService } from "./agentService";

class MessageService extends AgentService {
  async getMediatorConnectionId(): Promise<string | undefined> {
    const mediatorConnections =
      await this.agent.connections.findAllByConnectionTypes([
        ConnectionType.Mediator,
      ]);
    const connection = mediatorConnections.find(
      (connection) => connection.state === DidExchangeState.Completed
    );
    if (connection) {
      return connection.id;
    }
  }

  async pickupMessagesFromMediator(protocolVersion: "v1" | "v2" = "v2") {
    const mediatorConnectionId = await this.getMediatorConnectionId();
    if (mediatorConnectionId) {
      return this.agent.messagePickup.pickupMessages({
        connectionId: mediatorConnectionId,
        protocolVersion,
      });
    }
  }

  onBasicMessageStateChanged(
    callback: (event: BasicMessageStateChangedEvent) => void
  ) {
    this.agent.events.on(
      BasicMessageEventTypes.BasicMessageStateChanged,
      async (event: BasicMessageStateChangedEvent) => {
        callback(event);
      }
    );
  }

  async sendMessage(connectionId: string, message: string) {
    return this.agent.basicMessages.sendMessage(connectionId, message);
  }
}

export { MessageService };
