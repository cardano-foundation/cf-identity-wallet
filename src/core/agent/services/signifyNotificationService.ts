import { AgentService } from "./agentService";
import {
  AgentServicesProps,
  KeriaNotification,
  KeriaNotificationMarker,
  NotificationRoute,
} from "../agent.types";
import { Notification } from "./credentialService.types";
import { PreferencesKeys, PreferencesStorage } from "../../storage";
import { IdentifierStorage, NotificationStorage } from "../records";
import { IdentifierShortDetails } from "./identifier.types";

class SignifyNotificationService extends AgentService {
  static readonly NOTIFICATION_NOT_FOUND = "Notification record not found";

  protected readonly notificationStorage!: NotificationStorage;
  protected readonly identifierStorage: IdentifierStorage;

  constructor(
    agentServiceProps: AgentServicesProps,
    notificationStorage: NotificationStorage,
    identifierStorage: IdentifierStorage
  ) {
    super(agentServiceProps);
    this.notificationStorage = notificationStorage;
    this.identifierStorage = identifierStorage;
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
    const result = await this.notificationStorage.save({
      id: event.i,
      a: event.a,
      isDismissed: false,
      route: event.a.r,
    });
    return {
      id: result.id,
      createdAt: result.createdAt,
      a: result.a,
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

  async onSignifyOperationStateChanged(
    callback: (identifierShortDetails: IdentifierShortDetails) => void
  ) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const pendingIdentifiers =
        await this.identifierStorage.getAllPendingIdentifierMetadata();
      if (pendingIdentifiers.length > 0) {
        const promises = await Promise.allSettled(
          pendingIdentifiers.map((aid) => {
            return this.signifyClient.operations().get(aid.signifyOpName!);
          })
        );
        for (const pm of promises) {
          if (pm.status === "fulfilled") {
            const operation = pm.value;
            if (operation.done) {
              const aid = pendingIdentifiers.find(
                (aid) => aid.signifyOpName === operation.name
              )!;
              await this.identifierStorage.updateIdentifierMetadata(aid.id, {
                isPending: false,
              });
              callback({
                displayName: aid.displayName,
                id: aid.id,
                signifyName: aid.signifyName,
                createdAtUTC: aid.createdAt.toISOString(),
                theme: aid.theme,
                isPending: false,
                delegated: aid.delegated,
              });
            }
          } else {
            //TODO: must handle case get operation failed
          }
        }
      }
      await new Promise((rs) => {
        setTimeout(() => {
          rs(true);
        }, 2000);
      });
    }
  }
}

export { SignifyNotificationService };
