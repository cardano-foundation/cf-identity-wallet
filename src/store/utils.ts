import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { ThunkAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { DataProps } from "../routes/nextRoute/nextRoute.types";
import { clearBiometricsCache } from "./reducers/biometricsCache";
import { clearConnectionsCache } from "./reducers/connectionsCache";
import { clearCredArchivedCache } from "./reducers/credsArchivedCache";
import { clearCredCache } from "./reducers/credsCache";
import { clearIdentifierCache } from "./reducers/identifiersCache";
import { clearSeedPhraseCache } from "./reducers/seedPhraseCache";
import { clearSSIAgent } from "./reducers/ssiAgent";
import { clearStateCache } from "./reducers/stateCache";
import { clearViewTypeCache } from "./reducers/viewTypeCache";
import { clearNotifications } from "./reducers/notificationsCache";
import { clearWalletConnection } from "./reducers/walletConnectionsCache";

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

const CLEAR_STORE_ACTIONS = [
  clearIdentifierCache,
  clearCredArchivedCache,
  clearCredCache,
  clearConnectionsCache,
  clearBiometricsCache,
  clearSeedPhraseCache,
  clearSSIAgent,
  clearStateCache,
  clearViewTypeCache,
  clearNotifications,
  clearWalletConnection,
];

export { updateReduxState, CLEAR_STORE_ACTIONS };
