import { AgentService } from "./agentService";
import {
  AgentServicesProps,
  KeriaNotification,
  KeriaNotificationMarker,
  NotificationRoute,
} from "../agent.types";
import { Notification } from "./credentialService.types";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
import { NotificationStorage } from "../records";
import { Agent } from "../agent";

class SignifyNotificationService extends AgentService {
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";
  static readonly POLL_KERIA_INTERVAL = 5000;

  protected readonly notificationStorage!: NotificationStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    notificationStorage: NotificationStorage
  ) {
    super(agentServiceProps);
    this.notificationStorage = notificationStorage;
  }

  async onNotificationStateChanged(
    callback: (event: KeriaNotification) => void
  ) {
    let notificationQuery = {
      nextIndex: 0,
      lastNotificationId: "",
    };
    try {
      notificationQuery = (await PreferencesStorage.get(
        PreferencesKeys.APP_KERIA_NOTIFICATION_MARKER
      )) as unknown as KeriaNotificationMarker;
    } catch (error) {
      if (
        (error as Error).message ==
        `${PreferencesStorage.KEY_NOT_FOUND} ${PreferencesKeys.APP_KERIA_NOTIFICATION_MARKER}`
      ) {
        // Set the preference key
        await PreferencesStorage.set(
          PreferencesKeys.APP_KERIA_NOTIFICATION_MARKER,
          {
            nextIndex: 0,
            lastNotificationId: "",
          }
        );
      } else {
        throw error;
      }
    }
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
        await PreferencesStorage.set(
          PreferencesKeys.APP_KERIA_NOTIFICATION_MARKER,
          notificationQuery
        );
        continue;
      }
      if (notificationQuery.nextIndex > 0) {
        // Since the first item is the (next index - 1), we can ignore it
        notifications.notes.shift();
      }
      for (const notif of notifications.notes) {
        if (notif.a.r === NotificationRoute.MultiSigIcp) {
          const multisigNotification = await this.signifyClient
            .groups()
            .getRequest(notif.a.d);
          const multisigId = multisigNotification[0]?.exn?.a?.gid;
          if (!multisigId) {
            continue;
          }
          const isMultisigInitiator =
            await Agent.agent.multiSigs.isMultisigInitiator(multisigId);
          const notificationForThisMultisig =
            await Agent.agent.signifyNotifications.findNotificationByMultisigId(
              multisigId
            );
          if (isMultisigInitiator && notificationForThisMultisig) {
            continue;
          }
        }
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
        await PreferencesStorage.set(
          PreferencesKeys.APP_KERIA_NOTIFICATION_MARKER,
          notificationQuery
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
      const multisigId = multisigNotification[0]?.exn?.a?.gid;
      metadata.multisigId = multisigId;
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

  async findNotificationByMultisigId(multisigId: string) {
    const notificationRecord = await this.notificationStorage.findAllByQuery({
      multisigId,
    });
    return notificationRecord;
  }
}

export { SignifyNotificationService };
