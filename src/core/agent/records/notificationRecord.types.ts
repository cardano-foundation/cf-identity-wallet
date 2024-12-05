import { Notification } from "../services/credentialService.types";

interface LinkedGroupRequestDetails {
  accepted: boolean;
  saids: Record<string, [string, string][]>;
}
interface NotificationAttempts {
  attempts: number;
  lastAttempt: number;
  notification: Notification;
}
export type { LinkedGroupRequestDetails, NotificationAttempts };
