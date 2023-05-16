import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  StateCacheProps,
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
} from "./stateCache.types";

const initialState: StateCacheProps = {
  routes: [],
  authentication: {
    loggedIn: false,
    time: 0,
    passcodeIsSet: false,
  },
};

const stateCacheSlice = createSlice({
  name: "stateCache",
  initialState,
  reducers: {
    setCurrentRoute: (state, action: PayloadAction<CurrentRouteCacheProps>) => {
      const filteredRoutes = state.routes.filter(
        (route) => action.payload.path !== route.path
      );
      state.routes = [action.payload, ...filteredRoutes];
    },
    removeCurrentRoute: (state) => {
      state.routes = state.routes.slice(1);
    },
    removeRoute: (state,  action: PayloadAction<string>) => {
      state.routes = state.routes.filter(route => route.path !== action.payload);
    },
    setAuthentication: (
      state,
      action: PayloadAction<AuthenticationCacheProps>
    ) => {
      state.authentication = action.payload;
    },
  },
});

const { setCurrentRoute, removeCurrentRoute, setAuthentication, removeRoute } =
  stateCacheSlice.actions;

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
  stateCacheSlice,
  getRoutes,
  setCurrentRoute,
  removeCurrentRoute,
  removeRoute,
  setAuthentication,
  getState,
  getStateCache,
  getCurrentRoute,
  getAuthentication,
};
