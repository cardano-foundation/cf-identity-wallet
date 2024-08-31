import { v4 as uuidv4 } from "uuid";
import { AgentService } from "./agentService";
import {
  AgentServicesProps,
  ExchangeRoute,
  KeriaNotification,
  KeriaNotificationMarker,
  MiscRecordId,
  NotificationRoute,
  OperationCallback,
} from "../agent.types";
import { CredentialStatus, Notification } from "./credentialService.types";
import {
  BasicRecord,
  BasicStorage,
  ConnectionStorage,
  CredentialStorage,
  IdentifierStorage,
  IpexMessageStorage,
  NotificationStorage,
  OperationPendingStorage,
} from "../records";
import { Agent } from "../agent";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { OperationPendingRecord } from "../records/operationPendingRecord";
import { IonicStorage } from "../../storage/ionicStorage";
import { ConnectionHistoryType } from "./connection.types";
import { MultiSigService } from "./multiSigService";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { IdentifierService } from "./identifierService";

class KeriaNotificationService extends AgentService {
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly POLL_KERIA_INTERVAL = 2000;
  static readonly CHECK_READINESS_INTERNAL = 25;

  protected readonly notificationStorage!: NotificationStorage;
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly connectionStorage: ConnectionStorage;
  protected readonly ipexMessageStorage: IpexMessageStorage;
  protected readonly credentialStorage: CredentialStorage;
  protected readonly basicStorage: BasicStorage;
  protected readonly multiSigs: MultiSigService;
  protected readonly ipexCommunications: IpexCommunicationService;
  protected readonly identifiers: IdentifierService;
  protected readonly getKeriaOnlineStatus: () => boolean;
  protected readonly markAgentStatus: (online: boolean) => void;
  protected readonly connect: (retryInterval?: number) => Promise<void>;

  protected pendingOperations: OperationPendingRecord[] = [];
  private loggedIn = true;

  constructor(
    agentServiceProps: AgentServicesProps,
    notificationStorage: NotificationStorage,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage,
    connectionStorage: ConnectionStorage,
    ipexMessageStorage: IpexMessageStorage,
    credentialStorage: CredentialStorage,
    basicStorage: BasicStorage,
    multiSigs: MultiSigService,
    ipexCommunications: IpexCommunicationService,
    identifiers: IdentifierService,
    getKeriaOnlineStatus: () => boolean,
    markAgentStatus: (online: boolean) => void,
    connect: (retryInterval?: number) => Promise<void>
  ) {
    super(agentServiceProps);
    this.notificationStorage = notificationStorage;
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.connectionStorage = connectionStorage;
    this.ipexMessageStorage = ipexMessageStorage;
    this.credentialStorage = credentialStorage;
    this.basicStorage = basicStorage;
    this.multiSigs = multiSigs;
    this.ipexCommunications = ipexCommunications;
    this.identifiers = identifiers;
    this.getKeriaOnlineStatus = getKeriaOnlineStatus;
    this.markAgentStatus = markAgentStatus;
    this.connect = connect;
  }

  async pollNotificationsWithCb(callback: (event: KeriaNotification) => void) {
    try {
      let notificationQuery = {
        nextIndex: 0,
        lastNotificationId: "",
      };
      const notificationQueryRecord = await this.basicStorage.findById(
        MiscRecordId.KERIA_NOTIFICATION_MARKER
      );
      if (!notificationQueryRecord) {
        await this.basicStorage.save({
          id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
          content: notificationQuery,
        });
      } else {
        notificationQuery =
          notificationQueryRecord.content as unknown as KeriaNotificationMarker;
      }
      // eslint-disable-next-line no-constant-condition
      while (true) {
        if (!this.loggedIn || !this.getKeriaOnlineStatus()) {
          await new Promise((rs) =>
            setTimeout(rs, KeriaNotificationService.CHECK_READINESS_INTERNAL)
          );
          continue;
        }

        const startFetchingIndex =
          notificationQuery.nextIndex > 0 ? notificationQuery.nextIndex - 1 : 0;

        let notifications;
        try {
          notifications = await this.props.signifyClient
            .notifications()
            .list(startFetchingIndex, startFetchingIndex + 24);
        } catch (error) {
          const errorMessage = (error as Error).message;
          /** If the error is failed to fetch with signify,
           * we retry until the connection is secured*/
          if (
            (/Failed to fetch/gi.test(errorMessage) ||
              /Load failed/gi.test(errorMessage)) &&
            this.getKeriaOnlineStatus()
          ) {
            // Possible that bootAndConnect is called from @OnlineOnly in between loops,
            // so check if its gone down to avoid having 2 bootAndConnect loops
            this.markAgentStatus(false);
            // This will hang the loop until the connection is secured again
            await this.connect();
          } else {
            throw error;
          }
        }
        if (!notifications) {
          // KERIA went down while querying, now back online
          continue;
        }
        if (
          notificationQuery.nextIndex > 0 &&
          (notifications.notes.length == 0 ||
            notifications.notes[0].i !== notificationQuery.lastNotificationId)
        ) {
          // This is to verify no notifications were deleted for some reason (which affects the batch range)
          notificationQuery = {
            nextIndex: 0,
            lastNotificationId: "",
          };
          await this.basicStorage.createOrUpdateBasicRecord(
            new BasicRecord({
              id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
              content: notificationQuery,
            })
          );
          continue;
        }
        if (notificationQuery.nextIndex > 0) {
          // Since the first item is the (next index - 1), we can ignore it
          notifications.notes.shift();
        }
        for (const notif of notifications.notes) {
          try {
            await this.processNotification(notif, callback);
            const nextNotificationIndex = notificationQuery.nextIndex + 1;
            notificationQuery = {
              nextIndex: nextNotificationIndex,
              lastNotificationId: notif.i,
            };
            await this.basicStorage.createOrUpdateBasicRecord(
              new BasicRecord({
                id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
                content: notificationQuery,
              })
            );
          } catch (error) {
            /* eslint-disable no-console */
            console.error("Error when process a notification", error);
          }
        }
        if (!notifications.notes.length) {
          await new Promise((rs) =>
            setTimeout(rs, KeriaNotificationService.POLL_KERIA_INTERVAL)
          );
        }
      }
    } catch (error) {
      /* eslint-disable no-console */
      console.error("Error at pollNotificationsWithCb", error);
      setTimeout(
        this.pollNotificationsWithCb,
        KeriaNotificationService.POLL_KERIA_INTERVAL,
        callback
      );
    }
  }

  startNotification() {
    this.loggedIn = true;
  }

  stopNotification() {
    this.loggedIn = false;
  }

  async deleteNotificationRecordById(
    id: string,
    route: NotificationRoute
  ): Promise<void> {
    if (!/^\/local/.test(route)) {
      await this.markNotification(id);
    }
    await this.notificationStorage.deleteById(id);
  }

  async processNotification(
    notif: Notification,
    callback: (event: KeriaNotification) => void
  ) {
    if (notif.r) {
      return;
    }
    let shouldCreateRecord = true;
    if (notif.a.r === NotificationRoute.ExnIpexApply) {
      shouldCreateRecord = await this.processExnIpexApplyNotification(notif);
    } else if (notif.a.r === NotificationRoute.ExnIpexGrant) {
      shouldCreateRecord = await this.processExnIpexGrantNotification(notif);
    } else if (notif.a.r === NotificationRoute.MultiSigRpy) {
      shouldCreateRecord = await this.processMultiSigRpyNotification(notif);
    } else if (notif.a.r === NotificationRoute.MultiSigIcp) {
      shouldCreateRecord = await this.processMultiSigIcpNotification(notif);
    } else if (notif.a.r === NotificationRoute.MultiSigExn) {
      shouldCreateRecord = await this.processMultiSigExnNotification(notif);
    } else if (notif.a.r === NotificationRoute.ExnIpexAgree) {
      shouldCreateRecord = await this.processExnIpexAgreeNotification(notif);
    }
    if (!shouldCreateRecord) {
      return;
    }
    if (
      Object.values(NotificationRoute).includes(notif.a.r as NotificationRoute)
    ) {
      try {
        const keriaNotif = await this.createNotificationRecord(notif);
        callback(keriaNotif);
      } catch (error) {
        if (
          (error as Error).message ===
          `${IonicStorage.RECORD_ALREADY_EXISTS_ERROR_MSG} ${notif.i}`
        ) {
          return;
        } else {
          throw error;
        }
      }
    }

    return;
  }

  private async processExnIpexApplyNotification(
    notif: Notification
  ): Promise<boolean> {
    const existingLinkedIpexRecord = await this.ipexMessageStorage
      .getIpexMessageMetadata(notif.a.d)
      .catch((error) => {
        if (
          error.message ===
          IpexMessageStorage.IPEX_MESSAGE_METADATA_RECORD_MISSING
        ) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!existingLinkedIpexRecord) {
      const exchange = await this.props.signifyClient
        .exchanges()
        .get(notif.a.d);
      await this.ipexCommunications.createLinkedIpexMessageRecord(
        exchange,
        ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
      );
    }
    return true;
  }

  private async processExnIpexGrantNotification(
    notif: Notification
  ): Promise<boolean> {
    const exchange = await this.props.signifyClient.exchanges().get(notif.a.d);
    const existingCredential =
      await this.credentialStorage.getCredentialMetadata(exchange.exn.e.acdc.d);
    const ourIdentifier = await this.identifierStorage
      .getIdentifierMetadata(exchange.exn.a.i)
      .catch((error) => {
        if (
          (error as Error).message ===
          IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
        ) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!ourIdentifier) {
      await this.markNotification(notif.i);
      return false;
    }
    if (
      existingCredential &&
      existingCredential.status !== CredentialStatus.REVOKED
    ) {
      const dt = new Date().toISOString().replace("Z", "000+00:00");
      const [admit, sigs, aend] = await this.props.signifyClient.ipex().admit({
        senderName: ourIdentifier.signifyName,
        message: "",
        grantSaid: notif.a.d,
        datetime: dt,
        recipient: exchange.exn.i,
      });
      const op = await this.props.signifyClient
        .ipex()
        .submitAdmit(ourIdentifier.signifyName, admit, sigs, aend, [
          exchange.exn.i,
        ]);
      const pendingOperation = await this.operationPendingStorage.save({
        id: op.name,
        recordType: OperationPendingRecordType.ExchangeRevokeCredential,
      });
      this.addPendingOperationToQueue(pendingOperation);
      await this.markNotification(notif.i);
      return false;
    }
    return true;
  }

  private async processMultiSigRpyNotification(
    notif: Notification
  ): Promise<boolean> {
    const multisigNotification = await this.props.signifyClient
      .groups()
      .getRequest(notif.a.d)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          return [];
        } else {
          throw error;
        }
      });
    if (!multisigNotification || !multisigNotification.length) {
      await this.markNotification(notif.i);
      return false;
    }
    const multisigId = multisigNotification[0]?.exn?.a?.gid;
    if (!multisigId) {
      await this.markNotification(notif.i);
      return false;
    }
    const multisigIdentifier = await this.identifierStorage
      .getIdentifierMetadata(multisigId)
      .catch((error) => {
        if (
          error.message === IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
        ) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!multisigIdentifier) {
      await this.markNotification(notif.i);
      return false;
    }
    const rpyRoute = multisigNotification[0].exn.e.rpy.r;
    if (rpyRoute === "/end/role/add") {
      await this.multiSigs.joinAuthorization(multisigNotification[0].exn);
      await this.markNotification(notif.i);
      return false;
    }
    return true;
  }

  private async processMultiSigIcpNotification(
    notif: Notification
  ): Promise<boolean> {
    const multisigNotification = await this.props.signifyClient
      .groups()
      .getRequest(notif.a.d)
      .catch((error) => {
        const status = error.message.split(" - ")[1];
        if (/404/gi.test(status)) {
          return [];
        } else {
          throw error;
        }
      });
    if (!multisigNotification || !multisigNotification.length) {
      await this.markNotification(notif.i);
      return false;
    }
    const multisigId = multisigNotification[0]?.exn?.a?.gid;
    if (!multisigId) {
      await this.markNotification(notif.i);
      return false;
    }
    const hasMultisig = await this.multiSigs.hasMultisig(multisigId);
    const notificationsForThisMultisig =
      await this.findNotificationsByMultisigId(multisigId);
    if (hasMultisig || notificationsForThisMultisig.length) {
      await this.markNotification(notif.i);
      return false;
    }
    return true;
  }

  private async processMultiSigExnNotification(
    notif: Notification
  ): Promise<boolean> {
    const exchange = await this.props.signifyClient.exchanges().get(notif.a.d);

    if (exchange?.exn?.e?.exn?.r !== ExchangeRoute.IpexAdmit) {
      await this.markNotification(notif.i);
      return false;
    }

    const existMultisig = await this.identifiers.getIdentifier(
      exchange?.exn?.e?.exn?.i
    );
    if (!existMultisig) {
      await this.markNotification(notif.i);
      return false;
    }

    const previousExnGrantMsg = await this.props.signifyClient
      .exchanges()
      .get(exchange?.exn.e.exn.p);

    const existingCredential = await this.props.signifyClient
      .credentials()
      .get(previousExnGrantMsg.exn.e.acdc.d)
      .catch(() => undefined);

    if (existingCredential) {
      await this.markNotification(notif.i);
      return false;
    }
    return true;
  }

  private async processExnIpexAgreeNotification(
    notif: Notification
  ): Promise<boolean> {
    const existingLinkedIpexRecord = await this.ipexMessageStorage
      .getIpexMessageMetadata(notif.a.d)
      .catch((error) => {
        if (
          error.message ===
          IpexMessageStorage.IPEX_MESSAGE_METADATA_RECORD_MISSING
        ) {
          return undefined;
        } else {
          throw error;
        }
      });
    if (!existingLinkedIpexRecord) {
      const exchange = await this.props.signifyClient
        .exchanges()
        .get(notif.a.d);
      await this.ipexCommunications.createLinkedIpexMessageRecord(
        exchange,
        ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE
      );
    }
    await this.ipexCommunications.grantAcdcFromAgree(notif.a.d);
    await this.markNotification(notif.i);
    return false;
  }

  private async createNotificationRecord(
    event: Notification
  ): Promise<KeriaNotification> {
    const exchange = await this.props.signifyClient.exchanges().get(event.a.d);

    const metadata: any = {
      id: event.i,
      a: event.a,
      read: false,
      route: event.a.r,
      connectionId: exchange.exn.i,
    };
    if (
      event.a.r === NotificationRoute.MultiSigIcp ||
      event.a.r === NotificationRoute.MultiSigRpy
    ) {
      const multisigNotification = await this.props.signifyClient
        .groups()
        .getRequest(event.a.d)
        .catch((error) => {
          const status = error.message.split(" - ")[1];
          if (/404/gi.test(status)) {
            return [];
          } else {
            throw error;
          }
        });
      if (multisigNotification && multisigNotification.length) {
        metadata.multisigId = multisigNotification[0].exn?.a?.gid;
      }
    }
    const result = await this.notificationStorage.save(metadata);
    return {
      id: result.id,
      createdAt: result.createdAt.toISOString(),
      a: result.a,
      multisigId: result.multisigId,
      connectionId: result.connectionId,
      read: result.read,
    };
  }

  async readNotification(notificationId: string) {
    const notificationRecord = await this.notificationStorage.findById(
      notificationId
    );
    if (!notificationRecord) {
      throw new Error(KeriaNotificationService.NOTIFICATION_NOT_FOUND);
    }
    notificationRecord.read = true;
    await this.notificationStorage.update(notificationRecord);
  }

  async unreadNotification(notificationId: string) {
    const notificationRecord = await this.notificationStorage.findById(
      notificationId
    );
    if (!notificationRecord) {
      throw new Error(KeriaNotificationService.NOTIFICATION_NOT_FOUND);
    }
    notificationRecord.read = false;
    await this.notificationStorage.update(notificationRecord);
  }

  async getAllNotifications(): Promise<KeriaNotification[]> {
    const notifications = await this.notificationStorage.getAll();
    return notifications.map((notification) => {
      return {
        id: notification.id,
        createdAt: notification.createdAt.toISOString(),
        a: notification.a,
        multisigId: notification.multisigId,
        connectionId: notification.connectionId,
        read: notification.read,
      };
    });
  }

  private async markNotification(notiSaid: string) {
    return this.props.signifyClient.notifications().mark(notiSaid);
  }

  async findNotificationsByMultisigId(multisigId: string) {
    const notificationRecord = await this.notificationStorage.findAllByQuery({
      multisigId,
    });
    return notificationRecord;
  }

  async pollLongOperationsWithCb(callback: OperationCallback) {
    this.pendingOperations = await this.operationPendingStorage.getAll();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.getKeriaOnlineStatus()) {
        await new Promise((rs) =>
          setTimeout(rs, KeriaNotificationService.POLL_KERIA_INTERVAL)
        );
        continue;
      }

      if (this.pendingOperations.length > 0) {
        for (const pendingOperation of this.pendingOperations) {
          await this.processOperation(pendingOperation, callback);
        }
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 250);
      });
    }
  }

  async processOperation(
    operationRecord: OperationPendingRecord,
    callback: OperationCallback
  ) {
    let operation;
    try {
      operation = await this.props.signifyClient
        .operations()
        .get(operationRecord.id);
    } catch (error) {
      // Possible that bootAndConnect is called from @OnlineOnly in between loops,
      // so check if its gone down to avoid having 2 bootAndConnect loops
      if (this.getKeriaOnlineStatus()) {
        this.markAgentStatus(false);
        // This will hang the loop until the connection is secured again
        await this.connect();
      }
    }

    if (operation && operation.done) {
      const recordId = operationRecord.id.replace(
        `${operationRecord.recordType}.`,
        ""
      );
      switch (operationRecord.recordType) {
      case OperationPendingRecordType.Group: {
        await this.identifierStorage.updateIdentifierMetadata(recordId, {
          isPending: false,
        });
        // Trigger add end role authorization for multi-sigs
        const multisigIdentifier =
            await this.identifierStorage.getIdentifierMetadata(recordId);
        await this.multiSigs.endRoleAuthorization(
          multisigIdentifier.signifyName
        );
        callback({
          opType: operationRecord.recordType,
          oid: recordId,
        });
        break;
      }
      case OperationPendingRecordType.Witness: {
        await this.identifierStorage.updateIdentifierMetadata(recordId, {
          isPending: false,
        });
        callback({
          opType: operationRecord.recordType,
          oid: recordId,
        });
        break;
      }
      case OperationPendingRecordType.Oobi: {
        const connectionRecord = await this.connectionStorage.findById(
          (operation.response as any).i
        );
        if (connectionRecord) {
          connectionRecord.pending = false;
          connectionRecord.createdAt = (operation.response as any).dt;
          await this.connectionStorage.update(connectionRecord);
        }
        callback({
          opType: operationRecord.recordType,
          oid: recordId,
        });
        break;
      }
      case OperationPendingRecordType.ExchangeReceiveCredential: {
        const admitExchange = await this.props.signifyClient
          .exchanges()
          .get(operation.metadata?.said);
        if (admitExchange.exn.r === ExchangeRoute.IpexAdmit) {
          const grantExchange = await this.props.signifyClient
            .exchanges()
            .get(admitExchange.exn.p);
          const credentialId = grantExchange.exn.e.acdc.d;
          if (credentialId) {
            await this.ipexCommunications.markAcdc(
              credentialId,
              CredentialStatus.CONFIRMED
            );
          }
        }
        break;
      }
      case OperationPendingRecordType.ExchangeRevokeCredential: {
        const admitExchange = await this.props.signifyClient
          .exchanges()
          .get(operation.metadata?.said);
        if (admitExchange.exn.r === ExchangeRoute.IpexAdmit) {
          const grantExchange = await this.props.signifyClient
            .exchanges()
            .get(admitExchange.exn.p);
          const credentialId = grantExchange?.exn?.e?.acdc?.d;
          const credentialMetadata =
              await this.credentialStorage.getCredentialMetadata(credentialId);
          const credential = await this.props.signifyClient
            .credentials()
            .get(credentialId);
          if (
            credential &&
              credential.status.s === "1" &&
              credentialMetadata?.status !== CredentialStatus.REVOKED
          ) {
            await this.ipexCommunications.markAcdc(
              credentialId,
              CredentialStatus.REVOKED
            );
            await this.ipexCommunications.createLinkedIpexMessageRecord(
              grantExchange,
              ConnectionHistoryType.CREDENTIAL_REVOKED
            );
            const metadata: any = {
              id: uuidv4(),
              a: {
                r: NotificationRoute.LocalAcdcRevoked,
                credentialId,
                credentialTitle: credential.schema.title,
              },
              read: false,
              route: NotificationRoute.LocalAcdcRevoked,
            };
            await this.notificationStorage.save(metadata);
            callback({
              opType: operationRecord.recordType,
              oid: recordId,
            });
          }
        }
        break;
      }
      default:
        break;
      }
      await this.operationPendingStorage.deleteById(operationRecord.id);
      this.pendingOperations.splice(
        this.pendingOperations.indexOf(operationRecord),
        1
      );
    }
  }

  addPendingOperationToQueue(pendingOperation: OperationPendingRecord) {
    this.pendingOperations.push(pendingOperation);
  }
}

export { KeriaNotificationService };
