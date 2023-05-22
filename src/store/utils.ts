import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { DataProps } from "../routes/nextRoute/nextRoute.types";

const updateReduxState = (
  nextRoute: string,
  data: DataProps,
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
  functions: ((
    data: DataProps
  ) => ThunkAction<void, RootState, undefined, AnyAction>)[]
) => {
  if (data.state) {
    data.state.nextRoute = nextRoute;
  } else {
    data.state = { nextRoute };
  }
  functions.forEach((fn) => {
    if (fn) dispatch(fn(data));
  });
};

export { updateReduxState };
