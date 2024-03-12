import { AgentService } from "./agentService";
import {
  GenericRecordType,
  KeriNotification,
  KeriNotificationQuery,
} from "../agent.types";
import { Notification } from "./credentialService.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
class SignifyNotificationService extends AgentService {
  async onNotificationKeriStateChanged(
    callback: (event: KeriNotification) => void
  ) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await PreferencesStorage.get(PreferencesKeys.APP_NOTIFICATION_QUERIES);
      } catch (error) {
        /**Set the preference key */
        await PreferencesStorage.set(PreferencesKeys.APP_NOTIFICATION_QUERIES, {
          nextIndex: 0,
          lastNotificationId: "",
        });
      }
      const notificationQuery = (await PreferencesStorage.get(
        PreferencesKeys.APP_NOTIFICATION_QUERIES
      )) as unknown as KeriNotificationQuery;

      const startFetchingIndex =
        notificationQuery.nextIndex > 0
          ? notificationQuery.nextIndex - 1
          : notificationQuery.nextIndex;

      const notifications = await this.agent.modules.signify.getNotifications(
        startFetchingIndex,
        startFetchingIndex + 24
      );
      if (
        notificationQuery.nextIndex > 0 &&
        notifications.notes[0].i !== notificationQuery.lastNotificationId
      ) {
        /**This is to verify no notifications were deleted for some reason (which affects the batch range) */
        await PreferencesStorage.set(PreferencesKeys.APP_NOTIFICATION_QUERIES, {
          nextIndex: 0,
          lastNotificationId: "",
        });
        continue;
      }
      if (notificationQuery.nextIndex > 0) {
        /**Since the first item is the (next index - 1), we can ignore it */
        notifications.notes.shift();
      }
      for (const notif of notifications.notes) {
        await this.processNotification(notif, callback);
      }
      if (!notifications.notes.length) {
        await new Promise((rs) => {
          setTimeout(() => {
            rs(true);
          }, 2000);
        });
      } else {
        const nextNotificationIndex =
          startFetchingIndex + notifications.notes.length;
        await PreferencesStorage.set(PreferencesKeys.APP_NOTIFICATION_QUERIES, {
          nextIndex: nextNotificationIndex,
          lastNotificationId: notifications.notes[nextNotificationIndex - 1].i,
        });
      }
    }
  }

  async processNotification(
    notif: Notification,
    callback: (event: KeriNotification) => void
  ) {
    // We only process with the credential and the multisig at the moment
    if (
      Object.values(NotificationRoute).includes(
        notif.a.r as NotificationRoute
      ) &&
      !notif.r
    ) {
      const keriNoti = await this.createKeriNotificationRecord(notif);
      callback(keriNoti);
      await this.agent.modules.signify.markNotification(notif.i);
    } else if (!notif.r) {
      this.agent.modules.signify.markNotification(notif.i);
    }
  }

  private async createKeriNotificationRecord(
    event: Notification
  ): Promise<KeriNotification> {
    const result = await this.agent.genericRecords.save({
      id: event.i,
      content: event.a,
      tags: {
        type: GenericRecordType.NOTIFICATION_KERI,
        route: event.a.r,
      },
    });
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }
}

export { SignifyNotificationService };
