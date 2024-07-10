import { KeriaNotification } from "../../../../core/agent/agent.types";

interface NotificationOptionModalProps {
  optionsIsOpen: boolean;
  notification: KeriaNotification;
  setOptionsIsOpen: (value: boolean) => void;
  onShowDetail: (notification: KeriaNotification) => void;
}

export type { NotificationOptionModalProps };
