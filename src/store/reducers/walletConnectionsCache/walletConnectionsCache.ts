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
  isConnecting: false,
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
    setPendingConnection: (
      state,
      action: PayloadAction<ConnectionData | null>
    ) => {
      if (state.pendingConnection?.id !== action.payload?.id) {
        state.isConnecting = false;
      }

      state.pendingConnection = action.payload;
    },
    setIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
  },
});

export { initialState, walletConnectionsCacheSlice };

export const {
  setWalletConnectionsCache,
  setConnectedWallet,
  setPendingConnection,
  setIsConnecting,
} = walletConnectionsCacheSlice.actions;

const getWalletConnectionsCache = (state: RootState) =>
  state.walletConnectionsCache.walletConnections;

const getConnectedWallet = (state: RootState) =>
  state.walletConnectionsCache?.connectedWallet;

const getPendingConnection = (state: RootState) =>
  state.walletConnectionsCache.pendingConnection;

const getIsConnecting = (state: RootState) =>
  state.walletConnectionsCache.isConnecting;

export {
  getWalletConnectionsCache,
  getConnectedWallet,
  getPendingConnection,
  getIsConnecting,
};
