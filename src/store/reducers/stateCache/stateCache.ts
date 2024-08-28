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
import { LoginAttempts } from "../../../core/agent/services/auth.types";

const initialState: StateCacheProps = {
  initialized: false,
  isOnline: false,
  routes: [],
  authentication: {
    loggedIn: false,
    userName: "",
    time: 0,
    passcodeIsSet: false,
    seedPhraseIsSet: false,
    passwordIsSet: false,
    passwordIsSkipped: false,
    ssiAgentIsSet: false,
    recoveryWalletProgress: false,
    loginAttempt: {
      attempts: 0,
      lockedUntil: Date.now(),
    },
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
    setIsOnline: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
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
    setLoginAttempt: (state, action: PayloadAction<LoginAttempts>) => {
      state.authentication.loginAttempt = { ...action.payload };
    },
    login: (state) => {
      state.authentication = {
        ...state.authentication,
        loggedIn: true,
      };
    },
    logout: (state) => {
      state.authentication = {
        ...state.authentication,
        loggedIn: false,
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
    dequeueIncomingRequest: (state) => {
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
  login,
  logout,
  setAuthentication,
  setCurrentOperation,
  setToastMsg,
  dequeueIncomingRequest,
  setQueueIncomingRequest,
  setPauseQueueIncomingRequest,
  enqueueIncomingRequest,
  setIsOnline,
  setLoginAttempt,
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
const getIsOnline = (state: RootState) => state.stateCache.isOnline;
const getLoginAttempt = (state: RootState) =>
  state.stateCache.authentication.loginAttempt;

export type {
  CurrentRouteCacheProps,
  AuthenticationCacheProps,
  StateCacheProps,
};

export {
  setLoginAttempt,
  getLoginAttempt,
  setIsOnline,
  initialState,
  setInitialized,
  getIsInitialized,
  getStateCache,
  stateCacheSlice,
  getRoutes,
  removeRoute,
  getCurrentRoute,
  getIsOnline,
  setCurrentRoute,
  removeCurrentRoute,
  removeSetPasscodeRoute,
  login,
  logout,
  getAuthentication,
  setAuthentication,
  getCurrentOperation,
  setCurrentOperation,
  getToastMsg,
  setToastMsg,
  getQueueIncomingRequest,
  setPauseQueueIncomingRequest,
  setQueueIncomingRequest,
  dequeueIncomingRequest,
  enqueueIncomingRequest,
};
