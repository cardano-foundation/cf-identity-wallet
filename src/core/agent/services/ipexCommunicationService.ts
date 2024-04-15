import { RecordType } from "../../storage/storage.types";
import { Agent } from "../agent";
import {
  AcdcKeriEventTypes,
  AcdcKeriStateChangedEvent,
  KeriNotification,
  IdentifierResult,
  NotificationRoute,
} from "../agent.types";
import { CredentialMetadataRecordStatus } from "../records/credentialMetadataRecord.types";
import { AgentService } from "./agentService";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./credentialService.types";
import { getCredentialShortDetails } from "./utils";

class IpexCommunicationService extends AgentService {
  static readonly ISSUEE_NOT_FOUND =
    "Cannot accept incoming ACDC, issuee AID not controlled by us";
  static readonly ACDC_NOT_APPEARING = "ACDC is not appearing..."; // @TODO - foconnor: This is async we should wait for a notification

  static readonly KERI_NOTIFICATION_NOT_FOUND =
    "Keri notification record not found";

  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";

  static readonly CREDENTIAL_SERVER =
    "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID_VLEI =
    "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  static readonly SCHEMA_SAID_IIW_DEMO =
    "EKYv475K1k6uMt9IJw99NM8iLQuQf1bKfSHqA1XIKoQy";

  onAcdcKeriStateChanged(callback: (event: AcdcKeriStateChangedEvent) => void) {
    this.eventService.on(
      AcdcKeriEventTypes.AcdcKeriStateChanged,
      async (event: AcdcKeriStateChangedEvent) => {
        callback(event);
      }
    );
  }

  async acceptKeriAcdc(id: string): Promise<void> {
    const keriNoti = await this.getKeriNotificationRecordById(id);
    const keriExchange = await this.signifyClient
      .exchanges()
      .get(keriNoti.a.d as string);
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
    const holder = await this.identifierStorage.getIdentifierMetadata(
      keriExchange.exn.a.i
    );
    if (holder && holder.signifyName) {
      holderSignifyName = holder.signifyName;
    } else {
      const identifierHolder = await this.getIdentifierById(
        keriExchange.exn.a.i
      );
      holderSignifyName = identifierHolder?.name;
    }
    if (!holderSignifyName) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND);
    }

    await this.admitIpex(
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
    await this.basicStorage.deleteById(id);
    this.eventService.emit<AcdcKeriStateChangedEvent>({
      type: AcdcKeriEventTypes.AcdcKeriStateChanged,
      payload: {
        status: CredentialStatus.CONFIRMED,
        credential: credentialShortDetails,
      },
    });
  }

  private async waitForAcdcToAppear(credentialId: string): Promise<any> {
    let acdc = await this.getCredentialBySaid(credentialId);
    let retryTimes = 0;
    while (!acdc) {
      if (retryTimes > 120) {
        throw new Error(IpexCommunicationService.ACDC_NOT_APPEARING);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      acdc = (await this.getCredentialBySaid(credentialId)).acdc;
      retryTimes++;
    }
    return acdc;
  }

  private async getKeriNotificationRecordById(
    id: string
  ): Promise<KeriNotification> {
    const result = await this.basicStorage.findById(id);
    if (!result) {
      throw new Error(
        `${IpexCommunicationService.KERI_NOTIFICATION_NOT_FOUND} ${id}`
      );
    }
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }

  private async updateAcdcMetadataRecordCompleted(
    id: string,
    cred: any
  ): Promise<CredentialShortDetails> {
    const metadata =
      await this.credentialStorage.getCredentialMetadataByCredentialRecordId(
        id
      );
    if (!metadata) {
      throw new Error(
        IpexCommunicationService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
      );
    }

    metadata.status = CredentialMetadataRecordStatus.CONFIRMED;
    metadata.credentialType = cred.schema?.title;
    await this.credentialStorage.updateCredentialMetadata(
      metadata.id,
      metadata
    );
    return getCredentialShortDetails(metadata);
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
      credentialType: "",
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
    };
    await this.credentialStorage.saveCredentialMetadataRecord({
      ...credentialDetails,
      credentialRecordId: credentialId,
    });
  }

  async getUnhandledCredentials(): Promise<KeriNotification[]> {
    return this.getKeriCredentialNotifications();
  }

  private async getKeriCredentialNotifications(): Promise<KeriNotification[]> {
    const results = await this.basicStorage.findAllByQuery({
      route: NotificationRoute.Credential,
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

  private async getIdentifierById(
    id: string
  ): Promise<IdentifierResult | undefined> {
    const allIdentifiers = await this.signifyClient.identifiers().list();
    const identifier = allIdentifiers.aids.find(
      (identifier: IdentifierResult) => identifier.prefix === id
    );
    return identifier;
  }

  private async admitIpex(
    notificationD: string,
    holderAidName: string,
    issuerAid: string
  ): Promise<void> {
    // @TODO - foconnor: For now this will only work with our test server, we need to find a better way to handle this in production.
    await Agent.agent.connections.resolveOobi(
      IpexCommunicationService.CREDENTIAL_SERVER +
        IpexCommunicationService.SCHEMA_SAID_VLEI
    );
    await Agent.agent.connections.resolveOobi(
      IpexCommunicationService.CREDENTIAL_SERVER +
        IpexCommunicationService.SCHEMA_SAID_IIW_DEMO
    );
    const dt = new Date().toISOString().replace("Z", "000+00:00");
    const [admit, sigs, aend] = await this.signifyClient
      .ipex()
      .admit(holderAidName, "", notificationD, dt);
    await this.signifyClient
      .ipex()
      .submitAdmit(holderAidName, admit, sigs, aend, [issuerAid]);
  }

  async getCredentialBySaid(
    sad: string
  ): Promise<{ acdc?: any; error?: unknown }> {
    try {
      const results = await this.signifyClient.credentials().list({
        filter: {
          "-d": { $eq: sad },
        },
      });
      return {
        acdc: results[0],
      };
    } catch (error) {
      return {
        error,
      };
    }
  }
}

export { IpexCommunicationService };
