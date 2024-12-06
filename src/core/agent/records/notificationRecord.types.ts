import { Notification } from "../services/credentialService.types";

interface LinkedGroupRequest {
  accepted: boolean;
  current?: string;
  previous?: string;
}

interface NotificationAttempts {
  attempts: number;
  lastAttempt: number;
  notification: Notification;
}

export type { LinkedGroupRequest, NotificationAttempts };
