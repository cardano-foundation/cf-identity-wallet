import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "./index";

const updateReduxState = (
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
  functions: (() =>
    | AnyAction
    | ThunkAction<void, RootState, undefined, AnyAction>)[]
) => {
  functions.forEach(
    (
      fn: () => AnyAction | ThunkAction<void, RootState, undefined, AnyAction>
    ) => {
      if (fn) {
        dispatch(fn());
      }
    }
  );
};

export { updateReduxState };
