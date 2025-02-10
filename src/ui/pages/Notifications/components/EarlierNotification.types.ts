import { KeriaNotification } from "../../../../core/agent/agent.types";

interface EarlierNotificationProps {
  data: KeriaNotification[];
  pageId: string;
  onNotificationClick: (item: KeriaNotification) => void;
  onOpenOptionModal: (item: KeriaNotification) => void;
  onDelete: (item: KeriaNotification) => void;
  onToggle: (item: KeriaNotification) => void;
}

interface EarlierNotificationRef {
  reset: () => void;
}

export type { EarlierNotificationProps, EarlierNotificationRef };
