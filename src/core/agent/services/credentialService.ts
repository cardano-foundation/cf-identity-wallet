import { AgentServicesProps } from "../agent.types";
import { AgentService } from "./agentService";
import { CredentialMetadataRecordProps } from "../records/credentialMetadataRecord.types";
import {
  CredentialShortDetails,
  ACDCDetails,
  CredentialStatus,
} from "./credentialService.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { getCredentialShortDetails, OnlineOnly } from "./utils";
import {
  CredentialStorage,
  IdentifierStorage,
  NotificationStorage,
} from "../records";
import { AcdcStateChangedEvent, EventTypes } from "../event.types";
import { IdentifierType } from "./identifier.types";

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";
  static readonly CREDENTIAL_NOT_FOUND =
    "Credential with given SAID not found on KERIA";

  protected readonly credentialStorage: CredentialStorage;
  protected readonly notificationStorage!: NotificationStorage;
  protected readonly identifierStorage!: IdentifierStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    credentialStorage: CredentialStorage,
    notificationStorage: NotificationStorage,
    identifierStorage: IdentifierStorage
  ) {
    super(agentServiceProps);
    this.credentialStorage = credentialStorage;
    this.notificationStorage = notificationStorage;
    this.identifierStorage = identifierStorage;
  }

  onAcdcStateChanged(callback: (event: AcdcStateChangedEvent) => void) {
    this.props.eventEmitter.on(EventTypes.AcdcStateChanged, callback);
  }

  async getCredentials(
    isGetArchive = false
  ): Promise<CredentialShortDetails[]> {
    const listMetadatas = await this.credentialStorage.getAllCredentialMetadata(
      isGetArchive
    );
    return listMetadatas.map((element: CredentialMetadataRecord) =>
      this.getCredentialShortDetails(element)
    );
  }

  private getCredentialShortDetails(
    metadata: CredentialMetadataRecord
  ): CredentialShortDetails {
    return {
      id: metadata.id,
      issuanceDate: metadata.issuanceDate,
      credentialType: metadata.credentialType,
      status: metadata.status,
      schema: metadata.schema,
      identifierType: metadata.identifierType,
      identifierId: metadata.identifierId,
    };
  }

  async getCredentialShortDetailsById(
    id: string
  ): Promise<CredentialShortDetails> {
    return this.getCredentialShortDetails(await this.getMetadataById(id));
  }

  @OnlineOnly
  async getCredentialDetailsById(id: string): Promise<ACDCDetails> {
    const metadata = await this.getMetadataById(id);
    const acdc = await this.props.signifyClient
      .credentials()
      .get(metadata.id)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          return undefined;
        } else {
          throw error;
        }
      });

    if (!acdc) {
      throw new Error(CredentialService.CREDENTIAL_NOT_FOUND);
    }
    const credentialShortDetails = this.getCredentialShortDetails(metadata);
    return {
      id: credentialShortDetails.id,
      schema: credentialShortDetails.schema,
      status: credentialShortDetails.status,
      identifierId: credentialShortDetails.identifierId,
      identifierType: credentialShortDetails.identifierType,
      i: acdc.sad.i,
      a: acdc.sad.a,
      s: {
        title: acdc.schema.title,
        description: acdc.schema.description,
        version: acdc.schema.version,
      },
      lastStatus: {
        s: acdc.status.s,
        dt: new Date(acdc.status.dt).toISOString(),
      },
    };
  }

  async createMetadata(data: CredentialMetadataRecordProps) {
    const metadataRecord = new CredentialMetadataRecord(data);
    await this.credentialStorage.saveCredentialMetadataRecord(metadataRecord);
  }

  async archiveCredential(id: string): Promise<void> {
    await this.credentialStorage.updateCredentialMetadata(id, {
      isArchived: true,
    });
  }

  async deleteCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    // We only soft delete because we need to sync with KERIA. This will prevent re-sync deleted records.
    await this.credentialStorage.updateCredentialMetadata(id, {
      isDeleted: true,
    });
  }

  async deleteStaleLocalCredential(id: string): Promise<void> {
    await this.credentialStorage.deleteCredentialMetadata(id);
  }

  async restoreCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    await this.credentialStorage.updateCredentialMetadata(id, {
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
    const metadata = await this.credentialStorage.getCredentialMetadata(id);
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }
    return metadata;
  }

  async syncACDCs() {
    const signifyCredentials = await this.props.signifyClient
      .credentials()
      .list();

    const storedCredentials =
      await this.credentialStorage.getAllCredentialMetadata();
    const unSyncedData = signifyCredentials.filter(
      (credential: any) =>
        !storedCredentials.find((item) => credential.sad.d === item.id)
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const credential of unSyncedData) {
        try {
          const identifier = await this.identifierStorage.getIdentifierMetadata(
            credential.sad.a.i
          );
          const metadata = {
            id: credential.sad.d,
            isArchived: false,
            issuanceDate: new Date(credential.sad.a.dt).toISOString(),
            credentialType: credential.schema.title,
            status: CredentialStatus.CONFIRMED,
            connectionId: credential.sad.i,
            schema: credential.schema.$id,
            identifierId: credential.sad.a.i,
            identifierType: identifier.multisigManageAid
              ? IdentifierType.Group
              : IdentifierType.Individual,
            createdAt: new Date(credential.sad.a.dt),
          };

          await this.createMetadata(metadata);
        } catch (error) {
          /* eslint-disable no-console */
          console.error(error);
        }
      }
    }
  }

  async markAcdc(
    credentialId: string,
    status: CredentialStatus.CONFIRMED | CredentialStatus.REVOKED
  ) {
    const metadata = await this.credentialStorage.getCredentialMetadata(
      credentialId
    );
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }
    metadata.status = status;
    await this.credentialStorage.updateCredentialMetadata(
      metadata.id,
      metadata
    );
    this.props.eventEmitter.emit<AcdcStateChangedEvent>({
      type: EventTypes.AcdcStateChanged,
      payload: {
        status,
        credential: getCredentialShortDetails(metadata),
      },
    });
  }
}

export { CredentialService };
