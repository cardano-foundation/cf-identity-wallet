import { KeriaNotification } from "../../../core/agent/agent.types";

interface NotificationDetailsProps {
  pageId: string;
  activeStatus: boolean;
  notificationDetails: KeriaNotification;
  handleBack: () => void;
  handleNotificationDelete: (id: string) => void;
}

export type { NotificationDetailsProps };
