import { multiaddr } from "@multiformats/multiaddr";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { Pushable, pushable } from "it-pushable";
import { pipe } from "it-pipe";
import { mplex } from "@libp2p/mplex";
import { createLibp2p, Libp2p } from "libp2p";
import { circuitRelayTransport } from "libp2p/circuit-relay";
import { noise } from "@chainsafe/libp2p-noise";
import { identifyService } from "libp2p/identify";
import { IncomingStreamData } from "@libp2p/interface/src/stream-handler";
import { OutboundPackage} from "@aries-framework/core";
import { Connection } from "@libp2p/interface/connection";
import { fromString } from "uint8arrays";
import { Stream } from "@libp2p/interface/src/connection";
import { Libp2pOptions } from "libp2p/src/index";
import { LibP2pInboundTransport } from "../libP2pInboundTransport";
import { LibP2pOutboundTransport } from "../libP2pOutboundTransport";
export const protocol = "webrtc"
export const adsTimeout = 15 * 1000
// @TODO - config env or input from user
// eslint-disable-next-line no-undef
export const LIBP2P_RELAY = process.env.REACT_APP_LIBP2P_RELAY ?? "/dns/libp2p-relay-9aff91ec2cbd.herokuapp.com/tcp/443/wss/p2p/12D3KooWNUif5TCCGgRkNj5uzDKjEDRk9eNGcCVTor1vpaMzTdNg";
export const schemaPrefix = "libp2p:/";

interface ILibP2pTools {
  sender:  Pushable<Uint8Array, void, unknown>;
  outgoingStream: Stream;
  connection: Connection;
  isActive?: boolean;
}


export class LibP2p {
  private static instance: LibP2p;
  private node!: Libp2p;
  private webRTCConnections: Map<string, ILibP2pTools>;
  private endpoint? : string;
  public peerId!: string;
  public inBoundTransport: LibP2pInboundTransport;
  public outBoundTransport: LibP2pOutboundTransport;
  public sender = pushable()
  constructor() {
    this.inBoundTransport = new LibP2pInboundTransport(this);
    this.outBoundTransport = new LibP2pOutboundTransport(this);
    this.webRTCConnections = new Map<string, ILibP2pTools>();
  }

  static get libP2p() {
    if (!this.instance) {
      this.instance = new LibP2p();
    }
    return this.instance;
  }

  /**
   * Get endpoint for libP2p. Created according to the rules of using relay
   * @param peerId
   */
  static getEndpoint(peerId: string) {
    return `${schemaPrefix}${LIBP2P_RELAY}/p2p-circuit/webrtc/p2p/${peerId}`;
  }

  public async initNode(peerId?: string) {
    const options: Libp2pOptions = {
      addresses: {
        listen: [
          "/webrtc"
        ]
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
          return false
        }
      },
      services: {
        identify: identifyService()
      }
    };
    if (peerId) {
      options.peerId = peerId;
    }
    this.node = await createLibp2p(options);
    this.peerId = this.node.peerId.toString();
    return this;
  }

  public async start() {
    if(!this.node) {
      await this.initNode();
    }
    await this.node.start()
    // event
    await this.node.handle("/aries/1.0.0", this.receiveMessage.bind(this));
    this.eventConnectionOpen();
    this.eventConnectionClose();
    return this;
  }

  public eventConnectionOpen(callback?: (event: CustomEvent<Connection>) => void){
    this.node.addEventListener("connection:open", (event) => {
      if (callback) {
        callback(event);
      }
    })
  }

  public eventConnectionClose(callback?: (event: CustomEvent<Connection>) => void){
    this.node.addEventListener("connection:close", (event: CustomEvent<Connection>) => {
      const peerId = event.detail.remotePeer.toString();
      // Implement logic here
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const endpoint = LibP2p.getEndpoint(peerId);
      if (callback) {
        callback(event);
      }
      // inactivate connection
    })

  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async closeConnection(peerId: string) {
    // implement logic here
  }

  /*
    *  It is necessary to connect the socket via the relay to be able to communicate with other peers
   */
  public async advertising():Promise<string> {
    if(!this.node) {
      await this.start();
    }
    if (!this.node) {
      throw new Error("LibP2p node is not started")
    }
    if(this.endpoint) {
      return this.endpoint;
    }
    const node = this.node;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    let timeoutId: number
    await this.node.dial(multiaddr(LIBP2P_RELAY));
    const advertisingTimeout = new Promise<void>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject("P2P advertising Timeout")
      }, adsTimeout, "P2P advertising Timeout");
    });

    const advertising: Promise<string> =  new Promise(function(resolve, reject) {
      return node.addEventListener("self:peer:update", () => {
        const endpoint = node.getMultiaddrs()?.[0]?.toString() ?? null;
        if (!endpoint) {
          return reject("Not found endpoint");
        }
        _this.endpoint = endpoint;
        clearTimeout(timeoutId);
        resolve(endpoint);
      })
    });
    const endpoint = await Promise.race([advertising, advertisingTimeout]);
    if (endpoint) {
      return endpoint;
    }
    throw new Error("Can not advertising");
  }
  public async receiveMessage(data: IncomingStreamData): Promise<void> {
    return this.inBoundTransport.receiveMessage(data)
  }

  public async pipeMessage(sender: Pushable<Uint8Array, void, unknown>, outgoingStream: Stream) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    pipe(sender, outgoingStream)
  }

  private checkConditionsSendMessages(): void {
    if (!this.node) {
      throw new Error("Not initialized node");
    }
    if (!this.node.peerId) {
      throw new Error("Not initialized peerId");
    }
  }

  public async sendMessage(outboundPackage: OutboundPackage) {
    this.checkConditionsSendMessages();
    if(!outboundPackage.endpoint){
      throw new Error("Endpoint is not defined");
    }
    const getEndpoint = outboundPackage.endpoint?.replace(schemaPrefix, "");
    let libP2pTools: ILibP2pTools | undefined = this.webRTCConnections.get(getEndpoint);
    if (!libP2pTools) {
      const ma = multiaddr(getEndpoint)
      const connection = await this.node?.dial(ma);
      const outgoingStream = await connection.newStream(["/aries/1.0.0"])
      const sender = pushable();
      await this.pipeMessage(sender, outgoingStream);
      libP2pTools = {
        sender,
        outgoingStream,
        connection,
        isActive: true
      }
      // Implement logic for check connection
      // if (!libP2pTools?.isActive) {
      //   throw new Error("Connection is not active");
      // }
      this.webRTCConnections = this.webRTCConnections.set(getEndpoint, libP2pTools);
    }
    libP2pTools.sender.push(fromString(JSON.stringify(outboundPackage.payload)));
  }
}