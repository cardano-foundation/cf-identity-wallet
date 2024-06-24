import { NotificationRoute } from "../../../core/agent/agent.types";

interface NotificationsProps {
  id: string;
  createdAt: string;
  label: string;
  read: boolean;
  route: NotificationRoute;
  connectionId: string;
}

export type { NotificationsProps };
