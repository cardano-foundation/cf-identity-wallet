import { AnyAction, ThunkDispatch } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { setToastMsg } from "../../store/reducers/stateCache";
import { ToastMsgType } from "../globals/types";

const showError = (
  message: string,
  error: unknown,
  dispatch?: ThunkDispatch<RootState, undefined, AnyAction>,
  toastMessage?: ToastMsgType
) => {
  // eslint-disable-next-line no-console
  console.error(`${message}:`, error);
  if (dispatch) {
    dispatch(setToastMsg(toastMessage));
  }
};

export { showError };
