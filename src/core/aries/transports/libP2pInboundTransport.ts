import { Agent, Logger, InboundTransport } from "@aries-framework/core"
import { LibP2p } from "./libp2p/libP2p";

export class LibP2pInboundTransport implements InboundTransport {
  private agent!: Agent;
  private logger!: Logger;
  private libP2p!: LibP2p;
  constructor(libP2p: LibP2p) {
    this.libP2p = libP2p;
  }

  public async start(agent: Agent): Promise<void> {
    try {
      const agentConfig = agent.config;
      this.logger = agentConfig.logger;
      this.agent = agent;
      await this.libP2p.start();
      await this.libP2p.handleInboundMessage();
      await this.libP2p.advertising();
      const endpoint = this.libP2p.getEndpoint(this.libP2p.peerId);
      if (endpoint){
        this.agent.config.endpoints = [endpoint];
      }
      this.logger.debug("Starting LibP2p inbound transport agent");
    }
    catch (e) {
      this.logger.error(`Error starting LibP2p inbound transport agent: ${e}`);
    }
  }

  public async stop(): Promise<void> {
    // implement stop
    return new Promise((resolve, ) => { resolve() })
  }

  public async receiveMessage(data: unknown) {
    this.logger.debug(`Received inbound message via LibP2p: ${data}`);
    await this.agent.receiveMessage(data);
  }
}