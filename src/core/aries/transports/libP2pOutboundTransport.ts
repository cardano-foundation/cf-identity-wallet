import type { Agent, OutboundTransport, OutboundPackage, Logger } from "@aries-framework/core";
import { LibP2p } from "./libp2p/libP2p";

export class LibP2pOutboundTransport implements OutboundTransport {
  private agent!: Agent;
  private logger!: Logger;

  public supportedSchemes: string[] = ["libp2p"];
  private libP2p!: LibP2p;
  constructor(libP2p: LibP2p) {
    this.libP2p = libP2p;
  }

  public async start(agent: Agent): Promise<void> {
    this.agent = agent;
    this.logger = this.agent.config.logger;
    this.logger.debug("Starting LibP2p outbound transport");
  }

  public async stop(): Promise<void> {
    // implement stop
    return new Promise((resolve, ) => { resolve() });
  }

  public async sendMessage(outboundPackage: OutboundPackage): Promise<void> {
    this.logger.debug(`Sending outbound message to endpoint '${outboundPackage.endpoint}', connection ID: ${outboundPackage.connectionId}`, {
      payload: outboundPackage.payload,
    })
    return this.libP2p.sendMessage(outboundPackage);
  }
}