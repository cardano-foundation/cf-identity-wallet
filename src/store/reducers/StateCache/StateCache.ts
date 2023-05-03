import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";

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
  currentRoute: CurrentRouteCacheProps;
  authentication: AuthenticationCacheProps;
}

const initialState: StateCacheProps = {
  currentRoute: {
    path: "",
    payload: undefined,
  },
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
      state.currentRoute = action.payload;
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

const getStateCache = (state: RootState) => state.stateCache;
const getCurrentRoute = (state: RootState) => state.stateCache.currentRoute;
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
  getStateCache,
  getCurrentRoute,
  getAuthentication,
};
