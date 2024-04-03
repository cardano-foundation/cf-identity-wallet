import { AgentService } from "./agentService";
import { KeriNotification, KeriaNotificationMarker } from "../agent.types";
import { Notification } from "./credentialService.types";
import {
  MultiSigExnMessage,
  NotificationRoute,
} from "../modules/signify/signifyApi.types";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
import { RecordType } from "../../storage/storage.types";

class SignifyNotificationService extends AgentService {
  // @TODO - foconnor: This is just for the tunnel PoC.
  static readonly TUNNEL_DOMAIN_SCHEMA_SAID =
    "EGjD1gCLi9ecZSZp9zevkgZGyEX_MbOdmhBFt4o0wvdb";

  static readonly KERI_NOTIFICATION_NOT_FOUND =
    "Keri notification record not found";

  async onNotificationKeriStateChanged(
    callback: (event: KeriNotification) => void
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

      const notifications = await this.signifyApi.getNotifications(
        startFetchingIndex,
        startFetchingIndex + 24
      );
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
      const exn = await this.signifyApi.getKeriExchange(notif.a.d);
      if (notif.a.r === NotificationRoute.TunnelPing) {
        const toId = exn?.exn?.a?.to;
        if (!toId) {
          await this.signifyApi.markNotification(notif.i);
          return;
        }

        const ourIdentifier = await this.signifyApi.getIdentifierById(toId);
        if (!ourIdentifier) {
          await this.signifyApi.markNotification(notif.i);
          return;
        }

        await this.signifyApi.sendExn(
          ourIdentifier.name,
          await this.signifyApi.getIdentifierByName(ourIdentifier.name), // @TODO - foconnor: Shouldn't need this call too (typing issue)
          "tunnel",
          NotificationRoute.TunnelPong,
          {},
          [exn?.exn?.i],
          {}
        );

        await this.signifyApi.markNotification(notif.i);
        return;
      }

      // @TODO - foconnor: This stops us from showing pop-ups for multi-sig joins
      // but this should be done better.
      if (notif.a.r === NotificationRoute.MultiSigIcp) {
        const msgSaid = notif.a.d as string;
        const icpMsg: MultiSigExnMessage[] =
          await this.signifyApi.getMultisigMessageBySaid(msgSaid);

        if (icpMsg.length > 0) {
          const identifiers = await this.signifyApi.getAllIdentifiers();
          const ms = identifiers.aids.find(
            (identifier) => identifier.prefix === icpMsg[0].exn.a.gid
          );
          if (ms) {
            return;
          }
        }
      }

      if (
        exn?.exn?.e?.acdc?.s !==
        SignifyNotificationService.TUNNEL_DOMAIN_SCHEMA_SAID
      ) {
        const keriNoti = await this.createKeriNotificationRecord(notif);
        callback(keriNoti);
        await this.signifyApi.markNotification(notif.i);
      }
    } else if (!notif.r) {
      this.signifyApi.markNotification(notif.i);
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
        isDismissed: false,
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

  async dismissNotification(notificationId: string) {
    const notificationRecord = await this.basicStorage.findById(notificationId);
    if (!notificationRecord) {
      throw new Error(SignifyNotificationService.KERI_NOTIFICATION_NOT_FOUND);
    }
    notificationRecord.setTag("isDismissed", true);
    await this.basicStorage.update(notificationRecord);
  }

  /**This allow us to get all dismissed notifications */
  async getDismissedNotifications() {
    const notifications = await this.basicStorage.findAllByQuery(
      RecordType.NOTIFICATION_KERI,
      {
        isDismissed: true,
      }
    );
    return notifications;
  }
}

export { SignifyNotificationService };
