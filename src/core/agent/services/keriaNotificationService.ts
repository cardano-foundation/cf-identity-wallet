import { v4 as uuidv4 } from "uuid";
import { AgentService } from "./agentService";
import {
  AgentServicesProps,
  ExchangeRoute,
  KeriaNotification,
  KeriaNotificationMarker,
  MiscRecordId,
  NotificationRoute,
} from "../agent.types";
import { CredentialStatus, Notification } from "./credentialService.types";
import {
  BasicRecord,
  BasicStorage,
  ConnectionStorage,
  CredentialStorage,
  IdentifierStorage,
  IpexMessageStorage,
  NotificationRecordStorageProps,
  NotificationStorage,
  OperationPendingStorage,
} from "../records";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";
import { OperationPendingRecord } from "../records/operationPendingRecord";
import { IonicStorage } from "../../storage/ionicStorage";
import { ConnectionHistoryType } from "./connection.types";
import { MultiSigService } from "./multiSigService";
import { IpexCommunicationService } from "./ipexCommunicationService";
import { IdentifierService } from "./identifierService";
import {
  NotificationEvent,
  EventTypes,
  OperationPendingEvent,
} from "../event.types";

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

  async pollNotifications() {
    try {
      await this._pollNotifications();
    } catch (error) {
      /* eslint-disable no-console */
      console.error("Error at pollNotifications", error);
      setTimeout(
        this.pollNotifications,
        KeriaNotificationService.POLL_KERIA_INTERVAL
      );
    }
  }

  private async _pollNotifications() {
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
          await this.processNotification(notif);
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
          // @TODO - Consider how to track/retry old notifications we couldn't process
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

  async processNotification(notif: Notification) {
    if (
      notif.r ||
      !Object.values(NotificationRoute).includes(notif.a.r as NotificationRoute)
    ) {
      return;
    }
    let shouldCreateRecord = true;
    if (notif.a.r === NotificationRoute.ExnIpexApply) {
      shouldCreateRecord = await this.processExnIpexApplyNotification(notif);
    } else if (notif.a.r === NotificationRoute.ExnIpexAgree) {
      shouldCreateRecord = await this.processExnIpexAgreeNotification(notif);
    } else if (notif.a.r === NotificationRoute.ExnIpexGrant) {
      shouldCreateRecord = await this.processExnIpexGrantNotification(notif);
    } else if (notif.a.r === NotificationRoute.MultiSigRpy) {
      shouldCreateRecord = await this.processMultiSigRpyNotification(notif);
    } else if (notif.a.r === NotificationRoute.MultiSigIcp) {
      shouldCreateRecord = await this.processMultiSigIcpNotification(notif);
    } else if (notif.a.r === NotificationRoute.MultiSigExn) {
      shouldCreateRecord = await this.processMultiSigExnNotification(notif);
    }
    if (!shouldCreateRecord) {
      return;
    }

    try {
      const keriaNotif = await this.createNotificationRecord(notif);
      this.props.eventEmitter.emit<NotificationEvent>({
        type: EventTypes.Notification,
        payload: {
          keriaNotif,
        },
      });
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
        senderName: ourIdentifier.id,
        message: "",
        grantSaid: notif.a.d,
        datetime: dt,
        recipient: exchange.exn.i,
      });
      const op = await this.props.signifyClient
        .ipex()
        .submitAdmit(ourIdentifier.id, admit, sigs, aend, [exchange.exn.i]);
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

    switch (exchange?.exn?.e?.exn?.r) {
    case ExchangeRoute.IpexAdmit: {
      const previousExnMsg = await this.props.signifyClient
        .exchanges()
        .get(exchange?.exn.e.exn.p);

      const notificationsGrant =
          await this.notificationStorage.findAllByQuery({
            exnSaid: previousExnMsg.exn.d,
          });

      const existMultisig = await this.identifiers
        .getIdentifier(exchange?.exn?.e?.exn?.i)
        .catch((error) => {
          if (
            error.message ===
              IdentifierStorage.IDENTIFIER_METADATA_RECORD_MISSING
          ) {
            return undefined;
          } else {
            throw error;
          }
        });

      if (!existMultisig) {
        await this.markNotification(notif.i);
        return false;
      }

      const existingCredential = await this.props.signifyClient
        .credentials()
        .get(previousExnMsg.exn.e.acdc.d)
        .catch(() => undefined);

      if (existingCredential) {
        await this.markNotification(notif.i);
        return false;
      }

      if (notificationsGrant.length) {
        const notificationRecord = notificationsGrant[0];
        if (
          !Object.values(notificationRecord.linkedGroupRequests).includes(
            true
          )
        ) {
          notificationRecord.linkedGroupRequests = {
            ...notificationRecord.linkedGroupRequests,
            [exchange.exn.d]: false,
          };
        } else {
          await this.ipexCommunications.acceptAcdcFromMultisigExn(
            exchange.exn.d
          );
          notificationRecord.linkedGroupRequests = {
            ...notificationRecord.linkedGroupRequests,
            [exchange.exn.d]: true,
          };
        }
        await this.notificationStorage.update(notificationRecord);
      }
      await this.markNotification(notif.i);
      return false;
    }
    case ExchangeRoute.IpexOffer: {
      const previousExnMsgApply = await this.props.signifyClient
        .exchanges()
        .get(exchange?.exn.e.exn.p);

      const notificationsApply =
          await this.notificationStorage.findAllByQuery({
            exnSaid: previousExnMsgApply.exn.d,
          });

      if (notificationsApply.length) {
        const notificationRecord = notificationsApply[0];
        const acdcSaid = exchange.exn.e.exn?.e?.acdc?.a?.d;

        if (
          !notificationRecord.linkedGroupRequests ||
            Object.keys(notificationRecord.linkedGroupRequests).length === 0 ||
            notificationRecord.linkedGroupRequests.acdcSaid?.accepted === false
        ) {
          notificationRecord.linkedGroupRequests = {
            [acdcSaid]: {
              accepted: false,
              saids: [exchange.exn.d],
            },
          };
        }
      }
      await this.markNotification(notif.i);
      return false;
    }
    case ExchangeRoute.IpexAgree: {
      const previousExnMsgAgree = await this.props.signifyClient
        .exchanges()
        .get(exchange?.exn.e.exn.p);

      const notificationsAgree =
          await this.notificationStorage.findAllByQuery({
            exnSaid: previousExnMsgAgree.exn.d,
          });
      if (notificationsAgree.length) {
        const notificationRecord = notificationsAgree[0];

        if (
          !Object.values(notificationRecord.linkedGroupRequests).includes(
            true
          )
        ) {
          notificationRecord.linkedGroupRequests = {
            ...notificationRecord.linkedGroupRequests,
            [exchange.exn.d]: false,
          };
        } else {
          await this.ipexCommunications.grantAcdcFromAgree(exchange.exn.d);
          notificationRecord.linkedGroupRequests = {
            ...notificationRecord.linkedGroupRequests,
            [exchange.exn.d]: true,
          };
        }
        await this.notificationStorage.update(notificationRecord);
      }
      await this.markNotification(notif.i);
      return false;
    }
    default:
      await this.markNotification(notif.i);
      return false;
    }
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
    return true;
  }

  private async createNotificationRecord(
    event: Notification
  ): Promise<KeriaNotification> {
    const exchange = await this.props.signifyClient.exchanges().get(event.a.d);

    const metadata: NotificationRecordStorageProps = {
      id: event.i,
      a: event.a,
      read: false,
      route: event.a.r as NotificationRoute,
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

  async pollLongOperations() {
    try {
      await this._pollLongOperations();
    } catch (error) {
      console.error("Error at pollLongOperations", error);
      setTimeout(
        this.pollLongOperations,
        KeriaNotificationService.POLL_KERIA_INTERVAL
      );
    }
  }

  async _pollLongOperations() {
    this.pendingOperations = await this.operationPendingStorage.getAll();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.loggedIn || !this.getKeriaOnlineStatus()) {
        await new Promise((rs) =>
          setTimeout(rs, KeriaNotificationService.CHECK_READINESS_INTERNAL)
        );
        continue;
      }

      if (this.pendingOperations.length > 0) {
        for (const pendingOperation of this.pendingOperations) {
          try {
            await this.processOperation(pendingOperation);
          } catch (error) {
            console.error("Error when process a operation", error);
          }
        }
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 250);
      });
    }
  }

  async processOperation(operationRecord: OperationPendingRecord) {
    let operation;
    try {
      operation = await this.props.signifyClient
        .operations()
        .get(operationRecord.id);
    } catch (error) {
      const errorMessage = (error as Error).message;
      /** If the error is failed to fetch with signify,
       * we retry until the connection is secured*/
      if (
        (/Failed to fetch/gi.test(errorMessage) ||
          /Load failed/gi.test(errorMessage)) &&
        this.getKeriaOnlineStatus()
      ) {
        this.markAgentStatus(false);
        // This will hang the loop until the connection is secured again
        await this.connect();
      } else {
        throw error;
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
        await this.multiSigs.endRoleAuthorization(multisigIdentifier.id);
        this.props.eventEmitter.emit<OperationPendingEvent>({
          type: EventTypes.Operation,
          payload: {
            opType: operationRecord.recordType,
            oid: recordId,
          },
        });
        break;
      }
      case OperationPendingRecordType.Witness: {
        await this.identifierStorage.updateIdentifierMetadata(recordId, {
          isPending: false,
        });
        this.props.eventEmitter.emit<OperationPendingEvent>({
          type: EventTypes.Operation,
          payload: {
            opType: operationRecord.recordType,
            oid: recordId,
          },
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
        this.props.eventEmitter.emit<OperationPendingEvent>({
          type: EventTypes.Operation,
          payload: {
            opType: operationRecord.recordType,
            oid: recordId,
          },
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
            const holder = await this.identifierStorage.getIdentifierMetadata(
              admitExchange.exn.i
            );
            if (holder.multisigManageAid) {
              const notifications =
                  await this.notificationStorage.findAllByQuery({
                    exnSaid: grantExchange.exn.d,
                  });
              for (const notification of notifications) {
                // @TODO: Delete other long running operations in linkedGroupRequests
                await this.deleteNotificationRecordById(
                  notification.id,
                    notification.a.r as NotificationRoute
                );
              }
            }
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
            this.props.eventEmitter.emit<OperationPendingEvent>({
              type: EventTypes.Operation,
              payload: {
                opType: operationRecord.recordType,
                oid: recordId,
              },
            });
          }
        }
        break;
      }
      case OperationPendingRecordType.ExchangeOfferCredential: {
        const offerExchange = await this.props.signifyClient
          .exchanges()
          .get(operation.metadata?.said);

        if (offerExchange.exn.r === ExchangeRoute.IpexOffer) {
          const applyExchange = await this.props.signifyClient
            .exchanges()
            .get(offerExchange.exn.p);

          const holder = await this.identifierStorage.getIdentifierMetadata(
            offerExchange.exn.i
          );
          if (holder.multisigManageAid) {
            const notifications =
                await this.notificationStorage.findAllByQuery({
                  exnSaid: applyExchange.exn.d,
                });
            for (const notification of notifications) {
              // @TODO: Delete other long running operations in linkedGroupRequests
              await this.deleteNotificationRecordById(
                notification.id,
                  notification.a.r as NotificationRoute
              );
            }
          }
        }
        break;
      }
      case OperationPendingRecordType.ExchangePresentCredential: {
        const grantExchange = await this.props.signifyClient
          .exchanges()
          .get(operation.metadata?.said);
        if (grantExchange.exn.r === ExchangeRoute.IpexAgree) {
          const agreeExchange = await this.props.signifyClient
            .exchanges()
            .get(grantExchange.exn.p);
          const credentialId = agreeExchange.exn.e.acdc.d;
          if (credentialId) {
            const holder = await this.identifierStorage.getIdentifierMetadata(
              grantExchange.exn.i
            );
            if (holder.multisigManageAid) {
              const notifications =
                  await this.notificationStorage.findAllByQuery({
                    exnSaid: agreeExchange.exn.d,
                  });
              for (const notification of notifications) {
                // @TODO: Delete other long running operations in linkedGroupRequests
                await this.deleteNotificationRecordById(
                  notification.id,
                    notification.a.r as NotificationRoute
                );
              }
            }
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

  onNewNotification(callback: (event: NotificationEvent) => void) {
    this.props.eventEmitter.on(EventTypes.Notification, callback);
  }

  onLongOperationComplete(callback: (event: OperationPendingEvent) => void) {
    this.props.eventEmitter.on(EventTypes.Operation, callback);
  }
}

export { KeriaNotificationService };
