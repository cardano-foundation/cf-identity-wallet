import {
  KeriNotification,
  AcdcKeriStateChangedEvent,
  AcdcKeriEventTypes,
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

class CredentialService extends AgentService {
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_ARCHIVED = "Credential was not archived";
  static readonly ACDC_NOT_APPEARING = "ACDC is not appearing..."; // @TODO - foconnor: This is async we should wait for a notification
  static readonly CREDENTIAL_MISSING_FOR_NEGOTIATE =
    "Credential missing for negotiation";
  static readonly CREATED_DID_NOT_FOUND = "Referenced public did not found";
  static readonly KERI_NOTIFICATION_NOT_FOUND =
    "Keri notification record not found";
  static readonly ISSUEE_NOT_FOUND =
    "Cannot accept incoming ACDC, issuee AID not controlled by us";
  static readonly CREDENTIAL_NOT_FOUND =
    "Credential with given SAID not found on KERIA";

  onAcdcKeriStateChanged(callback: (event: AcdcKeriStateChangedEvent) => void) {
    this.eventService.on(
      AcdcKeriEventTypes.AcdcKeriStateChanged,
      async (event: AcdcKeriStateChangedEvent) => {
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
    //only get credentials that are not deleted
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

  async getCredentialDetailsById(id: string): Promise<ACDCDetails> {
    const metadata = await this.getMetadataById(id);
    let acdc;

    const results = await this.signifyClient.credentials().list({
      filter: {
        "-d": { $eq: metadata.credentialRecordId },
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
    //With KERI, we only soft delete because we need to sync with KERIA. This will prevent re-sync deleted records.
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

  async getKeriCredentialNotifications(
    filters: {
      isDismissed?: boolean;
    } = {}
  ): Promise<KeriNotification[]> {
    const results = await this.basicStorage.findAllByQuery({
      route: NotificationRoute.Credential,
      ...filters,
      type: RecordType.NOTIFICATION_KERI,
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
    const credentialDetails: CredentialShortDetails = {
      id: `metadata:${credentialId}`,
      isArchived: false,
      credentialType: "",
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
    };
    await this.createMetadata({
      ...credentialDetails,
      credentialRecordId: credentialId,
    });
  }

  async syncACDCs() {
    const signifyCredentials = await this.signifyClient.credentials().list();
    const storedCredentials =
      await this.credentialStorage.getAllCredentialMetadata();
    const unSyncedData = signifyCredentials.filter(
      (credential: any) =>
        !storedCredentials.find(
          (item) => credential.sad.d === item.credentialRecordId
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
