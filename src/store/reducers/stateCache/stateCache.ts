import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  StateCacheProps,
  AuthenticationCacheProps,
  CurrentRouteCacheProps,
  IncomingRequestProps,
} from "./stateCache.types";
import { RoutePath } from "../../../routes";
import { OperationType, ToastMsgType } from "../../../ui/globals/types";

const initialState: StateCacheProps = {
  initialized: false,
  routes: [],
  authentication: {
    loggedIn: false,
    userName: "",
    time: 0,
    passcodeIsSet: false,
    seedPhraseIsSet: false,
    passwordIsSet: false,
    passwordIsSkipped: true,
  },
  currentOperation: OperationType.IDLE,
  queueIncomingRequest: {
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
    logout: (state) => {
      state.routes = [{ path: RoutePath.PASSCODE_LOGIN }, ...state.routes];
      state.authentication = {
        ...state.authentication,
        loggedIn: false,
      };
      state.queueIncomingRequest = {
        ...state.queueIncomingRequest,
        isPaused: true,
        isProcessing: false,
      };
    },
    login: (state) => {
      state.authentication = {
        ...state.authentication,
        loggedIn: true,
        time: Date.now(),
      };
      state.queueIncomingRequest = {
        ...state.queueIncomingRequest,
        isPaused: false,
        isProcessing: true,
      };
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
    setPauseQueueIncomingRequest: (state, action: PayloadAction<boolean>) => {
      state.queueIncomingRequest = {
        ...state.queueIncomingRequest,
        isPaused: action.payload,
        isProcessing: !action.payload,
      };
    },
    setQueueIncomingRequest: (
      state,
      action: PayloadAction<IncomingRequestProps>
    ) => {
      const isPaused = state.queueIncomingRequest.isPaused;
      if (!isPaused && !state.queueIncomingRequest.isProcessing) {
        state.queueIncomingRequest.isProcessing = true;
      }
      state.queueIncomingRequest.queues.push(action.payload);
    },
    dequeueCredentialRequest: (state) => {
      if (state.queueIncomingRequest.queues.length > 0) {
        state.queueIncomingRequest.queues.shift();
        const isPaused = state.queueIncomingRequest.isPaused;
        state.queueIncomingRequest.isProcessing = isPaused
          ? false
          : state.queueIncomingRequest.queues.length > 0;
      }
    },
    enqueueIncomingRequest: (
      state,
      action: PayloadAction<IncomingRequestProps[]>
    ) => {
      const isPaused = state.queueIncomingRequest.isPaused;
      if (
        isPaused &&
        !state.queueIncomingRequest.isProcessing &&
        action.payload.length > 0
      ) {
        state.queueIncomingRequest.isProcessing = true;
      }
      state.queueIncomingRequest.queues =
        state.queueIncomingRequest.queues.concat(action.payload);
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
  logout,
  login,
  setCurrentOperation,
  setToastMsg,
  dequeueCredentialRequest,
  setQueueIncomingRequest,
  setPauseQueueIncomingRequest,
  enqueueIncomingRequest,
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
const getQueueIncomingRequest = (state: RootState) =>
  state.stateCache.queueIncomingRequest;

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
  logout,
  login,
  setAuthentication,
  getCurrentOperation,
  setCurrentOperation,
  getToastMsg,
  setToastMsg,
  getQueueIncomingRequest,
  setPauseQueueIncomingRequest,
  setQueueIncomingRequest,
  dequeueCredentialRequest,
  enqueueIncomingRequest,
};
