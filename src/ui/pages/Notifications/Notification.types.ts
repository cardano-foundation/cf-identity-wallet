import { KeriaNotification } from "../../../core/agent/agent.types";

// @TODO: Remove when UNDP was implemented on core
const UNDP_TYPE = "undp";

enum NotificationFilters {
  All = "all",
  Identifier = "identifiers",
  Credential = "credentials",
}

interface NotificationItemProps {
  item: KeriaNotification;
  onClick: (item: KeriaNotification) => void;
  onOptionButtonClick: (item: KeriaNotification) => void;
}

export { NotificationFilters, UNDP_TYPE };

export type { NotificationItemProps };
