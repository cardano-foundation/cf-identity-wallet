import { AgentService } from "./agentService";
import { GenericRecordType, KeriNotification } from "../agent.types";
import { Notification } from "./credentialService.types";
import { NotificationRoute } from "../modules/signify/signifyApi.types";

class SignifyNotificationService extends AgentService {
  // @TODO - foconnor: This is just for the tunnel PoC.
  static readonly TUNNEL_DOMAIN_SCHEMA_SAID =
    "EGjD1gCLi9ecZSZp9zevkgZGyEX_MbOdmhBFt4o0wvdb";

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
      const exn = await this.agent.modules.signify.getKeriExchange(notif.a.d);
      if (
        exn?.exn?.e?.acdc?.s !==
        SignifyNotificationService.TUNNEL_DOMAIN_SCHEMA_SAID
      ) {
        const keriNoti = await this.createKeriNotificationRecord(notif);
        callback(keriNoti);
        await this.agent.modules.signify.markNotification(notif.i);
      }
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
