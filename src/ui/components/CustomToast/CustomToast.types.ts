import { ToastMsgType } from "../../globals/types";

interface CustomToastProps {
  showToast: boolean;
  setShowToast: (value: boolean) => void;
  toastMsg: ToastMsgType | undefined;
}

export type { CustomToastProps };
