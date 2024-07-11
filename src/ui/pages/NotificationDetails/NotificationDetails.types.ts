import { KeriaNotification } from "../../../core/agent/agent.types";

interface NotificationDetailsProps {
  pageId: string;
  activeStatus: boolean;
  notificationDetails: KeriaNotification;
  handleBack: () => void;
}

export type { NotificationDetailsProps };
