import { IdentifiersFilters } from "../../pages/Identifiers/Identifiers.types";
import { NotificationFilters } from "../../pages/Notifications/Notification.types";

interface FilterChipProps {
  filter: NotificationFilters | IdentifiersFilters;
  label: string;
  isActive: boolean;
  onClick: (filter: NotificationFilters | IdentifiersFilters) => void;
}

export type { FilterChipProps };
