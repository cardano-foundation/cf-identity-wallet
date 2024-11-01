import { KeriaNotification } from "../../../core/agent/agent.types";

enum NotificationFilter {
  All = "all",
  Identifier = "identifiers",
  Credential = "credentials",
}

interface NotificationItemProps {
  item: KeriaNotification;
  onClick: (item: KeriaNotification) => void;
  onOptionButtonClick: (item: KeriaNotification) => void;
}

export { NotificationFilter };

export type { NotificationItemProps };
