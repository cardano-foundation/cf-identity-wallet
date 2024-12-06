import { CredentialsFilters } from "../../pages/Credentials/Credentials.types";
import { IdentifiersFilters } from "../../pages/Identifiers/Identifiers.types";
import { NotificationFilters } from "../../pages/Notifications/Notification.types";

type AllowedChipFilter =
  | NotificationFilters
  | IdentifiersFilters
  | CredentialsFilters;
interface FilterChipProps {
  filter: AllowedChipFilter;
  label: string;
  isActive: boolean;
  onClick: (filter: AllowedChipFilter) => void;
}

export type { AllowedChipFilter, FilterChipProps };
