import { Agent, Logger, OutboundPackage } from "@aries-framework/core";
import Meerkat from "@fabianbormann/meerkat";
const schemaPrefix = "meerkat:/";

const ANNOUNCE_LIST = [
  "ws://tracker.files.fm:7072/announce",
  "wss://tracker.openwebtorrent.com/announce",
  "wss://tracker.btorrent.xyz/",
  "https://tracker.boostpool.io",
];
const MESSAGE_CHANNEL = "message";

class MeerkatTransport {
  private meerkat!: Meerkat;
  private agent!: Agent;
  private logger!: Logger;

  constructor(agent: Agent, identifier?: string, seed?: string) {
    this.agent = agent;
    this.meerkat = new Meerkat({
      announce: ANNOUNCE_LIST,
      identifier,
      seed,
    });
    this.logger = this.agent.config.logger;

    this.meerkat.on("connections", (clients) => {
      this.logger.info(`Connections count: ${clients}`);
      this.logger.info(`Server ready: ${this.meerkat.identifier}`);
    });

    this.meerkat.register(
      MESSAGE_CHANNEL,
      (address: string, message: { [key: string]: unknown }) => {
        this.logger.info(`Message received: ${JSON.stringify(message)}`);
        this.logger.info(`Transmitted by the server: ${address}`);
        this.agent.receiveMessage(message);
      }
    );
  }

  async sendMessage(outboundPackage: OutboundPackage) {
    const endpoint = outboundPackage.endpoint?.replace(schemaPrefix, "");
    if (!endpoint) return;
    const peerConnect = new Meerkat({
      identifier: endpoint,
      announce: ANNOUNCE_LIST,
    });
    await new Promise((resolve, reject) => {
      peerConnect.on("server", () => {
        this.logger.info("Connected to server: " + endpoint);
        try {
          peerConnect.rpc(
            endpoint,
            MESSAGE_CHANNEL,
            outboundPackage.payload,
            (_response: unknown) => {
              resolve(true);
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
    peerConnect.removeAllListeners();
    peerConnect.close();
  }

  async close() {
    this.meerkat.removeAllListeners();
    this.meerkat.close();
  }

  getEndpoint(): string {
    return schemaPrefix + this.meerkat.identifier;
  }

  getProfile(): string {
    return this.meerkat.identifier + ":" + this.meerkat.seed;
  }
}

export { MeerkatTransport as MeerkatTransport };
