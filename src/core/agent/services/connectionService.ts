import { ConnectionEventTypes, ConnectionRecord, ConnectionStateChangedEvent, OutOfBandRecord } from "@aries-framework/core";
// import { LibP2p } from "../transports/libp2p/libP2p";
// import { LibP2pOutboundTransport } from "../transports/libP2pOutboundTransport";
import { AgentService } from "./agentService";

class ConnectionService extends AgentService {
  // static readonly NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG =
  //   "No domain found in config";
  static readonly COULD_NOT_CREATE_OOB_VIA_MEDIATOR = "Could not create new mediator oob invitation";

  onConnectionStateChange(
    callback: (event: ConnectionStateChangedEvent) => void
  ) {
    this.agent.events.on(
      ConnectionEventTypes.ConnectionStateChanged,
      async (event: ConnectionStateChangedEvent) => {
        callback(event);
      }
    );
  }

  async receiveInvitationFromUrl(url: string): Promise<{
    outOfBandRecord: OutOfBandRecord;
    connectionRecord?: ConnectionRecord;
  }> {
    return this.agent.oob.receiveInvitationFromUrl(url, {
      autoAcceptConnection: true,
      autoAcceptInvitation: true,
      reuseConnection: true,
    });
  }

  async acceptRequest(connectionId: string) {
    await this.agent.connections.acceptRequest(connectionId);
  }

  async createMediatorInvitation() {
    const record = await this.agent.oob.createInvitation();
    if (!record) {
      throw new Error(ConnectionService.COULD_NOT_CREATE_OOB_VIA_MEDIATOR);
    }

    const invitationUrl = record.outOfBandInvitation.toUrl({
      domain: "didcomm://invite",
    });

    return {
      record,
      invitation: record.outOfBandInvitation,
      invitationUrl,
    };
  }


  // @TODO - foconnor: fix and add tests;
  // These libs are ESM exported and not working in Jest right now - can fix later.
  
  // async enableP2P() {
  //   const inBoundTransport = LibP2p.libP2p.inBoundTransport;
  //   await inBoundTransport.start(this.agent);
  //   this.agent.registerInboundTransport(inBoundTransport);

  //   const outBoundTransport = new LibP2pOutboundTransport(LibP2p.libP2p);
  //   await outBoundTransport.start(this.agent);
  //   this.agent.registerOutboundTransport(outBoundTransport);
  // }
  
  // async createNewWebRtcInvitation() {
  //   const domains = this.agent.config.endpoints;
  //   const libP2pDomain = domains.find((domain) => domain.includes("libp2p"));
  //   if (!libP2pDomain) {
  //     throw new Error(ConnectionService.NOT_FOUND_DOMAIN_CONFIG_ERROR_MSG);
  //   }

  //   const createInvitation = await this.agent.oob.createInvitation({
  //     autoAcceptConnection: false,
  //   });

  //   return createInvitation.outOfBandInvitation.toUrl({
  //     domain: libP2pDomain,
  //   });
  // }
}

export { ConnectionService }
