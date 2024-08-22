import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../index";
import {
  getConnectedWallet,
  getIsConnecting,
  getPendingConnection,
  getWalletConnectionsCache,
  setConnectedWallet,
  setIsConnecting,
  setPendingConnection,
  setWalletConnectionsCache,
  walletConnectionsCacheSlice,
} from "./walletConnectionsCache";
import {
  ConnectionData,
  WalletConnectState,
} from "./walletConnectionsCache.types";

describe("walletConnectionsCacheSlice", () => {
  const initialState: WalletConnectState = {
    walletConnections: [],
    connectedWallet: null,
    pendingConnection: null,
    isConnecting: false,
  };

  it("should return the initial state", () => {
    expect(
      walletConnectionsCacheSlice.reducer(undefined, {} as PayloadAction)
    ).toEqual(initialState);
  });

  it("should handle setWalletConnectionsCache", () => {
    const connections: ConnectionData[] = [
      {
        id: "2",
        name: "Wallet name #2",
        selectedAid: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRc",
        url: "http://localhost:3001/",
      },
    ];
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setWalletConnectionsCache(connections)
    );
    expect(newState.walletConnections).toEqual(connections);
  });
  it("should handle setConnectedWallet", () => {
    const connection: ConnectionData = {
      id: "2",
      name: "Wallet name #2",
      selectedAid: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRc",
      url: "http://localhost:3001/",
    };
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setConnectedWallet(connection)
    );
    expect(newState.connectedWallet).toEqual(connection);
  });
  it("should handle setPendingConnection", () => {
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setPendingConnection({
        id: "pending-meerkat",
      })
    );
    expect(newState.pendingConnection?.id).toEqual("pending-meerkat");
  });
  it("should handle setIsConnecting", () => {
    const newState = walletConnectionsCacheSlice.reducer(
      initialState,
      setIsConnecting(true)
    );
    expect(newState.isConnecting).toEqual(true);
  });
});

describe("Get wallet connections cache", () => {
  it("should return the wallet connetions cache from RootState", () => {
    const state = {
      walletConnectionsCache: {
        walletConnections: [
          {
            id: "1",
            name: "Wallet name #1",
            selectedAid: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRd",
            image: "",
            url: "http://localhost:3001/",
          },
          {
            id: "2",
            name: "Wallet name #2",
            selectedAid: "EN5dwY0N7RKn6OcVrK7ksIniSgPcItCuBRax2JFUpuRc",
            url: "http://localhost:3001/",
          },
        ],
      },
    } as RootState;
    const connectionCache = getWalletConnectionsCache(state);
    expect(connectionCache).toEqual(
      state.walletConnectionsCache.walletConnections
    );
  });

  it("should return connected wallet from RootState", () => {
    const state = {
      walletConnectionsCache: {
        connectedWallet: {
          id: "1",
        },
      },
    } as RootState;
    const connectionCache = getConnectedWallet(state);
    expect(connectionCache).toEqual(
      state.walletConnectionsCache.connectedWallet
    );
  });
  it("should return pending DApp MeerKat from RootState", () => {
    const state = {
      walletConnectionsCache: {
        pendingConnection: {
          id: "pending-meerkat",
        },
      },
    } as RootState;
    const pendingMeerKatCache = getPendingConnection(state);
    expect(pendingMeerKatCache).toEqual(
      state.walletConnectionsCache.pendingConnection
    );
  });
  it("should get is connecting", () => {
    const state = {
      walletConnectionsCache: {
        isConnecting: false,
      },
    } as RootState;
    const pendingMeerKatCache = getIsConnecting(state);
    expect(pendingMeerKatCache).toEqual(
      state.walletConnectionsCache.isConnecting
    );
  });
});
