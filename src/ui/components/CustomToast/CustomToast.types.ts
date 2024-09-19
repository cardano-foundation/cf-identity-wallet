import { ToastStackItem } from "../../../store/reducers/stateCache/stateCache.types";

interface ToastMessageProps {
  showToast?: boolean;
  setShowToast?: (value: boolean) => void;
  toastMsg: ToastStackItem;
  index: number;
}

export type { ToastMessageProps };
