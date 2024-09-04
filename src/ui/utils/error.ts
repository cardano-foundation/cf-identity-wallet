import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { setToastMsg, showCommonError } from "../../store/reducers/stateCache";
import { ToastMsgType } from "../globals/types";

const showError = (
  message: string,
  error: unknown,
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
  toastMessage?: ToastMsgType
) => {
  // eslint-disable-next-line no-console
  console.error(`${message}:`, error);

  if (toastMessage) {
    dispatch(setToastMsg(toastMessage));
  } else {
    dispatch(showCommonError(true));
  }
};

export { showError };
