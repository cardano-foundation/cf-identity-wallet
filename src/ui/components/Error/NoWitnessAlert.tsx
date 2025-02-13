import { useCallback } from "react";
import { i18n } from "../../../i18n";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getShowNoWitnessAlert,
  showNoWitnessAlert,
} from "../../../store/reducers/stateCache";
import { Alert } from "../Alert";

const NoWitnessAlert = () => {
  const dispatch = useAppDispatch();
  const isShowNoWitnessAlert = useAppSelector(getShowNoWitnessAlert);

  const closeAlert = useCallback(() => {
    dispatch(showNoWitnessAlert(false));
  }, [dispatch]);

  return (
    <Alert
      isOpen={!!isShowNoWitnessAlert}
      setIsOpen={closeAlert}
      dataTestId="no-witness-error-alert"
      headerText={i18n.t("nowitnesserror.text")}
      confirmButtonText={`${i18n.t("nowitnesserror.button")}`}
      actionConfirm={closeAlert}
      className="no-witness-error-alert"
    />
  );
};

export { NoWitnessAlert };
