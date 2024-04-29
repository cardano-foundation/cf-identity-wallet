import { AgentService } from "./agentService";
import {
  KeriaNotification,
  KeriaNotificationMarker,
  NotificationRoute,
} from "../agent.types";
import { Notification } from "./credentialService.types";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
import { RecordType } from "../../storage/storage.types";

class SignifyNotificationService extends AgentService {
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";

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
        /**Set the preference key */
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
      const startFetchingIndex =
        notificationQuery.nextIndex > 0 ? notificationQuery.nextIndex - 1 : 0;

      const notifications = await this.signifyClient
        .notifications()
        .list(startFetchingIndex, startFetchingIndex + 24);
      if (
        notificationQuery.nextIndex > 0 &&
        (notifications.notes.length == 0 ||
          notifications.notes[0].i !== notificationQuery.lastNotificationId)
      ) {
        /**This is to verify no notifications were deleted for some reason (which affects the batch range) */
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
        /**Since the first item is the (next index - 1), we can ignore it */
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
        await PreferencesStorage.set(
          PreferencesKeys.APP_KERIA_NOTIFICATION_MARKER,
          notificationQuery
        );
      } else {
        await new Promise((rs) => {
          setTimeout(() => {
            rs(true);
          }, 2000);
        });
      }
    }
  }

  async deleteNotificationRecordById(id: string): Promise<void> {
    await this.basicStorage.deleteById(id);
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
    const result = await this.basicStorage.save({
      id: event.i,
      content: event.a,
      tags: {
        isDismissed: false,
        type: RecordType.KERIA_NOTIFICATION,
        route: event.a.r,
      },
    });
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }

  async dismissNotification(notificationId: string) {
    const notificationRecord = await this.basicStorage.findById(notificationId);
    if (!notificationRecord) {
      throw new Error(SignifyNotificationService.NOTIFICATION_NOT_FOUND);
    }
    notificationRecord.setTag("isDismissed", true);
    await this.basicStorage.update(notificationRecord);
  }

  // This allow us to get all dismissed notifications
  async getDismissedNotifications() {
    const notifications = await this.basicStorage.findAllByQuery({
      isDismissed: true,
      type: RecordType.KERIA_NOTIFICATION,
    });
    return notifications;
  }

  private markNotification(notiSaid: string) {
    return this.signifyClient.notifications().mark(notiSaid);
  }
}

export { SignifyNotificationService };
