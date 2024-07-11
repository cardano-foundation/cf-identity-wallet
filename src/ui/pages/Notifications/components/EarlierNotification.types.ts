import { KeriaNotification } from "../../../../core/agent/agent.types";

interface EarlierNotificationProps {
  data: KeriaNotification[];
  pageId: string;
  onNotificationClick: (item: KeriaNotification) => void;
}

interface EarlierNotificationRef {
  reset: () => void;
}

export type { EarlierNotificationProps, EarlierNotificationRef };
