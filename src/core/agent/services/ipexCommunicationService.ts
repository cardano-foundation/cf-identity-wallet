import { Serder } from "signify-ts";
import { Agent } from "../agent";
import {
  AcdcEventTypes,
  AcdcStateChangedEvent,
  AgentServicesProps,
  IdentifierResult,
  KeriaNotification,
} from "../agent.types";
import {
  CredentialStorage,
  IdentifierStorage,
  NotificationStorage,
} from "../records";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { AgentService } from "./agentService";
import {
  CredentialShortDetails,
  CredentialStatus,
} from "./credentialService.types";
import { getCredentialShortDetails } from "./utils";

class IpexCommunicationService extends AgentService {
  static readonly ISSUEE_NOT_FOUND_LOCALLY =
    "Cannot accept incoming ACDC, issuee AID not found in local wallet DB";
  static readonly ACDC_NOT_APPEARING = "ACDC is not appearing..."; // @TODO - foconnor: This is async we should wait for a notification
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_FOUND_WITH_SCHEMA =
    "Credential not found with this schema";

  static readonly AID_NOT_FOUND = "Aid not found";
  static readonly CREDENTIAL_NOT_FOUND = "Credential not found";

  static readonly CREDENTIAL_SERVER =
    "https://dev.credentials.cf-keripy.metadata.dev.cf-deployments.org/oobi/";
  static readonly SCHEMA_SAID_VLEI =
    "EBfdlu8R27Fbx-ehrqwImnK-8Cm79sqbAQ4MmvEAYqao";
  static readonly SCHEMA_SAID_IIW_DEMO =
    "EBIFDhtSE0cM4nbTnaMqiV1vUIlcnbsqBMeVMmeGmXOu";

  protected readonly identifierStorage: IdentifierStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly notificationStorage: NotificationStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    credentialStorage: CredentialStorage,
    notificationStorage: NotificationStorage
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.credentialStorage = credentialStorage;
    this.notificationStorage = notificationStorage;
  }

  async acceptAcdc(
    id: string,
    waitForAcdcConfig = { maxAttempts: 120, interval: 500 }
  ): Promise<void> {
    const notifRecord = await this.getNotificationRecordById(id);
    const exn = await this.signifyClient
      .exchanges()
      .get(notifRecord.a.d as string);
    const credentialId = exn.exn.e.acdc.d;
    await this.saveAcdcMetadataRecord(exn.exn.e.acdc.d, exn.exn.e.acdc.a.dt);

    this.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        credentialId,
        status: CredentialStatus.PENDING,
      },
    });

    const holder = await this.identifierStorage.getIdentifierMetadata(
      exn.exn.a.i
    );
    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    await this.admitIpex(
      notifRecord.a.d as string,
      holder.signifyName,
      exn.exn.i
    );

    // @TODO - foconnor: This should be event driven, need to fix the notification in KERIA/Signify.
    const cred = await this.waitForAcdcToAppear(
      credentialId,
      waitForAcdcConfig
    );
    const credentialShortDetails = await this.updateAcdcMetadataRecordCompleted(
      credentialId,
      cred
    );
    await this.notificationStorage.deleteById(id);
    this.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        status: CredentialStatus.CONFIRMED,
        credential: credentialShortDetails,
      },
    });
  }

  async offerAcdc(notificationId: string) {
    const keriNoti = await this.getNotificationRecordById(notificationId);
    const msgSaid = keriNoti.a.d as string;
    const msg = await this.signifyClient.exchanges().get(msgSaid);
    const schemaSaid = msg.exn.a.s;
    const creds = await this.signifyClient.credentials().list({
      filter: {
        "-s": { $eq: schemaSaid },
      },
    });
    if (!creds || creds.length === 0) {
      throw new Error(
        IpexCommunicationService.CREDENTIAL_NOT_FOUND_WITH_SCHEMA
      );
    }
    const pickedCred = creds[0];
    let holderSignifyName;
    const holder = await this.identifierStorage.getIdentifierMetadata(
      msg.exn.a.i
    );
    if (holder && holder.signifyName) {
      holderSignifyName = holder.signifyName;
    } else {
      const identifierHolder = await this.getIdentifierById(msg.exn.a.i);
      holderSignifyName = identifierHolder?.name;
    }
    if (!holderSignifyName) {
      throw new Error(IpexCommunicationService.AID_NOT_FOUND);
    }

    const [offer, sigs, gend] = await this.signifyClient.ipex().offer({
      senderName: holderSignifyName,
      recipient: msg.exn.i,
      acdc: new Serder(pickedCred),
    });
    await this.signifyClient
      .ipex()
      .submitOffer(holderSignifyName, offer, sigs, gend, [msg.exn.i]);
    await this.notificationStorage.deleteById(notificationId);
  }

  async grantApplyAcdc(notificationId: string) {
    const keriNoti = await this.getNotificationRecordById(notificationId);
    const msgSaid = keriNoti.a.d as string;
    const msg = await this.signifyClient.exchanges().get(msgSaid);
    const exnMessage = JSON.parse(msg.exn.a.m);
    const creds = await this.signifyClient.credentials().list({
      filter: {
        "-d": { $eq: exnMessage.acdc.d },
      },
    });
    if (!creds || creds.length === 0) {
      throw new Error(IpexCommunicationService.CREDENTIAL_NOT_FOUND);
    }
    const pickedCred = creds[0];
    let holderSignifyName;
    const holder = await this.identifierStorage.getIdentifierMetadata(
      exnMessage.i
    );
    if (holder && holder.signifyName) {
      holderSignifyName = holder.signifyName;
    } else {
      const identifierHolder = await this.getIdentifierById(msg.exn.a.i);
      holderSignifyName = identifierHolder?.name;
    }
    if (!holderSignifyName) {
      throw new Error(IpexCommunicationService.AID_NOT_FOUND);
    }

    const [offer, sigs, gend] = await this.signifyClient.ipex().grant({
      senderName: holderSignifyName,
      recipient: msg.exn.i,
      acdc: new Serder(pickedCred.sad),
      anc: new Serder(pickedCred.anc),
      iss: new Serder(pickedCred.iss),
      acdcAttachment: pickedCred.atc,
      ancAttachment: pickedCred.ancatc,
      issAttachment: pickedCred.issAtc,
    });
    await this.signifyClient
      .ipex()
      .submitGrant(holderSignifyName, offer, sigs, gend, [msg.exn.i]);
    await this.notificationStorage.deleteById(notificationId);
  }

  private async waitForAcdcToAppear(
    credentialId: string,
    waitForAcdcConfig: { maxAttempts: number; interval: number }
  ): Promise<any> {
    let acdc;
    let retryTimes = 0;
    while (!acdc) {
      if (retryTimes >= waitForAcdcConfig.maxAttempts) {
        throw new Error(IpexCommunicationService.ACDC_NOT_APPEARING);
      }
      await new Promise((resolve) =>
        setTimeout(resolve, waitForAcdcConfig.interval)
      );
      acdc = (await this.getCredentialBySaid(credentialId)).acdc;
      retryTimes++;
    }
    return acdc;
  }

  private async getNotificationRecordById(
    id: string
  ): Promise<KeriaNotification> {
    const result = await this.notificationStorage.findById(id);
    if (!result) {
      throw new Error(
        `${IpexCommunicationService.NOTIFICATION_NOT_FOUND} ${id}`
      );
    }
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.a,
    };
  }

  private async updateAcdcMetadataRecordCompleted(
    id: string,
    cred: any
  ): Promise<CredentialShortDetails> {
    const metadata = await this.credentialStorage.getCredentialMetadata(
      `metadata:${id}`
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
    await this.credentialStorage.saveCredentialMetadataRecord(
      credentialDetails
    );
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

  private async getCredentialBySaid(
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

  private async getIdentifierById(
    id: string
  ): Promise<IdentifierResult | undefined> {
    const allIdentifiers = await this.signifyClient.identifiers().list();
    const identifier = allIdentifiers.aids.find(
      (identifier: IdentifierResult) => identifier.prefix === id
    );
    return identifier;
  }
}

export { IpexCommunicationService };
