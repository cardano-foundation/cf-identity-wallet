import { Agent, Logger, InboundTransport } from "@aries-framework/core";
import { LibP2p } from "./libp2p/libP2p";
import { getPeerFromStorage, savePeer } from "./lipP2p.peer";

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
    const existingPeerId = await getPeerFromStorage(agent);
    if (existingPeerId) {
      await this.libP2p.start(JSON.parse(existingPeerId.value));
    } else {
      await this.libP2p.start();
      const peerId = this.libP2p.getPeerJson();
      await savePeer(agent, peerId);
    }
    await this.libP2p.handleInboundMessage();
    await this.libP2p.advertising();
    this.libP2p.setUsageStatusOfInbound(true);
    const endpoint = this.libP2p.getEndpoint(this.libP2p.peerId);
    if (endpoint) {
      const endpoints = this.agent.config.endpoints;
      this.agent.config.endpoints = [...endpoints, endpoint];
    }
    this.logger.debug("Starting LibP2p inbound transport agent");
  }

  public async stop(): Promise<void> {
    this.libP2p.setUsageStatusOfInbound(false);
    await this.libP2p.stop();
  }

  public async receiveMessage(data: unknown) {
    this.logger.debug(`Received inbound message via LibP2p: ${data}`);
    await this.agent.receiveMessage(data);
  }
}
