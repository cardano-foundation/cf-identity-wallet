import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook } from "react-redux";
import { RootState } from "./index";

const updateReduxState = (
  dispatch: TypedUseSelectorHook<RootState>,
  functions: (() => ThunkAction<void, RootState, undefined, AnyAction>)[]
) => {
  functions.forEach(
    (fn: () => ThunkAction<void, RootState, undefined, AnyAction>) => {
      if (fn) {
        const dispatchFn = fn as ThunkAction<
          void,
          RootState,
          undefined,
          AnyAction
        >;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        dispatch(dispatchFn());
      }
    }
  );
};

export { updateReduxState };
