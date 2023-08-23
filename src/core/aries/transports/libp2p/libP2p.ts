import { Pushable } from "it-pushable";
import { Libp2p } from "libp2p";
import { IncomingStreamData } from "@libp2p/interface/src/stream-handler";
import { OutboundPackage } from "@aries-framework/core";
import { Connection } from "@libp2p/interface/connection";
import { Stream } from "@libp2p/interface/src/connection";
import { LibP2pInboundTransport } from "../libP2pInboundTransport";
import { LibP2pOutboundTransport } from "../libP2pOutboundTransport";
import {LibP2pService} from "./libP2p.service";

// @TODO - config env or input from user
// eslint-disable-next-line no-undef
export const LIBP2P_RELAY = process.env.REACT_APP_LIBP2P_RELAY ?? "/dns/libp2p-relay-9aff91ec2cbd.herokuapp.com/tcp/443/wss/p2p/QmUDSANiD1VyciqTgUBTw9egXHAtmamrtR1sa8SNf4aPHa";
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
  public endpoint? : string;
  public peerId!: string;
  public inBoundTransport: LibP2pInboundTransport;
  public outBoundTransport: LibP2pOutboundTransport;

  constructor(public readonly libP2pService: LibP2pService) {
    this.inBoundTransport = new LibP2pInboundTransport(this);
    this.outBoundTransport = new LibP2pOutboundTransport(this);
    this.webRTCConnections = new Map<string, ILibP2pTools>();
  }

  static get libP2p() {
    if (!this.instance) {
      this.instance = new LibP2p(new LibP2pService());
    }
    return this.instance;
  }

  public setNode(node: Libp2p) {
    this.node = node;
  }

  public setEndpoint(endpoint: string) {
    this.endpoint = endpoint;
  }

  public setPeerId(peerId: string) {
    this.peerId = peerId;
  }

  /**
   * Get endpoint for libP2p. Created according to the rules of using relay
   * @param peerId
   */
  public getEndpoint(peerId: string) {
    return `${schemaPrefix}${LIBP2P_RELAY}/p2p-circuit/webrtc/p2p/${peerId}`;
  }

  public async initNode() {
    const node = await this.libP2pService.createNode();
    this.setNode(node);
    this.setPeerId(this.node.peerId.toString());
    return this;
  }

  public async start() {
    if(!this.node) {
      await this.initNode();
    }
    // event
    await this.node.handle("/aries/1.0.0", this.receiveMessage.bind(this));
    // this.eventConnectionOpen();
    // this.eventConnectionClose();
    return this;
  }

  // public eventConnectionOpen(callback?: (event: CustomEvent<Connection>) => void){
  //   this.node.addEventListener("connection:open", (event) => {
  //     if (callback) {
  //       callback(event);
  //     }
  //   })
  // }

  // public eventConnectionClose(callback?: (event: CustomEvent<Connection>) => void){
  //   this.node.addEventListener("connection:close", (event: CustomEvent<Connection>) => {
  //     const peerId = event.detail.remotePeer.toString();
  //     // Implement logic here
  //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //     const endpoint = this.getEndpoint(peerId);
  //     if (callback) {
  //       callback(event);
  //     }
  //     // inactivate connection
  //   })
  // }

  /*
    *  It is necessary to connect the socket via the relay to be able to communicate with other peers
   */
  public async advertising():Promise<string> {
    if (!this.node) {
      throw new Error("LibP2p node is not started")
    }
    if(this.endpoint) {
      return this.endpoint;
    }
    const node = this.node;
    await this.node.dial(this.libP2pService.multiaddr(LIBP2P_RELAY));
    const [advertisingTimeout, timeoutId] = this.libP2pService.timeOut("P2P advertising Timeout");
    const advertising: Promise<string> =  this.libP2pService.advertising(node, timeoutId);
    const endpoint = await Promise.race([advertising, advertisingTimeout]);
    if (endpoint) {
      this.setEndpoint(endpoint);
      return endpoint;
    }
    throw new Error("Can not advertising");
  }
  public async receiveMessage(data: IncomingStreamData): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    await this.libP2pService.pipe(
      data.stream,
      async function* (source) {
        for await (const buf of source) {
          const incoming = _this.libP2pService.toString(buf.subarray());
          const parsed = JSON.parse(incoming);
          await _this.inBoundTransport.receiveMessage(parsed)
          yield buf
        }
      },
      data.stream
    )
  }

  public async pipeMessage(sender: Pushable<Uint8Array, void, unknown>, outgoingStream: Stream) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.libP2pService.pipe(sender, outgoingStream)
  }

  private checkConditionsSendMessages(): void {
    if (!this.node) {
      throw new Error("Not initialized node");
    }
    if (!this.peerId) {
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
      const ma = this.libP2pService.multiaddr(getEndpoint)
      const connection = await this.node?.dial(ma);
      const outgoingStream = await connection.newStream(["/aries/1.0.0"])
      const sender = this.libP2pService.pushable();
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
    libP2pTools.sender.push(this.libP2pService.fromString(JSON.stringify(outboundPackage.payload)));
  }
}