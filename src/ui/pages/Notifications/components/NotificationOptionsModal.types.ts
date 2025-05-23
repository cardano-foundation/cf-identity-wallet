import { KeriaNotification } from "../../../../core/agent/services/keriaNotificationService.types";

interface NotificationOptionModalProps {
  optionsIsOpen: boolean;
  notification: KeriaNotification;
  setCloseModal: () => void;
  onShowDetail: (notification: KeriaNotification) => void;
}

export type { NotificationOptionModalProps };
