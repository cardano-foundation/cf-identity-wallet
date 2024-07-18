import { KeriaNotification } from "../../../core/agent/agent.types";

interface NotificationDetailCacheState {
  notificationId: string;
  step: number;
  viewCred?: string;
  checked?: boolean;
}

interface NotificationCacheState {
  notifications: KeriaNotification[];
  notificationDetailCache?: NotificationDetailCacheState | null;
}

export type { NotificationCacheState, NotificationDetailCacheState };
