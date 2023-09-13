import type {
  Agent,
  OutboundTransport,
  OutboundPackage,
  Logger,
} from "@aries-framework/core";
import { LibP2p } from "./libp2p/libP2p";
import { getPeerFromStorage, savePeer } from "./lipP2p.peer";

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
    const existingPeerId = await getPeerFromStorage(agent);
    if (existingPeerId) {
      await this.libP2p.start(JSON.parse(existingPeerId.value));
    } else {
      await this.libP2p.start();
      const peerId = this.libP2p.getPeerJson();
      await savePeer(agent, peerId);
    }
    this.libP2p.setUsageStatusOfOutbound(true);
    this.logger.debug("Starting LibP2p outbound transport");
  }

  public async stop(): Promise<void> {
    this.libP2p.setUsageStatusOfOutbound(false);
    await this.libP2p.stop();
  }

  public async sendMessage(outboundPackage: OutboundPackage): Promise<void> {
    this.logger.debug(
      `Sending outbound message to endpoint '${outboundPackage.endpoint}', connection ID: ${outboundPackage.connectionId}`,
      {
        payload: outboundPackage.payload,
      }
    );
    return this.libP2p.sendMessage(outboundPackage);
  }
}
