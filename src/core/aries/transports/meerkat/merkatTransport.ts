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

  constructor(agent: Agent, identifier?: string) {
    this.agent = agent;
    this.meerkat = new Meerkat({
      announce: ANNOUNCE_LIST,
      identifier,
    });
    this.logger = this.agent.config.logger;

    this.meerkat.on("connections", (clients) => {
      this.logger.debug(`Connections count: ${clients}`);
      this.logger.debug(`Server ready: ${this.meerkat.identifier}`);
    });

    this.meerkat.register(
      MESSAGE_CHANNEL,
      (address: string, message: { [key: string]: unknown }) => {
        this.logger.debug(`Message received: ${JSON.stringify(message)}`);
        this.logger.debug(`Transmitted by the server: ${address}`);
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
        this.logger.debug("Connected to server: " + endpoint);
        try {
          peerConnect.rpc(
            endpoint,
            MESSAGE_CHANNEL,
            outboundPackage.payload,
            (response: unknown) => {
              this.logger.debug("Response from server: " + response);
              resolve(response);
            }
          );
        } catch (error) {
          reject(error);
        }
      });
    });
    peerConnect.close();
  }

  async close() {
    this.meerkat.close();
  }

  getEndpoint(): string {
    return schemaPrefix + this.meerkat.identifier;
  }

  getIdentifier(): string {
    return this.meerkat.identifier;
  }
}

export { MeerkatTransport as MeerkatTransport };
