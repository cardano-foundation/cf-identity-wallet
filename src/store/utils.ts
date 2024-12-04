import { AnyAction } from "redux";
import { ThunkDispatch } from "redux-thunk";
import { DataProps, UpdateRedux } from "../routes/nextRoute/nextRoute.types";
import { RootState } from "./index";

const updateReduxState = (
  nextRoute: string,
  data: DataProps,
  dispatch: ThunkDispatch<RootState, undefined, AnyAction>,
  functions: UpdateRedux[]
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
