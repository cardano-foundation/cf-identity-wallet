import {
  PeerConnectionMetadataRecord,
  PeerConnectionMetadataRecordProps,
} from "../records/peerConnectionMetadataRecord";
import { AgentService } from "./agentService";

class PeerConnectionService extends AgentService {
  async getPeerConnections(): Promise<PeerConnectionMetadataRecord[]> {
    return await this.peerConnectionStorage.getAllPeerConnectionMetadata();
  }

  async getPeerConnection(
    identifier: string
  ): Promise<PeerConnectionMetadataRecord> {
    return await this.peerConnectionStorage.getPeerConnectionMetadata(
      identifier
    );
  }

  async createPeerConnection(
    metadata: PeerConnectionMetadataRecordProps
  ): Promise<PeerConnectionMetadataRecord> {
    await this.peerConnectionStorage.createPeerConnectionMetadataRecord({
      ...metadata,
    });
    return await this.getPeerConnection(metadata.id);
  }

  async deletePeerConnection(identifier: string): Promise<void> {
    await this.peerConnectionStorage.deletePeerConnectionMetadataRecord(
      identifier
    );
  }

  async updatePeerConnection(
    identifier: string,
    data: Pick<
      PeerConnectionMetadataRecordProps,
      "name" | "url" | "selectedAid" | "iconB64" | "isPending"
    >
  ): Promise<PeerConnectionMetadataRecord> {
    await this.peerConnectionStorage.updatePeerConnectionMetadata(
      identifier,
      data
    );
    return await this.getPeerConnection(identifier);
  }
}

export { PeerConnectionService };
