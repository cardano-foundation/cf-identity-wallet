import { AgentService } from "./agentService";
import { GenericRecordType, KeriNotification } from "../agent.types";
import { Notification } from "./credentialService.types";
// TODO: DUPLICATE WITH NOTIFICATION IN CRED SERVICE, HANDLE THIS
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
    const keriNoti = {
      id: notif.i,
      a: notif.a,
      createdAt: new Date(),
    } as KeriNotification;
    // todo: save data
    if (!notif.r) {
      await this.agent.modules.signify.markNotification(notif.i);
      callback(keriNoti);
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
      },
    });
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.content,
    };
  }

  private async getKeriNotifications(): Promise<KeriNotification[]> {
    const results = await this.agent.genericRecords.findAllByQuery({
      type: GenericRecordType.NOTIFICATION_KERI,
    });
    return results.map((result) => {
      return {
        id: result.id,
        createdAt: result.createdAt,
        a: result.content,
      };
    });
  }
}
