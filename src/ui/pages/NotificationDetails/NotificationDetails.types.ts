import { KeriaNotification } from "../../../core/agent/agent.types";

interface NotificationDetailState {
  notification: KeriaNotification;
  step?: number;
  openCredId?: string;
  selected?: boolean;
}

interface NotificationDetailsProps {
  pageId: string;
  activeStatus: boolean;
  notificationDetails: KeriaNotification;
  handleBack: () => void;
  multisigExn?: boolean;
}

export type { NotificationDetailsProps, NotificationDetailState };
