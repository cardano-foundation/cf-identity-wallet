interface LinkedGroupRequestDetails {
  accepted: boolean;
  saids: Record<string, [string, string][]>;
}
interface NotificationAttempts {
  attempts: number;
  lastAttempt: number;
  notificationId : string
}
export type { LinkedGroupRequestDetails, NotificationAttempts };
