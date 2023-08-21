import { Agent, Logger, InboundTransport, AriesFrameworkError } from "@aries-framework/core"
import { pipe } from "it-pipe"
import { toString } from "uint8arrays"
import {IncomingStreamData} from "@libp2p/interface/src/stream-handler";
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

  public async receiveMessage(data:  IncomingStreamData) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const _this = this;
      await pipe(
        data.stream,
        async function* (source) {
          for await (const buf of source) {
            const incoming = toString(buf.subarray());
            const parsed = JSON.parse(incoming);
            _this.logger.debug(`Received inbound message via LibP2p: ${parsed}`);
            await _this.agent.receiveMessage(parsed);
            yield buf
          }
        },
        data.stream
      )
    } catch (error) {
      if (error instanceof AriesFrameworkError) {
        this.logger.error("Error processing inbound message: " + error);
        throw error;
      }
      throw error;
    }
  }
}