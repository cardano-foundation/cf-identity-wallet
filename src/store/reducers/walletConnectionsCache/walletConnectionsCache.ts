import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  ConnectionData,
  WalletConnectState,
} from "./walletConnectionsCache.types";

const initialState: WalletConnectState = {
  walletConnections: [],
  connectedWallet: null,
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
  },
});

export { initialState, walletConnectionsCacheSlice };

export const { setWalletConnectionsCache, setConnectedWallet } =
  walletConnectionsCacheSlice.actions;

const getWalletConnectionsCache = (state: RootState) =>
  state.walletConnectionsCache.walletConnections;

const getConnectedWallet = (state: RootState) =>
  state.walletConnectionsCache.connectedWallet;

export { getWalletConnectionsCache, getConnectedWallet };
