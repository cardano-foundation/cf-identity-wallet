import {
  BasicMessageEventTypes,
  BasicMessageStateChangedEvent,
  ConnectionType,
} from "@aries-framework/core";
import { AgentService } from "./agentService";

class MessageService extends AgentService {
  async getMediatorConnectionId(): Promise<string | undefined> {
    const mediatorConnections =
      await this.agent.connections.findAllByConnectionTypes([
        ConnectionType.Mediator,
      ]);
    const connection = mediatorConnections.find(
      (connection) => connection.state === "completed"
    );
    if (connection) {
      return connection.id;
    }
  }

  async pickupMessagesV1FromMediator() {
    const mediatorConnectionId = await this.getMediatorConnectionId();
    this.agent.config.logger.info("Picking up messages from mediator", {
      mediatorConnectionId,
    });
    if (mediatorConnectionId) {
      return this.agent.messagePickup.pickupMessages({
        connectionId: mediatorConnectionId,
        protocolVersion: "v1",
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
