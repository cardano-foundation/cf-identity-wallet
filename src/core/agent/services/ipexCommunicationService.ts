import { v4 as uuidv4 } from "uuid";
import { Operation, Serder } from "signify-ts";
import { ConfigurationService } from "../../configuration";
import { Agent } from "../agent";
import {
  AcdcEventTypes,
  ExchangeRoute,
  IpexMessage,
  type AcdcStateChangedEvent,
  type AgentServicesProps,
  type KeriaNotification,
} from "../agent.types";
import {
  CredentialStorage,
  IdentifierStorage,
  NotificationStorage,
  OperationPendingStorage,
  IpexMessageStorage,
} from "../records";
import {
  CredentialMetadataRecordProps,
  CredentialMetadataRecordStatus,
} from "../records/credentialMetadataRecord.types";
import { AgentService } from "./agentService";
import { CredentialStatus } from "./credentialService.types";
import { OnlineOnly, getCredentialShortDetails } from "./utils";
import { CredentialsMatchingApply } from "./ipexCommunicationService.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";

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
  static readonly SCHEMA_SAID_RARE_EVO_DEMO =
    "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb";

  protected readonly identifierStorage: IdentifierStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly notificationStorage: NotificationStorage;
  protected readonly ipexMessageStorage: IpexMessageStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    credentialStorage: CredentialStorage,
    notificationStorage: NotificationStorage,
    ipexMessageStorage: IpexMessageStorage,
    operationPendingStorage: OperationPendingStorage
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.credentialStorage = credentialStorage;
    this.notificationStorage = notificationStorage;
    this.ipexMessageStorage = ipexMessageStorage;
    this.operationPendingStorage = operationPendingStorage;
  }

  @OnlineOnly
  async acceptAcdc(id: string): Promise<void> {
    const notifRecord = await this.getNotificationRecordById(id);
    const exn = await this.props.signifyClient
      .exchanges()
      .get(notifRecord.a.d as string);

    const credentialId = exn.exn.e.acdc.d;
    const connectionId = exn.exn.i;
    const holder = await this.identifierStorage.getIdentifierMetadata(
      exn.exn.a.i
    );
    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }
    const schemaSaid = exn.exn.e.acdc.s;
    const allSchemaSaids = Object.keys(exn.exn.e.acdc?.e || {}).map(
      // Chained schemas
      (key) => exn.exn.e.acdc.e?.[key]?.s
    );
    allSchemaSaids.push(schemaSaid);
    await Promise.all(
      allSchemaSaids.map(
        async (schemaSaid) =>
          await Agent.agent.connections.resolveOobi(
            `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`,
            true
          )
      )
    );
    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    await this.saveAcdcMetadataRecord(
      exn.exn.e.acdc.d,
      exn.exn.e.acdc.a.dt,
      schema.title,
      connectionId,
      schemaSaid
    );

    this.props.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        credentialId,
        status: CredentialStatus.PENDING,
      },
    });

    const chainedSchemaSaids = Object.keys(exn.exn.e.acdc?.e || {}).map(
      (key) => exn.exn.e.acdc.e?.[key]?.s
    );

    let op: Operation;
    if (holder.multisigManageAid) {
      op = await Agent.agent.multiSigs.multisigAdmit(
        holder.signifyName,
        notifRecord.a.d as string,
        [exn.exn.e.acdc.s, ...chainedSchemaSaids]
      );
    } else {
      op = await this.admitIpex(
        notifRecord.a.d as string,
        holder.signifyName,
        exn.exn.i,
        [exn.exn.e.acdc.s, ...chainedSchemaSaids]
      );
    }

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    Agent.agent.signifyNotifications.addPendingOperationToQueue(
      pendingOperation
    );
    Agent.agent.signifyNotifications.deleteNotificationRecordById(id);
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
        creds.map((cred: any) => `metadata:${cred.sad.d}`),
        {
          $and: [{ isDeleted: false }, { isArchived: false }],
        }
      );
    return {
      schema: {
        name: schemaKeri.title,
        description: schemaKeri.description,
      },
      credentials: credentialMetadatas.map((cr) => {
        const credKeri = creds.find(
          (cred: any) => `metadata:${cred.sad.d}` === cr.id
        );
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

  private async saveAcdcMetadataRecord(
    credentialId: string,
    dateTime: string,
    schemaTitle: string,
    connectionId: string,
    schema: string
  ): Promise<void> {
    const credentialDetails: CredentialMetadataRecordProps = {
      id: `metadata:${credentialId}`,
      isArchived: false,
      credentialType: schemaTitle,
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialMetadataRecordStatus.PENDING,
      connectionId,
      schema,
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
  ): Promise<Operation> {
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
    const op = await this.props.signifyClient
      .ipex()
      .submitAdmit(holderAidName, admit, sigs, aend, [issuerAid]);
    return op;
  }

  async markAcdcComplete(credentialId: string) {
    const metadata = await this.credentialStorage.getCredentialMetadata(
      `metadata:${credentialId}`
    );
    if (!metadata) {
      throw new Error(
        IpexCommunicationService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
      );
    }

    metadata.status = CredentialMetadataRecordStatus.CONFIRMED;
    await this.credentialStorage.updateCredentialMetadata(
      metadata.id,
      metadata
    );
    this.props.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        status: CredentialStatus.CONFIRMED,
        credential: getCredentialShortDetails(metadata),
      },
    });
  }

  private async getSchema(schemaSaid: string, retry = true) {
    try {
      const schema = await this.props.signifyClient.schemas().get(schemaSaid);
      return schema;
    } catch (error) {
      const errorStack = (error as Error).stack as string;
      const status = errorStack.split("-")[1];
      if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
        const oobi = await Agent.agent.connections
          .resolveOobi(
            `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
          )
          .catch(() => undefined);
        if (oobi?.done && retry) {
          await this.getSchema(schemaSaid, false);
        }
        return undefined;
      } else {
        throw error;
      }
    }
  }

  async createLinkedIpexMessageRecord(
    message: IpexMessage,
    historyType: ConnectionHistoryType
  ): Promise<void> {
    let schemaSaid;
    if (message.exn.r === ExchangeRoute.IpexGrant) {
      schemaSaid = message.exn.e.acdc.s;
    } else if (message.exn.r === ExchangeRoute.IpexApply) {
      schemaSaid = message.exn.a.s;
    } else if (message.exn.r === ExchangeRoute.IpexAgree) {
      const previousExchange = await this.props.signifyClient
        .exchanges()
        .get(message.exn.p);
      schemaSaid = previousExchange.exn.e.acdc.s;
    }
    const schema = await this.getSchema(schemaSaid);
    await this.ipexMessageStorage.createIpexMessageRecord({
      id: message.exn.d,
      credentialType: schema?.title,
      content: message,
      connectionId: message.exn.i,
      historyType,
    });
  }

  @OnlineOnly
  async acceptAcdcFromMultisigExn(id: string): Promise<void> {
    const notifRecord = await this.getNotificationRecordById(id);
    const exn = await this.props.signifyClient
      .exchanges()
      .get(notifRecord.a.d as string);

    const multisigExn = exn?.exn?.e?.exn;
    const previousExnGrantMsg = await this.props.signifyClient
      .exchanges()
      .get(exn?.exn.e.exn.p);

    const holder = await this.identifierStorage.getIdentifierMetadata(
      exn.exn.e.exn.i
    );

    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    const credentialId = previousExnGrantMsg.exn.e.acdc.d;
    const connectionId = previousExnGrantMsg.exn.i;

    const schemaSaid = previousExnGrantMsg.exn.e.acdc.s;
    const allSchemaSaids = Object.keys(
      previousExnGrantMsg.exn.e.acdc?.e || {}
    ).map((key) => previousExnGrantMsg.exn.e.acdc.e?.[key]?.s);
    allSchemaSaids.push(schemaSaid);

    const op = await Agent.agent.multiSigs.multisigAdmit(
      holder.signifyName,
      previousExnGrantMsg.exn.d as string,
      allSchemaSaids,
      multisigExn
    );

    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    await this.saveAcdcMetadataRecord(
      previousExnGrantMsg.exn.e.acdc.d,
      previousExnGrantMsg.exn.e.acdc.a.dt,
      connectionId,
      schema.title,
      connectionId
    );

    this.props.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        credentialId,
        status: CredentialStatus.PENDING,
      },
    });

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    Agent.agent.signifyNotifications.addPendingOperationToQueue(
      pendingOperation
    );
    Agent.agent.signifyNotifications.deleteNotificationRecordById(id);
  }
}

export { IpexCommunicationService };
