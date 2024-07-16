import { KeriaNotification } from "../../../../core/agent/agent.types";

interface NotificationOptionModalProps {
  optionsIsOpen: boolean;
  notification: KeriaNotification;
  setCloseModal: () => void;
  onShowDetail: (notification: KeriaNotification) => void;
}

export type { NotificationOptionModalProps };
