import {
  KeriaNotification,
  AcdcStateChangedEvent,
  AcdcEventTypes,
  NotificationRoute,
} from "../agent.types";
import { AgentService } from "./agentService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { CredentialShortDetails, ACDCDetails } from "./credentialService.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { RecordType } from "../../storage/storage.types";
import { OnlineOnly } from "./utils";

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";
  static readonly CREDENTIAL_NOT_FOUND =
    "Credential with given SAID not found on KERIA";

  onAcdcStateChanged(callback: (event: AcdcStateChangedEvent) => void) {
    this.eventService.on(
      AcdcEventTypes.AcdcStateChanged,
      async (event: AcdcStateChangedEvent) => {
        callback(event);
      }
    );
  }

  async getCredentials(
    isGetArchive = false
  ): Promise<CredentialShortDetails[]> {
    const listMetadatas = await this.credentialStorage.getAllCredentialMetadata(
      isGetArchive
    );
    // Only get credentials that are not deleted
    // @TODO - foconnor: Should be filtering via SQL for the deleted ones.
    return listMetadatas
      .filter((item) => !item.isDeleted)
      .map((element: CredentialMetadataRecord) =>
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
    let acdc;

    const results = await this.signifyClient.credentials().list({
      filter: {
        "-d": { $eq: metadata.id.replace("metadata:", "") },
      },
    });
    if (results.length > 0) {
      acdc = results[0];
    }
    if (!acdc) {
      throw new Error(CredentialService.CREDENTIAL_NOT_FOUND);
    }
    return {
      ...this.getCredentialShortDetails(metadata),
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
    const metadataRecord = new CredentialMetadataRecord({
      ...data,
    });

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

  @OnlineOnly
  async getKeriCredentialNotifications(
    filters: {
      isDismissed?: boolean;
    } = {}
  ): Promise<KeriaNotification[]> {
    const results = await this.basicStorage.findAllByQuery({
      route: NotificationRoute.Credential,
      ...filters,
      type: RecordType.KERIA_NOTIFICATION,
    });
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }
  async getUnhandledIpexGrantNotifications(
    filters: {
      isDismissed?: boolean;
    } = {}
  ): Promise<KeriaNotification[]> {
    const results = await this.basicStorage.findAllByQuery({
      route: NotificationRoute.Credential,
      ...filters,
      type: RecordType.KERIA_NOTIFICATION,
    });
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }

  private async saveAcdcMetadataRecord(
    credentialId: string,
    dateTime: string
  ): Promise<void> {
    const credentialDetails: CredentialMetadataRecordProps = {
      id: `metadata:${credentialId}`,
      isArchived: false,
      credentialType: "",
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
    };
    await this.createMetadata(credentialDetails);
  }

  @OnlineOnly
  async syncACDCs() {
    const signifyCredentials = await this.signifyClient.credentials().list();
    const storedCredentials =
      await this.credentialStorage.getAllCredentialMetadata();
    const unSyncedData = signifyCredentials.filter(
      (credential: any) =>
        !storedCredentials.find(
          (item) => credential.sad.d === item.id.replace("metadata:", "")
        )
    );
    if (unSyncedData.length) {
      //sync the storage with the signify data
      for (const credential of unSyncedData) {
        await this.saveAcdcMetadataRecord(
          credential.sad.d,
          credential.sad.a.dt
        );
      }
    }
  }
}

export { CredentialService };
