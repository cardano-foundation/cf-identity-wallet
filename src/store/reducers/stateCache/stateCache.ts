import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  StateCacheProps,
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
} from "./stateCache.types";
import { RoutePath } from "../../../routes";

const initialState: StateCacheProps = {
  routes: [],
  authentication: {
    loggedIn: false,
    time: 0,
    passcodeIsSet: false,
    seedPhraseIsSet: false,
    passwordIsSet: false,
    passwordIsSkipped: true,
  },
  currentOperation: "",
  connectionRequest: "",
  defaultCryptoAccount: "",
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
    removeRoute: (state, action: PayloadAction<string>) => {
      state.routes = state.routes.filter(
        (route) => route.path !== action.payload
      );
    },
    removeSetPasscodeRoute: (state) => {
      state.routes = state.routes.filter(
        (route) => route.path !== RoutePath.SET_PASSCODE
      );
    },
    setAuthentication: (
      state,
      action: PayloadAction<AuthenticationCacheProps>
    ) => {
      state.authentication = action.payload;
    },
    setCurrentOperation: (state, action: PayloadAction<string>) => {
      state.currentOperation = action.payload;
    },
    setConnectionRequest: (state, action: PayloadAction<string>) => {
      state.connectionRequest = action.payload;
    },
  },
});

const {
  setCurrentRoute,
  removeCurrentRoute,
  removeSetPasscodeRoute,
  removeRoute,
  setAuthentication,
  setCurrentOperation,
  setConnectionRequest,
} = stateCacheSlice.actions;

const getStateCache = (state: RootState) => state.stateCache;
const getRoutes = (state: RootState) => state.stateCache.routes;
const getCurrentRoute = (state: RootState) =>
  state.stateCache.routes.length ? state.stateCache.routes[0] : undefined;
const getAuthentication = (state: RootState) => state.stateCache.authentication;
const getCurrentOperation = (state: RootState) =>
  state.stateCache.currentOperation;
const getConnectionRequest = (state: RootState) =>
  state.stateCache.connectionRequest;

export type {
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
};

export {
  initialState,
  getStateCache,
  stateCacheSlice,
  getRoutes,
  removeRoute,
  getCurrentRoute,
  setCurrentRoute,
  removeCurrentRoute,
  removeSetPasscodeRoute,
  getAuthentication,
  setAuthentication,
  getCurrentOperation,
  setCurrentOperation,
  setConnectionRequest,
  getConnectionRequest,
};
