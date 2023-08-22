import { Agent, Logger, InboundTransport, AriesFrameworkError } from "@aries-framework/core"
import { LibP2p } from "./libp2p/libP2p";

export class LibP2pInboundTransport implements InboundTransport {
  private agent!: Agent;
  private logger!: Logger;
  private libP2p!: LibP2p;
  constructor(libP2p: LibP2p) {
    this.libP2p = libP2p;
  }

  public async start(agent: Agent): Promise<void> {
    const agentConfig = agent.config;
    this.logger = agentConfig.logger;
    this.agent = agent;
    this.logger.debug("Starting LibP2p inbound transport agent");
  }

  public async stop(): Promise<void> {
    // implement stop
    return new Promise((resolve, ) => { resolve() })
  }

  public async receiveMessage(data: unknown) {
    try {
      this.logger.debug(`Received inbound message via LibP2p: ${data}`);
      await this.agent.receiveMessage(data);
    } catch (error) {
      if (error instanceof AriesFrameworkError) {
        this.logger.error("Error processing inbound message: " + error);
        throw error;
      }
    }
  }
}