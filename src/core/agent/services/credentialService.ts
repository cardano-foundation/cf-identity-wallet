import { plainToInstance } from "class-transformer";
import {
  KeriNotification,
  AcdcKeriStateChangedEvent,
  AcdcKeriEventTypes,
  ConnectionType,
} from "../agent.types";
import { AgentService } from "./agentService";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { ColorGenerator } from "../../../ui/utils/colorGenerator";
import {
  CredentialShortDetails,
  CredentialStatus,
  ACDCDetails,
} from "./credentialService.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";
import { CredentialMetadataRecord } from "../records/credentialMetadataRecord";
import { RecordType } from "../../storage/storage.types";
import { AriesAgent } from "../agent";
import { BasicRecord } from "../records";

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
    const listMetadatas = await this.getAllCredentialMetadata(isGetArchive);
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
      colors: metadata.colors,
      issuanceDate: metadata.issuanceDate,
      credentialType: metadata.credentialType,
      status: metadata.status,
      cachedDetails: metadata.cachedDetails,
      connectionType: metadata.connectionType,
    };
  }

  async getCredentialShortDetailsById(
    id: string
  ): Promise<CredentialShortDetails> {
    return this.getCredentialShortDetails(await this.getMetadataById(id));
  }

  async getCredentialDetailsById(id: string): Promise<ACDCDetails> {
    const metadata = await this.getMetadataById(id);
    const { acdc, error } = await this.signifyApi.getCredentialBySaid(
      metadata.credentialRecordId
    );
    if (error) {
      throw error;
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
      connectionType: ConnectionType.KERI,
    };
  }

  async createMetadata(data: CredentialMetadataRecordProps) {
    const metadataRecord = new CredentialMetadataRecord({
      ...data,
    });

    await this.saveCredentialMetadataRecord(metadataRecord);
  }

  async archiveCredential(id: string): Promise<void> {
    await this.updateCredentialMetadata(id, {
      isArchived: true,
    });
  }

  async deleteCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    //With KERI, we only soft delete because we need to sync with KERIA. This will prevent re-sync deleted records.
    if (metadata.connectionType === ConnectionType.KERI) {
      await this.updateCredentialMetadata(id, {
        isDeleted: true,
      });
    } else {
      await this.deleteCredentialMetadata(id);
    }
  }

  async restoreCredential(id: string): Promise<void> {
    const metadata = await this.getMetadataById(id);
    this.validArchivedCredential(metadata);
    await this.updateCredentialMetadata(id, {
      isArchived: false,
    });
  }

  async getUnhandledCredentials(): Promise<KeriNotification[]> {
    return this.getKeriCredentialNotifications();
  }

  private validArchivedCredential(metadata: CredentialMetadataRecord): void {
    if (!metadata.isArchived) {
      throw new Error(
        `${CredentialService.CREDENTIAL_NOT_ARCHIVED} ${metadata.id}`
      );
    }
  }

  private async getMetadataById(id: string): Promise<CredentialMetadataRecord> {
    const metadata = await this.getCredentialMetadata(id);
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }
    return metadata;
  }

  private async getKeriCredentialNotifications(): Promise<KeriNotification[]> {
    const results = await this.basicStorage.findAllByQuery(
      RecordType.NOTIFICATION_KERI,
      {
        route: NotificationRoute.Credential,
      }
    );
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }

  private async createAcdcMetadataRecord(event: any): Promise<void> {
    await this.saveAcdcMetadataRecord(event.e.acdc.d, event.e.acdc.a.dt);
  }

  private async saveAcdcMetadataRecord(
    credentialId: string,
    dateTime: string
  ): Promise<void> {
    const credentialDetails: CredentialShortDetails = {
      id: `metadata:${credentialId}`,
      isArchived: false,
      colors: new ColorGenerator().generateNextColor() as [string, string],
      credentialType: "",
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
      connectionType: ConnectionType.KERI,
    };
    await this.createMetadata({
      ...credentialDetails,
      credentialRecordId: credentialId,
    });
  }

  private async updateAcdcMetadataRecordCompleted(
    id: string,
    cred: any
  ): Promise<CredentialShortDetails> {
    const metadata = await this.getCredentialMetadataByCredentialRecordId(id);
    if (!metadata) {
      throw new Error(CredentialService.CREDENTIAL_MISSING_METADATA_ERROR_MSG);
    }

    metadata.status = CredentialMetadataRecordStatus.CONFIRMED;
    metadata.credentialType = cred.schema?.title;
    await this.updateCredentialMetadata(metadata.id, metadata);
    return this.getCredentialShortDetails(metadata);
  }

  private async getKeriNotificationRecordById(
    id: string
  ): Promise<KeriNotification> {
    const result = await this.basicStorage.findById(id);
    if (!result) {
      throw new Error(`${CredentialService.KERI_NOTIFICATION_NOT_FOUND} ${id}`);
    }
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }

  async deleteKeriNotificationRecordById(id: string): Promise<void> {
    await this.basicStorage.deleteById(id);
  }

  async acceptKeriAcdc(id: string): Promise<void> {
    const keriNoti = await this.getKeriNotificationRecordById(id);
    const keriExchange = await this.signifyApi.getKeriExchange(
      keriNoti.a.d as string
    );
    const credentialId = keriExchange.exn.e.acdc.d;
    await this.createAcdcMetadataRecord(keriExchange.exn);

    this.eventService.emit<AcdcKeriStateChangedEvent>({
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        credentialId,
        status: CredentialStatus.PENDING,
      },
    });
    let holderSignifyName;
    const holder = await AriesAgent.agent.identifiers.getIdentifierMetadata(
      keriExchange.exn.a.i
    );
    if (holder && holder.signifyName) {
      holderSignifyName = holder.signifyName;
    } else {
      const identifierHolder = await this.signifyApi.getIdentifierById(
        keriExchange.exn.a.i
      );
      holderSignifyName = identifierHolder?.name;
    }
    if (!holderSignifyName) {
      throw new Error(CredentialService.ISSUEE_NOT_FOUND);
    }

    await this.signifyApi.admitIpex(
      keriNoti.a.d as string,
      holderSignifyName,
      keriExchange.exn.i
    );

    // @TODO - foconnor: This should be event driven, need to fix the notification in KERIA/Signify.
    const cred = await this.waitForAcdcToAppear(credentialId);
    const credentialShortDetails = await this.updateAcdcMetadataRecordCompleted(
      credentialId,
      cred
    );
    await this.deleteKeriNotificationRecordById(id);
    this.eventService.emit<AcdcKeriStateChangedEvent>({
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        status: CredentialStatus.CONFIRMED,
        credential: credentialShortDetails,
      },
    });
  }

  private async waitForAcdcToAppear(credentialId: string): Promise<any> {
    let { acdc } = await this.signifyApi.getCredentialBySaid(credentialId);
    let retryTimes = 0;
    while (!acdc) {
      if (retryTimes > 120) {
        throw new Error(CredentialService.ACDC_NOT_APPEARING);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      acdc = (await this.signifyApi.getCredentialBySaid(credentialId)).acdc;
      retryTimes++;
    }
    return acdc;
  }

  async syncACDCs() {
    const signifyCredentials = await this.signifyApi.getCredentials();
    const storedCredentials = await this.getAllCredentialMetadata();
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

  async getAllCredentialMetadata(isArchived?: boolean) {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.CREDENTIAL_METADATA_RECORD,
      {
        ...(isArchived !== undefined ? { isArchived } : {}),
      }
    );
    return basicRecords.map((bc) => {
      return this.parseCredentialMetadataRecord(bc);
    });
  }

  async deleteCredentialMetadata(id: string) {
    return this.basicStorage.deleteById(id);
  }

  async getCredentialMetadata(
    id: string
  ): Promise<CredentialMetadataRecord | null> {
    const basicRecord = await this.basicStorage.findById(id);
    if (!basicRecord) {
      return null;
    }
    return this.parseCredentialMetadataRecord(basicRecord);
  }

  async getCredentialMetadataByCredentialRecordId(credentialRecordId: string) {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.CREDENTIAL_METADATA_RECORD,
      {
        credentialRecordId,
      }
    );
    const basicRecord = basicRecords[0];
    if (!basicRecord) {
      throw new Error(CredentialService.CREDENTIAL_NOT_FOUND);
    }
    return this.parseCredentialMetadataRecord(basicRecord);
  }

  async getCredentialMetadataByConnectionId(connectionId: string) {
    const basicRecords = await this.basicStorage.findAllByQuery(
      RecordType.CREDENTIAL_METADATA_RECORD,
      {
        connectionId,
      }
    );
    return basicRecords.map((bc) => {
      return this.parseCredentialMetadataRecord(bc);
    });
  }

  async saveCredentialMetadataRecord(data: CredentialMetadataRecord) {
    const record = new CredentialMetadataRecord({
      ...data,
    });
    return this.basicStorage.save({
      id: record.id,
      content: record.toJSON(),
      tags: {
        ...record.getTags(),
      },
      type: RecordType.CREDENTIAL_METADATA_RECORD,
    });
  }

  async updateCredentialMetadata(
    id: string,
    data: Partial<
      Pick<
        CredentialMetadataRecord,
        | "isArchived"
        | "colors"
        | "status"
        | "credentialType"
        | "isDeleted"
        | "cachedDetails"
      >
    >
  ) {
    const record = await this.getMetadataById(id);
    if (record) {
      if (data.colors) record.colors = data.colors;
      if (data.status) record.status = data.status;
      if (data.credentialType) record.credentialType = data.credentialType;
      if (data.isArchived !== undefined) record.isArchived = data.isArchived;
      if (data.isDeleted !== undefined) record.isDeleted = data.isDeleted;
      if (data.cachedDetails) record.cachedDetails = data.cachedDetails;
      const basicRecord = new BasicRecord({
        id: record.id,
        content: record.toJSON(),
        tags: record.getTags(),
        type: RecordType.CREDENTIAL_METADATA_RECORD,
      });
      await this.basicStorage.update(basicRecord);
    }
  }

  private parseCredentialMetadataRecord(
    basicRecord: BasicRecord
  ): CredentialMetadataRecord {
    const instance = plainToInstance(
      CredentialMetadataRecord,
      basicRecord.content,
      {
        exposeDefaultValues: true,
      }
    );
    instance.createdAt = new Date(instance.createdAt);
    instance.updatedAt = instance.updatedAt
      ? new Date(instance.createdAt)
      : undefined;
    instance.replaceTags(basicRecord.getTags());
    return instance;
  }
}

export { CredentialService };
