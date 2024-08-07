interface PopupProps {
  title: string;
  description: string;
  button: string;
}

interface RemovePendingAlertProps {
  pageId: string;
  openFirstCheck: boolean;
  onClose: () => void;
  firstCheckProps: PopupProps;
  secondCheckTitle: string;
  onDeletePendingItem: () => void;
}

export type { RemovePendingAlertProps };
