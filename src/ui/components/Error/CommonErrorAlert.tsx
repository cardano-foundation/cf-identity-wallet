import { useCallback } from "react";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getShowCommonError,
  showCommonError,
} from "../../../store/reducers/stateCache";
import { Alert } from "../Alert";
import { CommonErrorAlertProps } from "./Error.types";

const CommonErrorAlert = ({
  isOpen,
  setIsOpen,
  actionConfirm,
  dataTestId,
}: CommonErrorAlertProps) => {
  return (
    <Alert
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      dataTestId={dataTestId}
      headerText={i18n.t("error.text")}
      confirmButtonText={`${i18n.t("error.button")}`}
      actionConfirm={actionConfirm}
      className="app-error-alert"
    />
  );
};

const AppCommonErrorAlert = () => {
  const dispatch = useAppDispatch();
  const isShowCommonError = useAppSelector(getShowCommonError);

  const showError = useCallback(
    (value: boolean) => {
      dispatch(showCommonError(value));
    },
    [dispatch]
  );

  const closeError = useCallback(() => {
    showError(false);
  }, [showError]);

  return (
    <CommonErrorAlert
      isOpen={!!isShowCommonError}
      setIsOpen={showError}
      actionConfirm={closeError}
      dataTestId="app-error-alert"
    />
  );
};

export { CommonErrorAlert, AppCommonErrorAlert };
