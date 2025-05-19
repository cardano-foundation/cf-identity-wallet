import { Notification } from "../services/keriaNotificationService.types";

interface LinkedRequest {
  accepted: boolean;
  current?: string;
  previous?: string;
}

interface NotificationAttempts {
  attempts: number;
  lastAttempt: number;
  notification: Notification;
}

export type { LinkedRequest, NotificationAttempts };
