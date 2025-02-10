import { KeriaNotification } from "../../../../core/agent/agent.types";

interface NotificationOptionModalProps {
  optionsIsOpen: boolean;
  notification: KeriaNotification;
  setCloseModal: () => void;
  onShowDetail: (notification: KeriaNotification) => void;
  onToggleNotification: (notification: KeriaNotification) => void;
  onDeleteNotification: (notification: KeriaNotification) => void;
}

export type { NotificationOptionModalProps };
