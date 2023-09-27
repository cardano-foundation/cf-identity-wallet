import {
  AutoAcceptCredential,
  CredentialEventTypes,
  CredentialExchangeRecord,
  CredentialState,
  CredentialStateChangedEvent,
  ProposeCredentialOptions,
} from "@aries-framework/core";
import { LinkedDataProof } from "@aries-framework/core/build/modules/vc/models/LinkedDataProof";
import { CredentialDetails, CredentialShortDetails } from "../agent.types";
import { CredentialMetadataRecord } from "../modules";
import { AgentService } from "./agentService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../modules/generalStorage/repositories/credentialMetadataRecord.types";

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";

  onCredentialStateChanged(
    callback: (event: CredentialExchangeRecord) => void
  ) {
    this.agent.events.on(
      CredentialEventTypes.CredentialStateChanged,
      async (event: CredentialStateChangedEvent) => {
        callback(event.payload.credentialRecord);
      }
    );
  }

  /**
   * Role: holder, check to see if incoming credential offer received
   * @param credentialRecord
   */
  isCredentialOfferReceived(credentialRecord: CredentialExchangeRecord) {
    return (
      credentialRecord.state === CredentialState.OfferReceived &&
      !credentialRecord.autoAcceptCredential
    );
  }

  /**
   * Role: holder, check to see if incoming credential received
   * @param credentialRecord
   */
  isCredentialReceived(credentialRecord: CredentialExchangeRecord) {
    return (
      credentialRecord.state === CredentialState.CredentialReceived &&
      !credentialRecord.autoAcceptCredential
    );
  }

  isCredentialDone(credentialRecord: CredentialExchangeRecord) {
    return credentialRecord.state === CredentialState.Done;
  }

  isCredentialRequestSent(credentialRecord: CredentialExchangeRecord) {
    return (
      credentialRecord.state === CredentialState.RequestSent &&
      !credentialRecord.autoAcceptCredential
    );
  }

  async acceptCredentialOffer(credentialRecordId: string) {
    await this.agent.credentials.acceptOffer({ credentialRecordId });
  }

  async proposeCredential(
    connectionId: string,
    credentialFormats: ProposeCredentialOptions["credentialFormats"]
  ) {
    return this.agent.credentials.proposeCredential({
      protocolVersion: "v2",
      connectionId: connectionId,
      credentialFormats: credentialFormats,
      autoAcceptCredential: AutoAcceptCredential.Always,
    });
  }

  async getCredentials(
    isGetArchive = false
  ): Promise<CredentialShortDetails[]> {
    const listMetadatas =
      await this.agent.modules.generalStorage.getAllCredentialMetadata(
        isGetArchive
      );
    return listMetadatas.map((element: CredentialMetadataRecord) =>
      this.getCredentialShortDetails(element)
    );
  }

  getCredentialShortDetails(
    metadata: CredentialMetadataRecord
  ): CredentialShortDetails {
    return {
      nameOnCredential: metadata.nameOnCredential,
      id: metadata.id,
      colors: metadata.colors,
      issuanceDate: metadata.issuanceDate,
      issuerLogo: metadata.issuerLogo,
      credentialType: metadata.credentialType,
      status: metadata.status,
    };
  }

  async getCredentialRecordById(id: string): Promise<CredentialExchangeRecord> {
    return this.agent.credentials.getById(id);
  }

  async getCredentialDetailsById(id: string): Promise<CredentialDetails> {
    const metadata = await this.getMetadataById(id);
    const credentialRecord = await this.getCredentialRecordById(
      metadata.credentialRecordId
    );
    const w3cCredential =
      await this.agent.w3cCredentials.getCredentialRecordById(
        credentialRecord.credentials[0].credentialRecordId
      );
    const credentialSubject = w3cCredential.credential
      .credentialSubject as any as {
      degree: {
        education: string;
        type: string;
        givenName: string;
        familyName: string;
      };
    };
    const proof = w3cCredential.credential.proof as LinkedDataProof;
    return {
      ...this.getCredentialShortDetails(metadata),
      type: w3cCredential.credential.type,
      connection: credentialRecord.connectionId,
      expirationDate: w3cCredential.credential?.expirationDate,
      receivingDid: w3cCredential.credential.issuerId,
      credentialSubject: {
        degree: {
          education: "N/A",
          type: credentialSubject?.degree?.type ?? "N/A",
          name:
            `${credentialSubject?.degree?.givenName} ${credentialSubject?.degree?.familyName}` ??
            "N/A",
        },
      },
      proofType: proof?.type ?? "N/A",
      proofValue: proof?.jws ?? "N/A",
      credentialStatus: {
        revoked: false,
        suspended: false,
      },
    };
  }

  async createMetadata(data: CredentialMetadataRecordProps) {
    const metadataRecord = new CredentialMetadataRecord({
      ...data,
    });
    await this.agent.modules.generalStorage.saveCredentialMetadataRecord(
      metadataRecord
    );
  }

  async updateMetadata(
    credentialRecord: CredentialExchangeRecord
  ): Promise<CredentialShortDetails> {
    const metadata =
      await this.agent.modules.generalStorage.getCredentialMetadataByCredentialRecordId(
        credentialRecord.id
      );
    const w3cCredential =
      await this.agent.w3cCredentials.getCredentialRecordById(
        credentialRecord.credentials[0].credentialRecordId
      );
    const connection = await this.agent.connections.findById(
      credentialRecord?.connectionId ?? ""
    );
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }
    const credentialSubject = w3cCredential.credential.credentialSubject as any;
    const data = {
      credentialType:
        credentialSubject?.degree?.type ??
        w3cCredential.credential.type.toString() ??
        "",
      nameOnCredential:
        `${credentialSubject?.degree?.givenName} ${credentialSubject?.degree?.familyName}` ??
        "",
      status: CredentialMetadataRecordStatus.CONFIRMED,
    };
    await this.agent.modules.generalStorage.updateCredentialMetadata(
      metadata?.id,
      data
    );
    return {
      colors: metadata.colors,
      credentialType: data.credentialType,
      id: metadata.id,
      isArchived: metadata.isArchived ?? false,
      issuanceDate: metadata.issuanceDate,
      issuerLogo: connection?.imageUrl ?? undefined,
      nameOnCredential: data.nameOnCredential,
      status: data.status,
    };
  }

  async archiveCredential(id: string): Promise<void> {
    await this.agent.modules.generalStorage.updateCredentialMetadata(id, {
      isArchived: true,
    });
  }

  async deleteCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    await this.agent.credentials.deleteById(id);
    await this.agent.modules.generalStorage.deleteCredentialMetadata(id);
  }

  async restoreCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    await this.agent.modules.generalStorage.updateCredentialMetadata(id, {
      isArchived: false,
    });
  }

  private validArchivedCredential(metadata: CredentialMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${CredentialService.CREDENTIAL_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  private async getMetadataById(id: string): Promise<CredentialMetadataRecord> {
    const metadata =
      await this.agent.modules.generalStorage.getCredentialMetadata(id);
    if (!metadata) {
      throw new Error(
        `${CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG} ${id}`
      );
    }
    return metadata;
  }
}

export { CredentialService };
