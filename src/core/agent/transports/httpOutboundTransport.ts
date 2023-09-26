import type {
  OutboundTransport,
  Agent,
  AgentMessageReceivedEvent,
  OutboundPackage,
} from "@aries-framework/core";
import {
  AgentEventTypes,
  AriesFrameworkError,
  JsonEncoder,
  isValidJweStructure,
} from "@aries-framework/core";

/**
 * Browser/WebView compatible HTTP/HTTPS transport for DIDComm.
 */
class HttpOutboundTransport implements OutboundTransport {
  private agent!: Agent;
  private sendTimeoutMs: number;

  static readonly MISSING_ENDPOINT = "Missing endpoint in outbound package";
  static readonly UNSUPPORTED_ENDPOINT = "Malformed or unsupported endpoint";
  static readonly MALFORMED_RESPONSE =
    "Response received with an invalid DIDComm structure";
  static readonly NO_RESPONSE =
    "Expected a response but timed out waiting for one";
  static readonly UNEXPECTED_ERROR = "Error sending message to endpoint";

  supportedSchemes = ["http", "https"];

  constructor(sendTimeoutMs = 600 * 1000) {
    this.sendTimeoutMs = sendTimeoutMs;
  }

  async start(agent: Agent): Promise<void> {
    this.agent = agent;
  }

  async stop(): Promise<void> {}

  async sendMessage(outboundPackage: OutboundPackage) {
    if (!outboundPackage.endpoint) {
      throw new AriesFrameworkError(HttpOutboundTransport.MISSING_ENDPOINT);
    }

    const endpointSplit = outboundPackage.endpoint.split(":");
    if (
      !(
        endpointSplit.length > 0 &&
        this.supportedSchemes.includes(endpointSplit[0])
      )
    ) {
      throw new AriesFrameworkError(HttpOutboundTransport.UNSUPPORTED_ENDPOINT);
    }

    try {
      const abortController = new AbortController();
      const id = setTimeout(() => abortController.abort(), this.sendTimeoutMs);

      let response: Response | undefined;
      let responseMessage: string | undefined;
      try {
        // @TODO - foconnor: This should use this.agent.config.agentDependencies but we just use fetch and it makes life easier for now.
        response = await fetch(outboundPackage.endpoint, {
          method: "POST",
          body: JSON.stringify(outboundPackage.payload),
          headers: { "Content-type": this.agent.config.didCommMimeType },
          signal: abortController.signal,
        });
        clearTimeout(id);
        responseMessage = await response.text();
      } catch (error: any) {
        if (!(error.name == "AbortError")) {
          throw error;
        }
      }

      if (outboundPackage.responseRequested) {
        if (response !== undefined && responseMessage !== undefined) {
          const encryptedMessage = JsonEncoder.fromString(responseMessage);
          if (!isValidJweStructure(encryptedMessage)) {
            this.agent.config.logger.error(
              `${HttpOutboundTransport.MALFORMED_RESPONSE}: ${responseMessage}`
            );
            return;
          }
          this.agent.events.emit<AgentMessageReceivedEvent>(
            this.agent.context,
            {
              type: AgentEventTypes.AgentMessageReceived,
              payload: { message: encryptedMessage },
            }
          );
        } else {
          this.agent.config.logger.error(HttpOutboundTransport.NO_RESPONSE);
        }
      }
    } catch (error: any) {
      throw new AriesFrameworkError(
        `${HttpOutboundTransport.UNEXPECTED_ERROR} ${outboundPackage.endpoint}: ${error.message}`,
        { cause: error }
      );
    }
  }
}

export { HttpOutboundTransport };
