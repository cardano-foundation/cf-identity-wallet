import type {
  Agent,
  OutboundTransport,
  OutboundPackage,
  Logger,
} from "@aries-framework/core";
import { MeerkatTransport } from "./meerkat/merkatTransport";

export class MeerkatOutboundTransport implements OutboundTransport {
  private agent!: Agent;
  private logger!: Logger;
  private meerkatTransport!: MeerkatTransport;

  public supportedSchemes: string[] = ["meerkat"];

  constructor(meerkatTransport: MeerkatTransport) {
    this.meerkatTransport = meerkatTransport;
  }

  public async start(agent: Agent): Promise<void> {
    this.agent = agent;
    this.logger = this.agent.config.logger;
  }

  public async stop(): Promise<void> {
    this.meerkatTransport.close();
  }

  public async sendMessage(outboundPackage: OutboundPackage): Promise<void> {
    this.logger.debug(
      `Sending outbound message to endpoint '${outboundPackage.endpoint}', connection ID: ${outboundPackage.connectionId}`,
      {
        payload: outboundPackage.payload,
      }
    );
    return this.meerkatTransport.sendMessage(outboundPackage);
  }
}
