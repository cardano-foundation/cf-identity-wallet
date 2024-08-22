import { KeriaNotification } from "../../../core/agent/agent.types";

interface NotificationDetailCacheState {
  notificationId: string;
  step: number;
  viewCred?: string;
  checked?: boolean;
}

interface NotificationCacheState {
  notifications: KeriaNotification[];
}

export type { NotificationCacheState, NotificationDetailCacheState };
