import { AgentService } from "./agentService";
import { GenericRecordType, KeriNotification } from "../agent.types";
import { Notification } from "./credentialService.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";
export class SignifyNotificationService extends AgentService {
  async onNotificationKeriStateChanged(
    callback: (event: KeriNotification) => void
  ) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const notifications = await this.agent.modules.signify.getNotifications();
      for (const notif of notifications.notes) {
        await this.processNotification(notif, callback);
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 20000);
      });
    }
  }

  async processNotification(
    notif: Notification,
    callback: (event: KeriNotification) => void
  ) {
    // We only process with the credential and the multisig at the moment
    if (
      (notif.a.r === NotificationRoute.Credential ||
        notif.a.r === NotificationRoute.MultiSigIcp) &&
      !notif.r
    ) {
      const keriNoti = await this.createKeriNotificationRecord(notif);
      callback(keriNoti);
      await this.agent.modules.signify.markNotification(notif.i);
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
