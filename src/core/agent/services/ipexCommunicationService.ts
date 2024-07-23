import { Serder } from "signify-ts";
import { ConfigurationService } from "../../configuration";
import { Agent } from "../agent";
import {
  AcdcEventTypes,
  type AcdcStateChangedEvent,
  type AgentServicesProps,
  type KeriaNotification,
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
import { OnlineOnly, getCredentialShortDetails } from "./utils";
import { CredentialsMatchingApply } from "./ipexCommunicationService.types";

class IpexCommunicationService extends AgentService {
  static readonly ISSUEE_NOT_FOUND_LOCALLY =
    "Cannot accept incoming ACDC, issuee AID not found in local wallet DB";
  static readonly ACDC_NOT_APPEARING = "ACDC is not appearing..."; // @TODO - foconnor: This is async we should wait for a notification
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly CREDENTIAL_MISSING_METADATA_ERROR_MSG =
    "Credential metadata missing for stored credential";
  static readonly CREDENTIAL_NOT_FOUND_WITH_SCHEMA =
    "Credential not found with this schema";

  static readonly CREDENTIAL_NOT_FOUND = "Credential not found";
  static readonly SCHEMA_NOT_FOUND = "Schema not found";

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

  @OnlineOnly
  async acceptAcdc(
    id: string,
    waitForAcdcConfig = { maxAttempts: 120, interval: 500 }
  ): Promise<void> {
    const notifRecord = await this.getNotificationRecordById(id);
    const exn = await this.props.signifyClient
      .exchanges()
      .get(notifRecord.a.d as string);
    const credentialId = exn.exn.e.acdc.d;
    const connectionId = exn.exn.i;
    await this.saveAcdcMetadataRecord(
      exn.exn.e.acdc.d,
      exn.exn.e.acdc.a.dt,
      connectionId
    );

    this.props.eventService.emit<AcdcStateChangedEvent>({
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
    const chainedSchemaSaids = Object.keys(exn.exn.e.acdc?.e || {}).map(
      (key) => exn.exn.e.acdc.e?.[key]?.s
    );

    await this.admitIpex(
      notifRecord.a.d as string,
      holder.signifyName,
      exn.exn.i,
      [exn.exn.e.acdc.s, ...chainedSchemaSaids]
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

    Agent.agent.signifyNotifications.deleteNotificationRecordById(id);
    this.props.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        status: CredentialStatus.CONFIRMED,
        credential: credentialShortDetails,
      },
    });
  }

  @OnlineOnly
  async offerAcdcFromApply(notification: KeriaNotification, acdc: any) {
    const msgSaid = notification.a.d as string;
    const msg = await this.props.signifyClient.exchanges().get(msgSaid);

    const holderSignifyName = (
      await this.identifierStorage.getIdentifierMetadata(msg.exn.a.i)
    ).signifyName;

    const [offer, sigs, end] = await this.props.signifyClient.ipex().offer({
      senderName: holderSignifyName,
      recipient: msg.exn.i,
      acdc: new Serder(acdc),
      apply: msg.exn.d,
    });
    await this.props.signifyClient
      .ipex()
      .submitOffer(holderSignifyName, offer, sigs, end, [msg.exn.i]);
    Agent.agent.signifyNotifications.deleteNotificationRecordById(
      notification.id
    );
  }

  @OnlineOnly
  async grantAcdcFromAgree(msgSaid: string) {
    const msgAgree = await this.props.signifyClient.exchanges().get(msgSaid);
    const msgOffer = await this.props.signifyClient
      .exchanges()
      .get(msgAgree.exn.p);
    //TODO: this might throw 500 internal server error, might not run to the next line at the moment
    const pickedCred = await this.props.signifyClient
      .credentials()
      .get(msgOffer.exn.e.acdc.d);
    if (!pickedCred) {
      throw new Error(IpexCommunicationService.CREDENTIAL_NOT_FOUND);
    }
    const holderSignifyName = (
      await this.identifierStorage.getIdentifierMetadata(msgOffer.exn.i)
    ).signifyName;

    const [grant, sigs, end] = await this.props.signifyClient.ipex().grant({
      senderName: holderSignifyName,
      recipient: msgAgree.exn.i,
      acdc: new Serder(pickedCred.sad),
      anc: new Serder(pickedCred.anc),
      iss: new Serder(pickedCred.iss),
      acdcAttachment: pickedCred.atc,
      ancAttachment: pickedCred.ancatc,
      issAttachment: pickedCred.issAtc,
    });
    await this.props.signifyClient
      .ipex()
      .submitGrant(holderSignifyName, grant, sigs, end, [msgAgree.exn.i]);
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

  @OnlineOnly
  async getIpexApplyDetails(
    notification: KeriaNotification
  ): Promise<CredentialsMatchingApply> {
    const msgSaid = notification.a.d as string;
    const msg = await this.props.signifyClient.exchanges().get(msgSaid);
    const schemaSaid = msg.exn.a.s;
    const attributes = msg.exn.a.a;
    const schemaKeri = await this.props.signifyClient
      .schemas()
      .get(schemaSaid)
      .catch((error) => {
        const errorStack = (error as Error).stack as string;
        const status = errorStack.split("-")[1];
        if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!schemaKeri) {
      throw new Error(IpexCommunicationService.SCHEMA_NOT_FOUND);
    }

    const filter = {
      "-s": { $eq: schemaSaid },
      ...(Object.keys(attributes).length > 0
        ? {
          ...Object.fromEntries(
            Object.entries(attributes).map(([key, value]) => [
              "-a-" + key,
              value,
            ])
          ),
        }
        : {}),
    };

    const creds = await this.props.signifyClient.credentials().list({
      filter,
    });

    const credentialMetadatas =
      await this.credentialStorage.getCredentialMetadatasById(
        creds.map((cred: any) => cred.sad.d)
      );
    return {
      schema: {
        name: schemaKeri.title,
        description: schemaKeri.description,
      },
      credentials: credentialMetadatas.map((cr) => {
        const credKeri = creds.find((cred: any) => cred.sad.d === cr.id);
        return {
          connectionId: cr.connectionId,
          acdc: credKeri.sad,
        };
      }),
      attributes: attributes,
    };
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
      createdAt: result.createdAt.toISOString(),
      a: result.a,
      connectionId: result.connectionId,
      read: result.read,
    };
  }

  private async updateAcdcMetadataRecordCompleted(
    id: string,
    cred: any
  ): Promise<CredentialShortDetails> {
    const metadata = await this.credentialStorage.getCredentialMetadata(id);
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
    dateTime: string,
    connectionId: string
  ): Promise<void> {
    const credentialDetails: CredentialMetadataRecordProps = {
      id: credentialId,
      isArchived: false,
      credentialType: "",
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
      connectionId,
    };
    await this.credentialStorage.saveCredentialMetadataRecord(
      credentialDetails
    );
  }

  private async admitIpex(
    notificationD: string,
    holderAidName: string,
    issuerAid: string,
    schemaSaids: string[]
  ): Promise<void> {
    // @TODO - foconnor: For now this will only work with our test server, we need to find a better way to handle this in production.
    for (const schemaSaid of schemaSaids) {
      if (schemaSaid) {
        await Agent.agent.connections.resolveOobi(
          `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
        );
      }
    }

    const dt = new Date().toISOString().replace("Z", "000+00:00");
    const [admit, sigs, aend] = await this.props.signifyClient
      .ipex()
      .admit(holderAidName, "", notificationD, dt);
    await this.props.signifyClient
      .ipex()
      .submitAdmit(holderAidName, admit, sigs, aend, [issuerAid]);
  }

  private async getCredentialBySaid(
    sad: string
  ): Promise<{ acdc?: any; error?: unknown }> {
    try {
      const results = await this.props.signifyClient.credentials().list({
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
