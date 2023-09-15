import { Pushable } from "it-pushable";
import { Libp2p } from "libp2p";
import { IncomingStreamData } from "@libp2p/interface/src/stream-handler";
import { OutboundPackage } from "@aries-framework/core";
import { Connection } from "@libp2p/interface/connection";
import { Stream } from "@libp2p/interface/src/connection";
import { PeerId } from "@libp2p/interface/peer-id";
import { LibP2pService } from "./libP2p.service";
import { LibP2pInboundTransport } from "../libP2pInboundTransport";
import { PeerIdJSON } from "./libP2p.types";

// @TODO - config env or input from user
export const LIBP2P_RELAY =
  // eslint-disable-next-line no-undef
  process.env.REACT_APP_LIBP2P_RELAY ??
  "/ip4/127.0.0.1/tcp/51986/ws/p2p/QmUDSANiD1VyciqTgUBTw9egXHAtmamrtR1sa8SNf4aPHa";
export const schemaPrefix = "libp2p:/";

interface ILibP2pTools {
  sender: Pushable<Uint8Array, void, unknown>;
  outgoingStream: Stream;
  connection: Connection;
  isActive?: boolean;
}

interface IUsageStatusOfNode {
  usageStatusOfInbound: boolean;
  usageStatusOfOutbound: boolean;
}

export class LibP2p {
  private static instance: LibP2p;
  private node!: Libp2p;
  private webRTCConnections: Map<string, ILibP2pTools>;
  public endpoint?: string;
  public peerId!: string;
  public inBoundTransport: LibP2pInboundTransport;
  public isStart = false;
  public usageStatus: IUsageStatusOfNode = {
    usageStatusOfInbound: false,
    usageStatusOfOutbound: false,
  };
  public static readonly ADS_TIMEOUT_ERROR_MSG = "P2P advertising Timeout";
  public static readonly LIBP2P_NODE_NOT_STARTED_ERROR_MSG =
    "LibP2p node is not started";
  public static readonly CAN_NOT_ADS_ERROR_MSG = "Can not advertising";
  public static readonly NOT_INIT_NODE_ERROR_MSG = "Not initialized node";
  public static readonly NOT_FOUND_PEER_ID_ERROR_MSG = "Not found peerId";
  public static readonly ENDPOINT_IS_NOT_DEFINED_ERROR_MSG =
    "Endpoint is not defined";

  constructor(public readonly libP2pService: LibP2pService) {
    this.inBoundTransport = new LibP2pInboundTransport(this);
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

  public setUsageStatusOfInbound(status: boolean) {
    this.usageStatus.usageStatusOfInbound = status;
  }
  public setUsageStatusOfOutbound(status: boolean) {
    this.usageStatus.usageStatusOfOutbound = status;
  }

  /**
   * Get endpoint for libP2p. Created according to the rules of using relay
   * @param peerId
   */
  public getEndpoint(peerId: string) {
    return peerId
      ? `${schemaPrefix}${LIBP2P_RELAY}/p2p-circuit/webrtc/p2p/${peerId}`
      : undefined;
  }

  public async initNode(peerId?: PeerId) {
    const node = await this.libP2pService.createNode(peerId);
    this.setNode(node);
    this.setPeerId(this.node.peerId.toString());
    return this;
  }

  public async start(peerIdJSON?: PeerIdJSON) {
    if (this.isStart) return this;
    if (!this.node || !this.node.isStarted()) {
      if (peerIdJSON) {
        const peerId = await this.libP2pService.createFromJSON(peerIdJSON);
        await this.initNode(peerId);
      } else {
        await this.initNode();
      }
    }
    this.isStart = true;
    return this;
  }

  public getPeerJson(): PeerIdJSON {
    return this.libP2pService.getPeerJson(this.node);
  }

  public async stop(): Promise<void> {
    if (!this.isStart) return;
    if (
      this.node &&
      !this.usageStatus.usageStatusOfOutbound &&
      !this.usageStatus.usageStatusOfInbound
    ) {
      await this.node.stop();
      this.isStart = false;
    }
  }

  public async handleInboundMessage() {
    // event
    await this.node.handle("/aries/1.0.0", this.receiveMessage.bind(this));
  }

  /*
   *  It is necessary to connect the socket via the relay to be able to communicate with other peers
   */
  public async advertising(): Promise<string> {
    if (!this.node) {
      throw new Error(LibP2p.LIBP2P_NODE_NOT_STARTED_ERROR_MSG);
    }
    if (this.endpoint) {
      return this.endpoint;
    }
    const node = this.node;
    await this.node.dial(this.libP2pService.multiaddr(LIBP2P_RELAY));
    const [advertisingTimeout, timeoutId] = this.libP2pService.timeOut(
      LibP2p.ADS_TIMEOUT_ERROR_MSG
    );
    const advertising: Promise<string> = this.libP2pService.advertising(
      node,
      timeoutId
    );
    const endpoint = await Promise.race([advertising, advertisingTimeout]);
    if (endpoint) {
      this.setEndpoint(endpoint);
      return endpoint;
    }
    throw new Error(LibP2p.CAN_NOT_ADS_ERROR_MSG);
  }
  public async receiveMessage(data: IncomingStreamData): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    await this.libP2pService.pipe(
      data.stream,
      async function* (source) {
        for await (const buf of source) {
          const incoming = new TextDecoder().decode(buf.subarray());
          const parsed = JSON.parse(incoming);
          await _this.inBoundTransport.receiveMessage(parsed);
          yield buf;
        }
      },
      data.stream
    );
  }

  public async pipeMessage(
    sender: Pushable<Uint8Array, void, unknown>,
    outgoingStream: Stream
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.libP2pService.pipe(sender, outgoingStream);
  }

  private checkConditionsSendMessages(): void {
    if (!this.node) {
      throw new Error(LibP2p.NOT_INIT_NODE_ERROR_MSG);
    }
    if (!this.peerId) {
      throw new Error(LibP2p.NOT_FOUND_PEER_ID_ERROR_MSG);
    }
  }

  public async sendMessage(outboundPackage: OutboundPackage) {
    this.checkConditionsSendMessages();
    if (!outboundPackage.endpoint) {
      throw new Error(LibP2p.ENDPOINT_IS_NOT_DEFINED_ERROR_MSG);
    }
    const getEndpoint = outboundPackage.endpoint?.replace(schemaPrefix, "");
    let libP2pTools: ILibP2pTools | undefined =
      this.webRTCConnections.get(getEndpoint);
    if (!libP2pTools) {
      const ma = this.libP2pService.multiaddr(getEndpoint);
      const connection = await this.node.dial(ma);
      const outgoingStream = await connection.newStream(["/aries/1.0.0"]);
      const sender = this.libP2pService.pushable();
      await this.pipeMessage(sender, outgoingStream);
      libP2pTools = {
        sender,
        outgoingStream,
        connection,
        isActive: true,
      };
      this.webRTCConnections = this.webRTCConnections.set(
        getEndpoint,
        libP2pTools
      );
    }
    libP2pTools.sender.push(
      new TextEncoder().encode(JSON.stringify(outboundPackage.payload))
    );
  }
}
