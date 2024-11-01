import { NotificationFilter } from "../../pages/Notifications/Notification.types";

interface FilterChipProps {
  filter: NotificationFilter;
  label: string;
  isActive: boolean;
  onClick: (filter: NotificationFilter) => void;
}

export type { FilterChipProps };
