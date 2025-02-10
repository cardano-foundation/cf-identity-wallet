import { KeriaNotification } from "../../../core/agent/agent.types";

enum NotificationFilters {
  All = "all",
  Identifier = "identifiers",
  Credential = "credentials",
}

interface NotificationItemProps {
  item: KeriaNotification;
  onClick: (item: KeriaNotification) => void;
  onOptionButtonClick: (item: KeriaNotification) => void;
  onDelete: (item: KeriaNotification) => void;
  onReadToggle: (item: KeriaNotification) => void;
}

export { NotificationFilters };

export type { NotificationItemProps };
