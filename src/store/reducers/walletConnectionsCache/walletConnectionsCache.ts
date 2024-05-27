import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  ConnectionData,
  WalletConnectState,
} from "./walletConnectionsCache.types";

const initialState: WalletConnectState = {
  walletConnections: [],
  connectedWallet: null,
  pendingConnection: null,
  pendingDAppMeerKat: null,
};
const walletConnectionsCacheSlice = createSlice({
  name: "walletConnectionsCache",
  initialState,
  reducers: {
    setWalletConnectionsCache: (
      state,
      action: PayloadAction<ConnectionData[]>
    ) => {
      state.walletConnections = action.payload;
    },
    setConnectedWallet: (
      state,
      action: PayloadAction<ConnectionData | null>
    ) => {
      state.connectedWallet = action.payload;
    },
    setPendingDAppMeerKat: (state, action: PayloadAction<string | null>) => {
      state.pendingDAppMeerKat = action.payload;
    },
    setPendingConnections: (
      state,
      action: PayloadAction<ConnectionData | null>
    ) => {
      state.pendingConnection = action.payload;
    },
  },
});

export { initialState, walletConnectionsCacheSlice };

export const {
  setWalletConnectionsCache,
  setConnectedWallet,
  setPendingConnections,
  setPendingDAppMeerKat,
} = walletConnectionsCacheSlice.actions;

const getWalletConnectionsCache = (state: RootState) =>
  state.walletConnectionsCache.walletConnections;

const getConnectedWallet = (state: RootState) =>
  state.walletConnectionsCache.connectedWallet;

const getPendingConnection = (state: RootState) =>
  state.walletConnectionsCache.pendingConnection;

const getPendingDAppMeerkat = (state: RootState) =>
  state.walletConnectionsCache.pendingDAppMeerKat;

export {
  getWalletConnectionsCache,
  getConnectedWallet,
  getPendingConnection,
  getPendingDAppMeerkat,
};
