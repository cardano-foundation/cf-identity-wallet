import { AgentService } from "./agentService";
import {
  AgentServicesProps,
  ExchangeRoute,
  KeriaNotification,
  KeriaNotificationMarker,
  MiscRecordId,
  NotificationRoute,
} from "../agent.types";
import { Notification } from "./credentialService.types";
import {
  BasicRecord,
  ConnectionStorage,
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

class SignifyNotificationService extends AgentService {
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly POLL_KERIA_INTERVAL = 2000;
  static readonly LOGIN_INTERVAL = 25;

  protected readonly notificationStorage!: NotificationStorage;
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  protected readonly connectionStorage: ConnectionStorage;
  protected readonly ipexMessageStorage: IpexMessageStorage;

  protected pendingOperations: OperationPendingRecord[] = [];
  private loggedIn = true;

  constructor(
    agentServiceProps: AgentServicesProps,
    notificationStorage: NotificationStorage,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage,
    connectionStorage: ConnectionStorage,
    ipexMessageStorage: IpexMessageStorage
  ) {
    super(agentServiceProps);
    this.notificationStorage = notificationStorage;
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
    this.connectionStorage = connectionStorage;
    this.ipexMessageStorage = ipexMessageStorage;
  }

  async onNotificationStateChanged(
    callback: (event: KeriaNotification) => void
  ) {
    let notificationQuery = {
      nextIndex: 0,
      lastNotificationId: "",
    };
    const notificationQueryRecord = await Agent.agent.basicStorage.findById(
      MiscRecordId.KERIA_NOTIFICATION_MARKER
    );
    if (!notificationQueryRecord) {
      await Agent.agent.basicStorage.save({
        id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
        content: notificationQuery,
      });
    } else
      notificationQuery =
        notificationQueryRecord.content as unknown as KeriaNotificationMarker;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.loggedIn) {
        await new Promise((rs) =>
          setTimeout(rs, SignifyNotificationService.LOGIN_INTERVAL)
        );
        continue;
      }

      if (!Agent.agent.getKeriaOnlineStatus()) {
        await new Promise((rs) =>
          setTimeout(rs, SignifyNotificationService.POLL_KERIA_INTERVAL)
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
        // Possible that bootAndConnect is called from @OnlineOnly in between loops,
        // so check if its gone down to avoid having 2 bootAndConnect loops
        if (Agent.agent.getKeriaOnlineStatus()) {
          // This will hang the loop until the connection is secured again
          await Agent.agent.connect();
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
        await Agent.agent.basicStorage.createOrUpdateBasicRecord(
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
        await this.processNotification(notif, callback);
      }
      if (notifications.notes.length) {
        const nextNotificationIndex =
          notificationQuery.nextIndex + notifications.notes.length;
        notificationQuery = {
          nextIndex: nextNotificationIndex,
          lastNotificationId:
            notifications.notes[notifications.notes.length - 1].i,
        };
        await Agent.agent.basicStorage.createOrUpdateBasicRecord(
          new BasicRecord({
            id: MiscRecordId.KERIA_NOTIFICATION_MARKER,
            content: notificationQuery,
          })
        );
      } else {
        await new Promise((rs) =>
          setTimeout(rs, SignifyNotificationService.POLL_KERIA_INTERVAL)
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

  async deleteNotificationRecordById(id: string): Promise<void> {
    await this.markNotification(id);
    await this.notificationStorage.deleteById(id);
  }

  async processNotification(
    notif: Notification,
    callback: (event: KeriaNotification) => void
  ) {
    if (notif.r) {
      return;
    }
    if (notif.a.r === NotificationRoute.ExnIpexApply) {
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
        await Agent.agent.ipexCommunications.createLinkedIpexMessageRecord(
          exchange,
          ConnectionHistoryType.CREDENTIAL_REQUEST_PRESENT
        );
      }
    }
    if (notif.a.r === NotificationRoute.ExnIpexGrant) {
      const exchange = await this.props.signifyClient
        .exchanges()
        .get(notif.a.d);
      const existingCredential = await this.props.signifyClient
        .credentials()
        .get(exchange.exn.e.acdc.d)
        .catch(() => undefined);
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
        return;
      }
      if (existingCredential) {
        const dt = new Date().toISOString().replace("Z", "000+00:00");
        const [admit, sigs, aend] = await this.props.signifyClient
          .ipex()
          .admit(ourIdentifier.signifyName, "", notif.a.d, dt);
        await this.props.signifyClient
          .ipex()
          .submitAdmit(ourIdentifier.signifyName, admit, sigs, aend, [
            exchange.exn.i,
          ]);
        await Agent.agent.ipexCommunications.createLinkedIpexMessageRecord(
          exchange,
          ConnectionHistoryType.CREDENTIAL_UPDATE
        );
        await this.markNotification(notif.i);
        return;
      } else {
        await Agent.agent.ipexCommunications.createLinkedIpexMessageRecord(
          exchange,
          ConnectionHistoryType.CREDENTIAL_ISSUANCE
        );
      }
    }
    if (notif.a.r === NotificationRoute.MultiSigRpy) {
      const multisigNotification = await this.props.signifyClient
        .groups()
        .getRequest(notif.a.d)
        .catch((error) => {
          const errorStack = (error as Error).stack as string;
          const status = errorStack.split("-")[1];
          if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
            return [];
          } else {
            throw error;
          }
        });
      if (!multisigNotification || !multisigNotification.length) {
        await this.markNotification(notif.i);
        return;
      }
      const multisigId = multisigNotification[0]?.exn?.a?.gid;
      if (!multisigId) {
        await this.markNotification(notif.i);
        return;
      }
      const multisigIdentifier = await this.identifierStorage
        .getIdentifierMetadata(multisigId)
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
      if (!multisigIdentifier) {
        await this.markNotification(notif.i);
        return;
      }
      const rpyRoute = multisigNotification[0].exn.e.rpy.r;
      if (rpyRoute === "/end/role/add") {
        await Agent.agent.multiSigs.joinAuthorization(
          multisigNotification[0].exn
        );
        await this.markNotification(notif.i);
        return;
      }
    }
    if (notif.a.r === NotificationRoute.MultiSigIcp) {
      const multisigNotification = await this.props.signifyClient
        .groups()
        .getRequest(notif.a.d)
        .catch((error) => {
          const errorStack = (error as Error).stack as string;
          const status = errorStack.split("-")[1];
          if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
            return [];
          } else {
            throw error;
          }
        });
      if (!multisigNotification || !multisigNotification.length) {
        await this.markNotification(notif.i);
        return;
      }
      const multisigId = multisigNotification[0]?.exn?.a?.gid;
      if (!multisigId) {
        await this.markNotification(notif.i);
        return;
      }
      const hasMultisig = await Agent.agent.multiSigs.hasMultisig(multisigId);
      const notificationsForThisMultisig =
        await this.findNotificationsByMultisigId(multisigId);
      if (hasMultisig || notificationsForThisMultisig.length) {
        await this.markNotification(notif.i);
        return;
      }
    }

    if (notif.a.r === NotificationRoute.ExnIpexAgree) {
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
        await Agent.agent.ipexCommunications.createLinkedIpexMessageRecord(
          exchange,
          ConnectionHistoryType.CREDENTIAL_REQUEST_AGREE
        );
      }
      await Agent.agent.ipexCommunications.grantAcdcFromAgree(notif.a.d);
      await this.markNotification(notif.i);
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
          const errorStack = (error as Error).stack as string;
          const status = errorStack.split("-")[1];
          if (/404/gi.test(status) && /SignifyClient/gi.test(errorStack)) {
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
      throw new Error(SignifyNotificationService.NOTIFICATION_NOT_FOUND);
    }
    notificationRecord.read = true;
    await this.notificationStorage.update(notificationRecord);
  }

  async unreadNotification(notificationId: string) {
    const notificationRecord = await this.notificationStorage.findById(
      notificationId
    );
    if (!notificationRecord) {
      throw new Error(SignifyNotificationService.NOTIFICATION_NOT_FOUND);
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

  async onSignifyOperationStateChanged(
    callback: ({
      oid,
      opType,
    }: {
      oid: string;
      opType: OperationPendingRecordType;
    }) => void
  ) {
    this.pendingOperations = await this.operationPendingStorage.getAll();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!Agent.agent.getKeriaOnlineStatus()) {
        await new Promise((rs) =>
          setTimeout(rs, SignifyNotificationService.POLL_KERIA_INTERVAL)
        );
        continue;
      }

      if (this.pendingOperations.length > 0) {
        for (const pendingOperation of this.pendingOperations) {
          let operation;
          try {
            operation = await this.props.signifyClient
              .operations()
              .get(pendingOperation.id);
          } catch (error) {
            // Possible that bootAndConnect is called from @OnlineOnly in between loops,
            // so check if its gone down to avoid having 2 bootAndConnect loops
            if (Agent.agent.getKeriaOnlineStatus()) {
              // This will hang the loop until the connection is secured again
              await Agent.agent.connect();
            }
          }

          if (operation && operation.done) {
            const recordId = pendingOperation.id.replace(
              `${pendingOperation.recordType}.`,
              ""
            );
            switch (pendingOperation.recordType) {
            case OperationPendingRecordType.Group: {
              await this.identifierStorage.updateIdentifierMetadata(
                recordId,
                {
                  isPending: false,
                }
              );
              // Trigger add end role authorization for multi-sigs
              const multisigIdentifier =
                  await this.identifierStorage.getIdentifierMetadata(recordId);
              await Agent.agent.multiSigs.endRoleAuthorization(
                multisigIdentifier.signifyName
              );
              callback({
                opType: pendingOperation.recordType,
                oid: recordId,
              });
              break;
            }
            case OperationPendingRecordType.Witness: {
              await this.identifierStorage.updateIdentifierMetadata(
                recordId,
                {
                  isPending: false,
                }
              );
              callback({
                opType: pendingOperation.recordType,
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
                opType: pendingOperation.recordType,
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
                  await Agent.agent.ipexCommunications.markAcdcComplete(
                    credentialId
                  );
                }
              }
              break;
            }
            default:
              break;
            }
            await this.operationPendingStorage.deleteById(pendingOperation.id);
            this.pendingOperations.splice(
              this.pendingOperations.indexOf(pendingOperation),
              1
            );
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

  addPendingOperationToQueue(pendingOperation: OperationPendingRecord) {
    this.pendingOperations.push(pendingOperation);
  }
}

export { SignifyNotificationService };
