import { ConnectionType } from "../agent.types";
import { AgentService } from "./agentService";
import { CredentialShortDetails, ACDCDetails } from "./credentialService.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { getCredentialShortDetails } from "./utils";

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
  static readonly CREDENTIAL_NOT_FOUND =
    "Credential with given SAID not found on KERIA";

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
        getCredentialShortDetails(element)
      );
  }

  async getCredentialShortDetailsById(
    id: string
  ): Promise<CredentialShortDetails> {
    return getCredentialShortDetails(await this.getMetadataById(id));
  }

  async getCredentialDetailsById(id: string): Promise<ACDCDetails> {
    const metadata = await this.getMetadataById(id);
    let acdc;

    try {
      const results = await this.signifyClient.credentials().list({
        filter: {
          "-d": { $eq: metadata.credentialRecordId },
        },
      });
      acdc = results[0];
    } catch (error) {
      throw error;
    }

    if (!acdc) {
      throw new Error(CredentialService.CREDENTIAL_NOT_FOUND);
    }
    return {
      ...getCredentialShortDetails(metadata),
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
      connectionType: ConnectionType.KERI,
    };
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
}

export { CredentialService };
