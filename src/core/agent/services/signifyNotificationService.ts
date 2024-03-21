import { AgentService } from "./agentService";
import { Notification } from "./credentialService.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";
import { RecordType } from "../../storage/storage.types";
import { KeriNotification } from "../agent.types";
class SignifyNotificationService extends AgentService {
  async onNotificationKeriStateChanged(
    callback: (event: KeriNotification) => void
  ) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const notifications = await this.signifyApi.getNotifications();
      for (const notif of notifications.notes) {
        await this.processNotification(notif, callback);
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 2000);
      });
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
      await this.signifyApi.markNotification(notif.i);
    }
  }

  private async createKeriNotificationRecord(
    event: Notification
  ): Promise<KeriNotification> {
    const result = await this.basicStorage.save({
      id: event.i,
      content: event.a,
      type: RecordType.NOTIFICATION_KERI,
      tags: {
        type: RecordType.NOTIFICATION_KERI,
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
