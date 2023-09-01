import { multiaddr } from "@multiformats/multiaddr";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { pushable } from "it-pushable";
import { pipe } from "it-pipe";
import { mplex } from "@libp2p/mplex";
import { createLibp2p, Libp2p } from "libp2p";
import { circuitRelayTransport } from "libp2p/circuit-relay";
import { noise } from "@chainsafe/libp2p-noise";
import { identifyService } from "libp2p/identify";
import { Libp2pOptions } from "libp2p/src/index";

export class LibP2pService {
  public multiaddr = multiaddr;
  public pushable = pushable;
  public pipe = pipe;
  public mplex = mplex;
  public noise = noise;

  public async createNode() {
    const options: Libp2pOptions = {
      addresses: {
        listen: ["/webrtc"],
      },
      transports: [
        webSockets({
          filter: filters.all,
        }),
        webRTC(),
        circuitRelayTransport({
          discoverRelays: 1,
        }),
      ],
      connectionEncryption: [noise()],
      streamMuxers: [mplex()],
      connectionGater: {
        denyDialMultiaddr: () => {
          return false;
        },
      },
      services: {
        identify: identifyService(),
      },
      start: true,
    };
    return createLibp2p(options);
  }

  public getNodeEndpoint(node: Libp2p): string {
    return node.getMultiaddrs()?.[0]?.toString() ?? null;
  }

  public timeOut(message: string): [Promise<void>, number] {
    let timeoutId = 0;
    const funcTimeout = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(
        () => {
          reject(new Error(message));
        },
        5 * 1000,
        message
      );
    });
    return [funcTimeout, timeoutId];
  }

  public async advertising(node: Libp2p, timeoutId: number): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    return new Promise(function (resolve, reject) {
      return node.addEventListener("self:peer:update", () => {
        const endpoint = _this.getNodeEndpoint(node);
        if (!endpoint) {
          return reject("Not found endpoint");
        }
        clearTimeout(timeoutId);
        resolve(endpoint);
      });
    });
  }
}
