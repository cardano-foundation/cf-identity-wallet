import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  StateCacheProps,
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  ConnectionCredentialRequestProps,
} from "./stateCache.types";
import { RoutePath } from "../../../routes";
import { OperationType, ToastMsgType } from "../../../ui/globals/types";

const initialState: StateCacheProps = {
  initialized: false,
  routes: [],
  authentication: {
    loggedIn: false,
    time: 0,
    passcodeIsSet: false,
    seedPhraseIsSet: false,
    passwordIsSet: false,
    passwordIsSkipped: true,
  },
  currentOperation: OperationType.IDLE,
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
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
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
    setCurrentOperation: (state, action: PayloadAction<OperationType>) => {
      state.currentOperation = action.payload;
    },
    setToastMsg: (state, action: PayloadAction<ToastMsgType | undefined>) => {
      state.toastMsg = action.payload;
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
  setInitialized,
  setCurrentRoute,
  removeCurrentRoute,
  removeSetPasscodeRoute,
  removeRoute,
  setAuthentication,
  setCurrentOperation,
  setToastMsg,
  dequeueCredentialCredentialRequest,
  setQueueConnectionCredentialRequest,
  setPauseQueueConnectionCredentialRequest,
  enqueueConnectionCredentialRequest,
} = stateCacheSlice.actions;

const getStateCache = (state: RootState) => state.stateCache;
const getIsInitialized = (state: RootState) => state.stateCache.initialized;
const getRoutes = (state: RootState) => state.stateCache.routes;
const getCurrentRoute = (state: RootState) =>
  state.stateCache.routes.length ? state.stateCache.routes[0] : undefined;
const getAuthentication = (state: RootState) => state.stateCache.authentication;
const getCurrentOperation = (state: RootState) =>
  state.stateCache.currentOperation;
const getToastMsg = (state: RootState) => state.stateCache.toastMsg;
const getQueueConnectionCredentialRequest = (state: RootState) =>
  state.stateCache.queueConnectionCredentialRequest;

export type {
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
};

export {
  initialState,
  setInitialized,
  getIsInitialized,
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
  getToastMsg,
  setToastMsg,
  getQueueConnectionCredentialRequest,
  setPauseQueueConnectionCredentialRequest,
  setQueueConnectionCredentialRequest,
  dequeueCredentialCredentialRequest,
  enqueueConnectionCredentialRequest,
};
