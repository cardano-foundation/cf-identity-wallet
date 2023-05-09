import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import { ROUTES } from "../../../routes";

interface CurrentRouteCacheProps {
  path: string;
  payload?: { [key: string]: any };
}

interface AuthenticationCacheProps {
  loggedIn: boolean;
  time: number;
  passcodeIsSet: boolean;
}

interface StateCacheProps {
  routes: CurrentRouteCacheProps[];
  authentication: AuthenticationCacheProps;
}

const initialState: StateCacheProps = {
  routes: [],
  authentication: {
    loggedIn: false,
    time: 0,
    passcodeIsSet: false,
  },
};

const StateCacheSlice = createSlice({
  name: "stateCache",
  initialState,
  reducers: {
    setCurrentRoute: (state, action: PayloadAction<CurrentRouteCacheProps>) => {
      if ([ROUTES.PASSCODE_LOGIN_ROUTE, "/"].includes(action.payload.path))
        return;
      const filteredRoutes = state.routes.filter(
        (route) => action.payload.path !== route.path
      );
      state.routes = [action.payload, ...filteredRoutes];
    },
    setAuthentication: (
      state,
      action: PayloadAction<AuthenticationCacheProps>
    ) => {
      state.authentication = action.payload;
    },
  },
});

const { setCurrentRoute, setAuthentication } = StateCacheSlice.actions;

const getState = (state: RootState) => state;
const getStateCache = (state: RootState) => state.stateCache;
const getRoutes = (state: RootState) => state.stateCache.routes;
const getCurrentRoute = (state: RootState) =>
  state.stateCache.routes.length ? state.stateCache.routes[0] : {};
const getAuthentication = (state: RootState) => state.stateCache.authentication;

export type {
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
};

export {
  initialState,
  StateCacheSlice,
  setCurrentRoute,
  setAuthentication,
  getState,
  getStateCache,
  getCurrentRoute,
  getAuthentication,
};
