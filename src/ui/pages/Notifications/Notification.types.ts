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

interface FilterChipProps {
  filter: NotificationFilter;
  label: string;
  isActive: boolean;
  onClick: (filter: NotificationFilter) => void;
}

export { NotificationFilter };

export type { NotificationItemProps, FilterChipProps };
