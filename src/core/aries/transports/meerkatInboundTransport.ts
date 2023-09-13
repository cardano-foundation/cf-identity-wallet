import { Agent, InboundTransport, Logger } from "@aries-framework/core";
import { MeerkatTransport } from "./meerkat/merkatTransport";

export class MeerkatInboundTransport implements InboundTransport {
  private agent!: Agent;
  private logger!: Logger;
  private meerkatTransport!: MeerkatTransport;

  constructor(meerkatTransport: MeerkatTransport) {
    this.meerkatTransport = meerkatTransport;
  }

  public async start(agent: Agent): Promise<void> {
    this.agent = agent;
    this.logger = this.agent.config.logger;
    const endpoint = this.meerkatTransport.getEndpoint();
    if (endpoint) {
      const endpoints = this.agent.config.endpoints;
      this.agent.config.endpoints = [...endpoints, endpoint];
    }
    this.logger.debug("Starting LibP2p inbound transport agent");
  }

  public async stop(): Promise<void> {
    this.meerkatTransport.close();
  }
}
