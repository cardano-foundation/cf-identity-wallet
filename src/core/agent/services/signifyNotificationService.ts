import { AgentService } from "./agentService";
import {
  AgentServicesProps,
  KeriaNotification,
  KeriaNotificationMarker,
  MiscRecordId,
  NotificationRoute,
} from "../agent.types";
import { Notification } from "./credentialService.types";
import {
  BasicRecord,
  IdentifierStorage,
  NotificationStorage,
  OperationPendingStorage,
} from "../records";
import { Agent } from "../agent";
import { IdentifierShortDetails } from "./identifier.types";
import { OperationPendingRecordType } from "../records/operationPendingRecord.type";

class SignifyNotificationService extends AgentService {
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly POLL_KERIA_INTERVAL = 5000;

  protected readonly notificationStorage!: NotificationStorage;
  protected readonly identifierStorage: IdentifierStorage;
  protected readonly operationPendingStorage: OperationPendingStorage;
  
  constructor(
    agentServiceProps: AgentServicesProps,
    notificationStorage: NotificationStorage,
    identifierStorage: IdentifierStorage,
    operationPendingStorage: OperationPendingStorage
  ) {
    super(agentServiceProps);
    this.notificationStorage = notificationStorage;
    this.identifierStorage = identifierStorage;
    this.operationPendingStorage = operationPendingStorage;
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
        notifications = await this.signifyClient
          .notifications()
          .list(startFetchingIndex, startFetchingIndex + 24);
      } catch (error) {
        // Possible that bootAndConnect is called from @OnlineOnly in between loops,
        // so check if its gone down to avoid having 2 bootAndConnect loops
        if (Agent.agent.getKeriaOnlineStatus()) {
          // This will hang the loop until the connection is secured again
          await Agent.agent.bootAndConnect();
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

  async deleteNotificationRecordById(id: string): Promise<void> {
    await this.notificationStorage.deleteById(id);
  }

  async processNotification(
    notif: Notification,
    callback: (event: KeriaNotification) => void
  ) {
    // We only process with the credential and the multisig at the moment
    if (notif.a.r === NotificationRoute.MultiSigIcp) {
      const multisigNotification = await this.signifyClient
        .groups()
        .getRequest(notif.a.d);
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
    if (
      Object.values(NotificationRoute).includes(
        notif.a.r as NotificationRoute
      ) &&
      !notif.r
    ) {
      const keriaNotif = await this.createNotificationRecord(notif);
      callback(keriaNotif);
      await this.markNotification(notif.i);
    } else if (!notif.r) {
      this.markNotification(notif.i);
    }
    return;
  }

  private async createNotificationRecord(
    event: Notification
  ): Promise<KeriaNotification> {
    const metadata: any = {
      id: event.i,
      a: event.a,
      isDismissed: false,
      route: event.a.r,
    };
    if (event.a.r === NotificationRoute.MultiSigIcp) {
      const multisigNotification = await this.signifyClient
        .groups()
        .getRequest(event.a.d);
      if (multisigNotification && multisigNotification.length) {
        metadata.multisigId = multisigNotification[0].exn?.a?.gid;
      }
    }
    const result = await this.notificationStorage.save(metadata);
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.a,
      multisigId: result.multisigId,
    };
  }

  async dismissNotification(notificationId: string) {
    const notificationRecord = await this.notificationStorage.findById(
      notificationId
    );
    if (!notificationRecord) {
      throw new Error(SignifyNotificationService.NOTIFICATION_NOT_FOUND);
    }
    notificationRecord.setTag("isDismissed", true);
    await this.notificationStorage.update(notificationRecord);
  }

  // This allow us to get all dismissed notifications
  async getDismissedNotifications() {
    const notifications = await this.notificationStorage.findAllByQuery({
      isDismissed: true,
    });
    return notifications;
  }

  private markNotification(notiSaid: string) {
    return this.signifyClient.notifications().mark(notiSaid);
  }

  async findNotificationsByMultisigId(multisigId: string) {
    const notificationRecord = await this.notificationStorage.findAllByQuery({
      multisigId,
    });
    return notificationRecord;
  }
  async onSignifyOperationStateChanged(
    callback: ({ record, recordType }: {record: IdentifierShortDetails, recordType: OperationPendingRecordType}) => void
  ) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const pendingOperations =
        await this.operationPendingStorage.getAll();
      if (pendingOperations.length > 0) {
        for (const pendingOperation of pendingOperations) {
          const operation = await  this.signifyClient.operations().get(pendingOperation.id);
          if (operation.done) {
            switch (pendingOperation.recordType) {
            case OperationPendingRecordType.IDENTIFIER: {
              const aid = await this.identifierStorage.getIdentifierMetadata(pendingOperation.recordId);
              await this.identifierStorage.updateIdentifierMetadata(aid.id, {
                isPending: false,
              });
              callback({
                recordType: pendingOperation.recordType,
                record: {
                  displayName: aid.displayName,
                  id: aid.id,
                  signifyName: aid.signifyName,
                  createdAtUTC: aid.createdAt.toISOString(),
                  theme: aid.theme,
                  isPending: false,
                }
              });
              await this.operationPendingStorage.deleteById(pendingOperation.id);
              break;
            }
            default:
              break;
            }
          }
        }
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 20000);
      });
    }
  }
}

export { SignifyNotificationService };
