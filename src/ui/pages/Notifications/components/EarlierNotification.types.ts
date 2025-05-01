import { KeriaNotification } from "../../../../core/agent/services/keriaNotificationService.types";

interface EarlierNotificationProps {
  data: KeriaNotification[];
  pageId: string;
  onNotificationClick: (item: KeriaNotification) => void;
  onOpenOptionModal: (item: KeriaNotification) => void;
}

interface EarlierNotificationRef {
  reset: () => void;
}

export type { EarlierNotificationProps, EarlierNotificationRef };
