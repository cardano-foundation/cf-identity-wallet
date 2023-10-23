import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  StateCacheProps,
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  ConnectionCredentialRequestProps,
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
  defaultCryptoAccount: "",
  queueConnectionCredentialRequest: {
    isProcessing: false,
    queues: [],
    isPaused: false,
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
    setPauseQueueConnectionCredentialRequest: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.queueConnectionCredentialRequest = {
        ...state.queueConnectionCredentialRequest,
        isPaused: action.payload,
        isProcessing: !action.payload,
      };
    },
    setQueueConnectionCredentialRequest: (
      state,
      action: PayloadAction<ConnectionCredentialRequestProps>
    ) => {
      const isPaused = state.queueConnectionCredentialRequest.isPaused;
      if (!isPaused && !state.queueConnectionCredentialRequest.isProcessing) {
        state.queueConnectionCredentialRequest.isProcessing = true;
      }
      state.queueConnectionCredentialRequest.queues.push(action.payload);
    },
    dequeueCredentialCredentialRequest: (state) => {
      if (state.queueConnectionCredentialRequest.queues.length > 0) {
        state.queueConnectionCredentialRequest.queues.shift();
        const isPaused = state.queueConnectionCredentialRequest.isPaused;
        state.queueConnectionCredentialRequest.isProcessing = isPaused
          ? false
          : state.queueConnectionCredentialRequest.queues.length > 0;
      }
    },
    enqueueConnectionCredentialRequest: (
      state,
      action: PayloadAction<ConnectionCredentialRequestProps[]>
    ) => {
      const isPaused = state.queueConnectionCredentialRequest.isPaused;
      if (
        isPaused &&
        !state.queueConnectionCredentialRequest.isProcessing &&
        action.payload.length > 0
      ) {
        state.queueConnectionCredentialRequest.isProcessing = true;
      }
      state.queueConnectionCredentialRequest.queues =
        state.queueConnectionCredentialRequest.queues.concat(action.payload);
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
  dequeueCredentialCredentialRequest,
  setQueueConnectionCredentialRequest,
  setPauseQueueConnectionCredentialRequest,
  enqueueConnectionCredentialRequest,
} = stateCacheSlice.actions;

const getStateCache = (state: RootState) => state.stateCache;
const getRoutes = (state: RootState) => state.stateCache.routes;
const getCurrentRoute = (state: RootState) =>
  state.stateCache.routes.length ? state.stateCache.routes[0] : undefined;
const getAuthentication = (state: RootState) => state.stateCache.authentication;
const getCurrentOperation = (state: RootState) =>
  state.stateCache.currentOperation;
const getQueueConnectionCredentialRequest = (state: RootState) =>
  state.stateCache.queueConnectionCredentialRequest;

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
  getQueueConnectionCredentialRequest,
  setPauseQueueConnectionCredentialRequest,
  setQueueConnectionCredentialRequest,
  dequeueCredentialCredentialRequest,
  enqueueConnectionCredentialRequest,
};
