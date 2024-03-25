import { IonToast } from "@ionic/react";
import { ToastMsgType } from "../../globals/types";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getAuthentication,
  setToastMsg,
} from "../../../store/reducers/stateCache";
import { i18n } from "../../../i18n";
import { CustomToastProps } from "./CustomToast.types";

const CustomToast = ({
  showToast,
  setShowToast,
  toastMsg,
}: CustomToastProps) => {
  const dispatch = useAppDispatch();
  const authentication = useAppSelector(getAuthentication);
  const TOAST_DURATION = 1500;
  const username = authentication.userName;
  return (
    <IonToast
      isOpen={showToast}
      onDidDismiss={() => {
        setShowToast(false);
        dispatch(setToastMsg());
      }}
      message={
        toastMsg &&
        (toastMsg === ToastMsgType.USERNAME_CREATION_SUCCESS
          ? `${i18n.t("toast.usernamecreationsuccess", { username })}`
          : `${i18n.t("toast." + toastMsg.toLowerCase())}`)
      }
      color={toastMsg?.toLowerCase().includes("error") ? "danger" : "secondary"}
      position="top"
      cssClass="confirmation-toast"
      duration={TOAST_DURATION}
    />
  );
};

export default CustomToast;
