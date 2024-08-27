import { Operation, Serder } from "signify-ts";
import { ConfigurationService } from "../../configuration";
import { Agent } from "../agent";
import {
  AcdcEventTypes,
  ExchangeRoute,
  IpexMessage,
  NotificationRoute,
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
import { CredentialMetadataRecordProps } from "../records/credentialMetadataRecord.types";
import { AgentService } from "./agentService";
import { CredentialStatus } from "./credentialService.types";
import { OnlineOnly, getCredentialShortDetails } from "./utils";
import { CredentialsMatchingApply } from "./ipexCommunicationService.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { ConnectionHistoryType } from "./connection.types";
import { MultiSigService } from "./multiSigService";

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
  static readonly SCHEMA_SAID_RARE_EVO_DEMO =
    "EJxnJdxkHbRw2wVFNe4IUOPLt8fEtg9Sr3WyTjlgKoIb";

  protected readonly identifierStorage: IdentifierStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly notificationStorage: NotificationStorage;
  protected readonly ipexMessageStorage: IpexMessageStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly multisigService: MultiSigService;

  constructor(
    agentServiceProps: AgentServicesProps,
    identifierStorage: IdentifierStorage,
    credentialStorage: CredentialStorage,
    notificationStorage: NotificationStorage,
    ipexMessageStorage: IpexMessageStorage,
    operationPendingStorage: OperationPendingStorage,
    multisigService: MultiSigService
  ) {
    super(agentServiceProps);
    this.identifierStorage = identifierStorage;
    this.credentialStorage = credentialStorage;
    this.notificationStorage = notificationStorage;
    this.ipexMessageStorage = ipexMessageStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.multisigService = multisigService;
  }

  @OnlineOnly
  async acceptAcdc(id: string): Promise<void> {
    const grantNoteRecord = await this.getNotificationRecordById(id);
    const grantExn = await this.props.signifyClient
      .exchanges()
      .get(grantNoteRecord.a.d as string);

    const credentialId = grantExn.exn.e.acdc.d;
    const connectionId = grantExn.exn.i;

    const holder = await this.identifierStorage.getIdentifierMetadata(
      grantExn.exn.a.i
    );
    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    const schemaSaid = grantExn.exn.e.acdc.s;
    await Agent.agent.connections.resolveOobi(
      `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
    );

    const allSchemaSaids = Object.keys(grantExn.exn.e.acdc?.e || {}).map(
      // Chained schemas, will be resolved in admit/multisigAdmit
      (key) => grantExn.exn.e.acdc.e?.[key]?.s
    );
    allSchemaSaids.push(schemaSaid);

    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    await this.saveAcdcMetadataRecord(
      grantExn.exn.e.acdc.d,
      grantExn.exn.e.acdc.a.dt,
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

    let op: Operation;
    if (holder.multisigManageAid) {
      op = await this.multisigService.multisigAdmit(
        holder.signifyName,
        grantNoteRecord.a.d as string,
        allSchemaSaids
      );
    } else {
      op = await this.admitIpex(
        grantNoteRecord.a.d as string,
        holder.signifyName,
        grantExn.exn.i,
        allSchemaSaids
      );
    }

    await this.createLinkedIpexMessageRecord(
      grantExn,
      ConnectionHistoryType.CREDENTIAL_ISSUANCE
    );

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    Agent.agent.signifyNotifications.addPendingOperationToQueue(
      pendingOperation
    );
    Agent.agent.signifyNotifications.deleteNotificationRecordById(
      id,
      grantNoteRecord.a.r as NotificationRoute
    );
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
      applySaid: msg.exn.d,
    });
    await this.props.signifyClient
      .ipex()
      .submitOffer(holderSignifyName, offer, sigs, end, [msg.exn.i]);
    Agent.agent.signifyNotifications.deleteNotificationRecordById(
      notification.id,
      notification.a.r as NotificationRoute
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
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
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
        creds.map((cred: any) => cred.sad.d),
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

  private async saveAcdcMetadataRecord(
    credentialId: string,
    dateTime: string,
    schemaTitle: string,
    connectionId: string,
    schema: string
  ): Promise<void> {
    const credentialDetails: CredentialMetadataRecordProps = {
      id: credentialId,
      isArchived: false,
      credentialType: schemaTitle,
      issuanceDate: new Date(dateTime).toISOString(),
      status: CredentialStatus.PENDING,
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
    const [admit, sigs, aend] = await this.props.signifyClient.ipex().admit({
      senderName: holderAidName,
      message: "",
      grantSaid: notificationD,
      recipient: issuerAid,
      datetime: dt,
    });
    const op = await this.props.signifyClient
      .ipex()
      .submitAdmit(holderAidName, admit, sigs, aend, [issuerAid]);
    return op;
  }

  async markAcdc(
    credentialId: string,
    status: CredentialStatus.CONFIRMED | CredentialStatus.REVOKED
  ) {
    const metadata = await this.credentialStorage.getCredentialMetadata(
      credentialId
    );
    if (!metadata) {
      throw new Error(
        IpexCommunicationService.CREDENTIAL_MISSING_METADATA_ERROR_MSG
      );
    }
    metadata.status = status;
    await this.credentialStorage.updateCredentialMetadata(
      metadata.id,
      metadata
    );
    this.props.eventService.emit<AcdcStateChangedEvent>({
      type: AcdcEventTypes.AcdcStateChanged,
      payload: {
        status,
        credential: getCredentialShortDetails(metadata),
      },
    });
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

    await Agent.agent.connections.resolveOobi(
      `${ConfigurationService.env.keri.credentials.testServer.urlInt}/oobi/${schemaSaid}`
    );
    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    await this.ipexMessageStorage.createIpexMessageRecord({
      id: message.exn.d,
      credentialType: schema?.title,
      content: message,
      connectionId: message.exn.i,
      historyType,
    });
  }

  @OnlineOnly
  async handleMessageFromMultisigExn(id: string) {
    const notifRecord = await this.getNotificationRecordById(id);
    const exn = await this.props.signifyClient
      .exchanges()
      .get(notifRecord.a.d as string);
    const route = exn?.exn?.e?.exn?.r;

    switch (route) {
    case ExchangeRoute.IpexAdmit:
      await this.acceptAcdcFromMultisigExn(id);
      break;
    case ExchangeRoute.IpexGrant:
      await this.acceptPresentAcdcFromMultisigExn(id);
      break;
    default:
      break;
    }
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

    const op = await this.multisigService.multisigAdmit(
      holder.signifyName,
      previousExnGrantMsg.exn.d as string,
      allSchemaSaids,
      multisigExn
    );

    const schema = await this.props.signifyClient.schemas().get(schemaSaid);
    await this.saveAcdcMetadataRecord(
      previousExnGrantMsg.exn.e.acdc.d,
      previousExnGrantMsg.exn.e.acdc.a.dt,
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

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangeReceiveCredential,
    });
    Agent.agent.signifyNotifications.addPendingOperationToQueue(
      pendingOperation
    );
    Agent.agent.signifyNotifications.deleteNotificationRecordById(
      id,
      notifRecord.a.r as NotificationRoute
    );
  }

  @OnlineOnly
  async admitGrantAcdcById(credentialId: string) {
    // TODO: If the credential does not exist, this will throw 500 at the moment. Will change this later
    const pickedCred = await this.props.signifyClient
      .credentials()
      .get(credentialId);

    if (!pickedCred) {
      throw new Error(
        `${IpexCommunicationService.CREDENTIAL_NOT_FOUND} ${credentialId}`
      );
    }

    const holderSignifyName = (
      await this.identifierStorage.getIdentifierMetadata(pickedCred.sad.a.i)
    ).signifyName;

    // const op = await this.props.multisigService.grantPresentMultisigAcdc(
    const op = await this.multisigService.grantPresentMultisigAcdc(
      holderSignifyName,
      pickedCred.sad?.i,
      pickedCred
    );

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });
    Agent.agent.signifyNotifications.addPendingOperationToQueue(
      pendingOperation
    );
  }

  @OnlineOnly
  async acceptPresentAcdcFromMultisigExn(id: string): Promise<void> {
    const notifRecord = await this.getNotificationRecordById(id);
    const exn = await this.props.signifyClient
      .exchanges()
      .get(notifRecord.a.d as string);

    const grantExn = exn?.exn?.e?.exn;
    const credential = grantExn?.e?.acdc;
    const holder = await this.identifierStorage.getIdentifierMetadata(
      exn.exn.e.exn.i
    );

    if (!holder) {
      throw new Error(IpexCommunicationService.ISSUEE_NOT_FOUND_LOCALLY);
    }

    // const op = await this.props.multisigService.grantPresentMultisigAcdc(
    const op = await this.multisigService.grantPresentMultisigAcdc(
      holder.signifyName,
      credential?.i,
      credential,
      {
        grantExn,
        atc: exn.pathed,
      }
    );

    const pendingOperation = await this.operationPendingStorage.save({
      id: op.name,
      recordType: OperationPendingRecordType.ExchangePresentCredential,
    });
    Agent.agent.signifyNotifications.addPendingOperationToQueue(
      pendingOperation
    );
    Agent.agent.signifyNotifications.deleteNotificationRecordById(
      id,
      notifRecord.a.r as NotificationRoute
    );
  }
}

export { IpexCommunicationService };
